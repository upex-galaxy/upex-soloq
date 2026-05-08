#!/usr/bin/env bun
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

// =========== VARIABLES DE ENTORNO ============
// Bun carga automáticamente el archivo .env del directorio actual
const { MCP_CATALOG_FILE, MCP_FILE, AI_COMMAND_PATH } = process.env;
// Validar variables de entorno críticas (AI_COMMAND_PATH es opcional)
if (!MCP_CATALOG_FILE || !MCP_FILE) {
  console.error('❌ Faltan variables de entorno necesarias en .env: MCP_CATALOG_FILE, MCP_FILE');
  process.exit(1);
}

// ============ CONFIGURACIÓN ============
const mcpCatalogFile = path.join(process.cwd(), MCP_CATALOG_FILE);
const mcpFile = path.join(process.cwd(), MCP_FILE);
const aiCommandPath = AI_COMMAND_PATH;
const codeAgentName = aiCommandPath ? path.basename(aiCommandPath) : null;

const MCP_CHECKS = {
  atlassian: {
    critical: true,
    requirements: [
      { key: 'JIRA_URL', path: ['environment', 'JIRA_URL'] },
      { key: 'JIRA_USERNAME', path: ['environment', 'JIRA_USERNAME'] },
      { key: 'JIRA_API_TOKEN', path: ['environment', 'JIRA_API_TOKEN'] },
    ],
  },
  github: {
    critical: true,
    requirements: [
      { key: 'GITHUB_TOKEN', path: ['headers', 'Authorization'] },
    ],
  },
  supabase: {
    critical: true,
    requirements: [
      { key: 'SUPABASE_ACCESS_TOKEN', path: ['environment', 'SUPABASE_ACCESS_TOKEN'] },
    ],
  },
  vercel: {
    critical: false,
    requirements: [],
  },
  tavily: {
    critical: false,
    requirements: [],
  },
  postman: {
    critical: false,
    requirements: [
      { key: 'POSTMAN_API_KEY', path: ['environment', 'POSTMAN_API_KEY'] },
    ],
  },
};

// Perfiles predefinidos (refinados según tus sugerencias)
const PROFILES = {
  backend: ['supabase', 'context7', 'tavily'],
  frontend: ['playwright', 'context7', 'tavily'],
  report: ['github', 'atlassian', 'slack'],
  docs: ['notion', 'context7', 'tavily'],
  uitest: ['playwright', 'context7', 'tavily'],
  debug: ['tavily'],
  apitest: ['postman', 'openapi', 'context7', 'tavily'],
  dbtest: ['sql', 'context7'],
  qatest: ['playwright', 'postman', 'openapi', 'sql', 'atlassian', 'tavily'],
  e2etest: ['playwright', 'postman', 'supabase', 'context7'],
  full: 'ALL', // Marcador especial: carga TODOS los MCPs del catálogo
};

// ============ FUNCIONES ============

function loadCatalog() {
  if (!fs.existsSync(mcpCatalogFile)) {
    console.error(`❌ No encontré ${mcpCatalogFile}`);
    console.error('💡 Crea el archivo con tus MCPs disponibles');
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(mcpCatalogFile, 'utf8');
    const config = JSON.parse(content);
    const rootKey = config.mcpServers ? 'mcpServers' : config.mcp ? 'mcp' : null;

    if (!rootKey) {
      throw new Error('no tiene mcpServers ni mcp');
    }

    return { config, rootKey };
  }
  catch (error) {
    console.error(`❌ Error al leer ${mcpCatalogFile}:`, error.message);
    process.exit(1);
  }
}

function loadJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  catch (error) {
    throw new Error(`No pude leer ${filePath}: ${error.message}`);
  }
}

function getServerMap(config) {
  return config?.mcpServers || config?.mcp || null;
}

function getValueAtPath(obj, pathParts) {
  return pathParts.reduce((acc, part) => acc?.[part], obj);
}

