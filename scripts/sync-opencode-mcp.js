#!/usr/bin/env bun
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const MCP_SOURCE_FILE = path.join(ROOT, '.mcp.json');
const MCP_CATALOG_FILE = path.join(ROOT, '.mcp.catalog.json');
const OPENCODE_FILE = path.join(ROOT, 'opencode.json');

const EXTRA_FROM_CATALOG = [
  'github',
  'devtools',
  'sentry',
  'shadcn',
  'supabase',
  'vercel',
  'slack',
];

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`No encontré el archivo: ${path.basename(filePath)}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getMcpMap(config) {
  if (config?.mcp && typeof config.mcp === 'object') {
    return config.mcp;
  }
  if (config?.mcpServers && typeof config.mcpServers === 'object') {
    return config.mcpServers;
  }
  return null;
}

function main() {
  const source = readJson(MCP_SOURCE_FILE);
  const catalog = readJson(MCP_CATALOG_FILE);
  const opencode = readJson(OPENCODE_FILE);

  const sourceMcp = getMcpMap(source);
  const catalogMcp = getMcpMap(catalog);

  if (!sourceMcp) {
    throw new Error('.mcp.json no tiene bloque "mcp" o "mcpServers" válido');
  }
  if (!catalogMcp) {
    throw new Error('.mcp.catalog.json no tiene bloque "mcp" o "mcpServers" válido');
  }

  const currentMcp = getMcpMap(opencode) || {};
  const nextMcp = { ...currentMcp };

  const syncedFromSource = [];
  Object.entries(sourceMcp).forEach(([name, config]) => {
    nextMcp[name] = config;
    syncedFromSource.push(name);
  });

  const syncedFromCatalog = [];
  const missingFromCatalog = [];
  EXTRA_FROM_CATALOG.forEach((name) => {
    if (catalogMcp[name]) {
      nextMcp[name] = catalogMcp[name];
      syncedFromCatalog.push(name);
    }
    else {
      missingFromCatalog.push(name);
    }
  });

  opencode.mcp = nextMcp;
  fs.writeFileSync(OPENCODE_FILE, `${JSON.stringify(opencode, null, 2)}\n`, 'utf8');

  console.log('✅ opencode.json sincronizado');
  console.log(`📥 Desde .mcp.json: ${syncedFromSource.join(', ') || '(ninguno)'}`);
  console.log(`📦 Desde catálogo: ${syncedFromCatalog.join(', ') || '(ninguno)'}`);
  if (missingFromCatalog.length > 0) {
    console.log(`⚠️ No encontrados en catálogo: ${missingFromCatalog.join(', ')}`);
  }
}

try {
  main();
}
catch (error) {
  console.error(`❌ ${error.message}`);
  process.exit(1);
}
