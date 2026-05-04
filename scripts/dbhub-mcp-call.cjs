#!/usr/bin/env node

const { spawn } = require('node:child_process');

function encodeMessage(message) {
  const payload = JSON.stringify(message);
  return `Content-Length: ${Buffer.byteLength(payload, 'utf8')}\r\n\r\n${payload}`;
}

function createParser(onMessage) {
  let buffer = Buffer.alloc(0);

  return chunk => {
    buffer = Buffer.concat([buffer, chunk]);

    while (true) {
      const headerEnd = buffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) {
        return;
      }

      const headerText = buffer.slice(0, headerEnd).toString('utf8');
      const lengthHeader = headerText
        .split('\r\n')
        .find(line => line.toLowerCase().startsWith('content-length:'));

      if (!lengthHeader) {
        throw new Error('Missing Content-Length header from MCP server');
      }

      const contentLength = Number(lengthHeader.split(':')[1].trim());
      const bodyStart = headerEnd + 4;
      const totalLength = bodyStart + contentLength;

      if (buffer.length < totalLength) {
        return;
      }

      const body = buffer.slice(bodyStart, totalLength).toString('utf8');
      buffer = buffer.slice(totalLength);
      onMessage(JSON.parse(body));
    }
  };
}

async function main() {
  const sql = process.argv.slice(2).join(' ').trim();
  if (!sql) {
    console.error('Usage: node scripts/dbhub-mcp-call.cjs "SELECT 1"');
    process.exit(1);
  }

  const spawnCommand =
    process.platform === 'win32'
      ? {
          command: 'cmd.exe',
          args: ['/c', 'npx', '-y', '@bytebase/dbhub@latest', '--config', 'dbhub.toml'],
        }
      : { command: 'npx', args: ['-y', '@bytebase/dbhub@latest', '--config', 'dbhub.toml'] };

  const child = spawn(spawnCommand.command, spawnCommand.args, {
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true,
  });

  child.stderr.on('data', chunk => {
    const text = chunk.toString('utf8');
    if (text.trim()) {
      process.stderr.write(text);
    }
  });

  let nextId = 1;
  const pending = new Map();

  const parser = createParser(message => {
    if (typeof message.id === 'number' && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);

      if (message.error) {
        reject(new Error(message.error.message || 'Unknown MCP error'));
      } else {
        resolve(message.result);
      }
    }
  });

  child.stdout.on('data', parser);

  function request(method, params) {
    const id = nextId++;
    const payload = { jsonrpc: '2.0', id, method, params };

    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      child.stdin.write(encodeMessage(payload));
    });
  }

  function notify(method, params) {
    const payload = { jsonrpc: '2.0', method, params };
    child.stdin.write(encodeMessage(payload));
  }

  try {
    await request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'dbhub-cli-client', version: '1.0.0' },
    });

    notify('notifications/initialized', {});

    const tools = await request('tools/list', {});
    const hasExecuteSql = (tools?.tools || []).some(tool => tool.name === 'execute_sql');
    if (!hasExecuteSql) {
      throw new Error('execute_sql tool is not available in DBHub MCP');
    }

    const result = await request('tools/call', {
      name: 'execute_sql',
      arguments: {
        source: 'soloq',
        sql,
      },
    });

    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    console.error(`DBHub MCP call failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    child.kill();
  }
}

main();