function isResolvedValue(value) {
  if (typeof value !== 'string') {
    return Boolean(value);
  }

  const trimmed = value.trim();
  return trimmed.length > 0 && !trimmed.includes('{env:');
}

function resolveCheckConfig() {
  const candidates = [
    mcpFile,
    path.join(process.cwd(), 'opencode.json'),
    path.join(process.cwd(), '.mcp.json'),
    mcpCatalogFile,
  ];

  for (const candidate of candidates) {
    const config = loadJsonIfExists(candidate);
    if (config && getServerMap(config)) {
      return { config, source: candidate };
    }
  }

  return { config: null, source: null };
}

function getCatalogServers(catalog) {
  return getServerMap(catalog?.config || catalog) || {};
}

function runChecks() {
  const { config, source } = resolveCheckConfig();
  const targets = ['atlassian', 'github', 'supabase', 'vercel', 'tavily', 'postman'];
  let hasFailures = false;

  console.log('🔎 Verificando MCPs críticos...\n');

  if (source && source !== mcpFile) {
    console.log(`ℹ️  Usando config de referencia: ${source}\n`);
  }

  if (!loadJsonIfExists(mcpFile)) {
    console.log(`⚠️  No existe el archivo activo esperado: ${mcpFile}`);
  }

  if (!config) {
    console.log(`❌ No encontré un archivo MCP válido para verificar.`);
    process.exitCode = 1;
    return;
  }

  for (const name of targets) {
    const servers = getServerMap(config);
    const activeEntry = servers?.[name];
    const { critical, requirements } = MCP_CHECKS[name];
    const enabled = activeEntry?.enabled !== false;

    if (!activeEntry || !enabled) {
      const state = critical ? 'disabled' : 'optional-disabled';
      console.log(`MCP: ${name}`);
      console.log(`  estado: ${state}`);
      console.log('  detalle: no está activo en la config\n');
      continue;
    }

    if (name === 'tavily') {
      console.log(`MCP: ${name}`);

      if (!isResolvedValue(process.env.TAVILY_API_KEY)) {
        console.log('  estado: warning-missing-env');
        console.log('  detalle: falta TAVILY_API_KEY\n');
        continue;
      }

      console.log('  estado: ok');
      console.log('  detalle: config y variables listos\n');
      continue;
    }

    const missing = requirements.filter(({ key, path }) => {
      const configValue = getValueAtPath(activeEntry, path);
      const envValue = process.env[key];
      return !isResolvedValue(configValue) && !isResolvedValue(envValue);
    });

    console.log(`MCP: ${name}`);

    if (missing.length > 0) {
      console.log(`  estado: ${critical ? 'missing-env' : 'warning-missing-env'}`);
      console.log(`  detalle: faltan ${missing.map((item) => item.key).join(', ')}\n`);
      if (critical) {
        hasFailures = true;
      }
      continue;
    }

    console.log('  estado: ok');
    console.log('  detalle: config y variables listos\n');
  }

  if (hasFailures) {
    process.exitCode = 1;
    console.log('❌ Hay problemas en la configuración MCP.');
  }
  else {
    console.log('✅ MCP críticos verificados.');
  }
}

function parseArgs(catalog) {
  const args = process.argv.slice(2);

  // Caso sin argumentos = generar config vacío
  if (args.length === 0) {
    console.log('⚠️  No se especificaron MCPs. Usa un perfil o lista explícita.');
    return null;
  }

  const input = args[0];

  // Caso especial: full = todos los MCPs
  if (input === 'full') {
    const allMcps = Object.keys(getCatalogServers(catalog));
    console.log('\n⚠️  ADVERTENCIA: Usando perfil "full"');
    console.log('📊 Esto carga TODOS los MCPs disponibles en el catálogo');
    console.log(
      '💡 Consume muchos tokens. Considera usar perfiles específicos (backend, frontend, etc.)',
    );
    console.log(`📈 Total de MCPs a cargar: ${allMcps.length}\n`);
    return allMcps;
  }

  // ¿Es un perfil predefinido?
  if (PROFILES[input]) {
    const profile = PROFILES[input];
    if (profile === 'ALL') {
      // Esto no debería pasar porque ya manejamos 'full' arriba, pero por seguridad
      return Object.keys(getCatalogServers(catalog));
    }
    return profile;
  }

  // ¿Es lista de MCPs separados por coma?
  const mcps = input.split(',').map(m => m.trim());

  // Validar que TODOS existen
  const servers = getCatalogServers(catalog);
  const invalid = mcps.filter(m => !servers[m]);
  if (invalid.length > 0) {
    console.error('❌ MCPs inválidos:', invalid.join(', '));
    console.log('\n🔧 MCPs disponibles:', Object.keys(servers).join(', '));
    process.exit(1);
  }

  return mcps;
}

function generateMcpJson(selectedMcps, catalog) {
  const mcpServers = {};
  const servers = getCatalogServers(catalog);
  const rootKey = catalog.rootKey || 'mcpServers';
  const isOpenCodeTarget = path.basename(mcpFile).toLowerCase() === 'opencode.json';

  // Si no hay MCPs seleccionados, generar vacío
  if (selectedMcps.length === 0) {
    const emptyConfig = { [rootKey]: {} };

    if (isOpenCodeTarget) {
      const current = loadJsonIfExists(mcpFile) || {};
      current[rootKey] = {};
      fs.writeFileSync(mcpFile, JSON.stringify(current, null, 2), 'utf8');
    }
    else {
      fs.writeFileSync(mcpFile, JSON.stringify(emptyConfig, null, 2), 'utf8');
    }

    console.log(`✅ ${MCP_FILE} generado (vacío)`);
    return;
  }

  // Construir objeto mcpServers con solo los seleccionados
  selectedMcps.forEach((name) => {
    mcpServers[name] = servers[name];
  });

  const config = { [rootKey]: mcpServers };

  // Escribir config activa MCP
  // Si el target es opencode.json, preservamos claves no-MCP como $schema/plugin.
  if (isOpenCodeTarget) {
    const current = loadJsonIfExists(mcpFile) || {};
    current[rootKey] = mcpServers;
    fs.writeFileSync(mcpFile, JSON.stringify(current, null, 2), 'utf8');
  }
  else {
    fs.writeFileSync(mcpFile, JSON.stringify(config, null, 2), 'utf8');
  }

  console.log(`✅ ${MCP_FILE} generado`);
  console.log(`📊 MCPs activos: ${selectedMcps.join(', ')}`);
  console.log(`📈 Total: ${selectedMcps.length} MCPs`);
}

function startCodeAgentCLI() {
  if (!aiCommandPath) {
    console.log('\n💡 AI_COMMAND_PATH no configurado. Debes lanzar tu CLI manualmente.');
    console.log('📝 Ejecuta tu herramienta favorita (gemini, claude, cursor, etc.)\n');
    return;
  }

  console.log(`\n🚀 Iniciando ${codeAgentName}...\n`);
  console.log('─'.repeat(50));

  const codeAgent = spawn(aiCommandPath, [], {
    stdio: 'inherit',
    shell: true,
  });

  codeAgent.on('error', (err) => {
    console.error(`\n❌ Error al iniciar ${codeAgentName}:`, err.message);
    process.exit(1);
  });
}

// ============ MAIN ============
function main() {
  console.log('🔧 MCP Builder\n');

  const input = process.argv.slice(2)[0];

  if (input === 'check') {
    runChecks();
    return;
  }

  const catalog = loadCatalog();
  const selectedMcps = parseArgs(catalog);

  if (selectedMcps === null) {
    process.exitCode = 1;
    return;
  }

  generateMcpJson(selectedMcps, catalog);
  startCodeAgentCLI();
}

try {
  main();
}
catch (error) {
  console.error('❌ Error inesperado:', error.message);
  process.exit(1);
}
