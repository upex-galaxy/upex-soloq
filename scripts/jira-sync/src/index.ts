// scripts/jira-sync/src/index.ts
import * as dotenv from 'dotenv';
import JiraClient from 'jira-client';
import * as fs from 'fs';
import * as path from 'path';

// Cargar variables de entorno desde .env si existen
// Ajusta la ruta a tu archivo .env en la raíz del proyecto
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') }); // Adjusted path

// =======================================================
// Configuración de Jira (desde variables de entorno)
// =======================================================
const JIRA_FULL_URL = process.env.JIRA_URL || 'https://your-jira-host.atlassian.net';
const JIRA_USERNAME = process.env.JIRA_USERNAME || 'your-email@example.com';
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN || 'your-api-token';
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY || 'UPD'; // Usamos el PROJECT_KEY que definimos

if (!JIRA_FULL_URL || !JIRA_USERNAME || !JIRA_API_TOKEN || !JIRA_PROJECT_KEY) {
  console.error(
    '❌ Error: Asegúrate de que JIRA_URL, JIRA_USERNAME, JIRA_API_TOKEN y JIRA_PROJECT_KEY estén definidos en tus variables de entorno.'
  );
  process.exit(1);
}

// Extraer host y protocolo de la URL completa
let JIRA_PROTOCOL = 'https';
let JIRA_HOST_PARSED = JIRA_FULL_URL;

try {
  const urlObj = new URL(JIRA_FULL_URL);
  JIRA_PROTOCOL = urlObj.protocol.replace(':', '');
  JIRA_HOST_PARSED = urlObj.host;
} catch (e) {
  console.error(
    `❌ Error al parsear JIRA_URL: ${JIRA_FULL_URL}. Asegúrate de que sea una URL válida.`
  );
  process.exit(1);
}

const jira = new JiraClient({
  protocol: JIRA_PROTOCOL,
  host: JIRA_HOST_PARSED,
  username: JIRA_USERNAME,
  password: JIRA_API_TOKEN,
  apiVersion: '2',
  strictSSL: true,
});

// =======================================================
// Rutas de los archivos locales del Product Backlog (PBI)
// =======================================================
const PBI_PATH = path.resolve(process.cwd(), '../../.context/PBI/epics');

// =======================================================
// IDs de Custom Fields de Jira (según pbi-product-backlog.md)
// =======================================================
const JIRA_CUSTOM_FIELDS = {
  ACCEPTANCE_CRITERIA: 'customfield_10201',
  BUSINESS_RULES: 'customfield_10202',
  SCOPE: 'customfield_10401',
  MOCKUP: 'customfield_10400',
  WORKFLOW: 'customfield_10500',
  STORY_POINTS: 'customfield_10028',
  WEBLINK: 'customfield_11600',
};

// =======================================================
// Función principal para sincronizar con Jira
// =======================================================
interface IssueData {
  title: string;
  description: string;
  priority: string;
  issueType: 'Epic' | 'Story';
  scope?: string;
  acceptanceCriteria?: string;
  businessRules?: string;
  storyPoints?: number;
  mockup?: string;
  workflow?: string;
  weblink?: string;
  jiraKey?: string; // Para actualizar, si ya existe
  epicLinkField?: string; // Solo para historias, el nombre del campo que linkea a la épica
}

const epicJiraKeyMap: Map<string, string> = new Map(); // Mapea ID local de épica a Jira Key real

async function syncPBIToJira() {
  console.log(`🚀 Iniciando sincronización del PBI con Jira para el proyecto: ${JIRA_PROJECT_KEY}`);
  console.log(`Verificando JIRA_URL cargado: ${process.env.JIRA_URL}`); // Debugging line
  console.log(`JIRA_HOST_PARSED: ${JIRA_HOST_PARSED}`);
  console.log(`JIRA_USERNAME: ${JIRA_USERNAME}`);
  console.log(`JIRA_API_TOKEN: ${JIRA_API_TOKEN ? '*** (loaded)' : ' (not loaded)'}`);
  console.log(`JIRA_PROJECT_KEY: ${JIRA_PROJECT_KEY}`);

  console.log(`Conectando a Jira en: ${JIRA_PROTOCOL}://${JIRA_HOST_PARSED}`);

  try {
    // Verificar conexión
    await jira.getCurrentUser();
    console.log('✅ Conexión con Jira exitosa.');

    // Obtener el nombre del campo para el enlace de la épica (varía entre instancias de Jira)
    // Esto es un placeholder; en una implementación real, se buscaría en los metadatos.
    const EPIC_LINK_FIELD_NAME = 'Epic Link'; // Nombre común del campo de Jira para vincular historias a épicas.
    // Ojo: Podría necesitar ser el ID real del campo (customfield_xxxx) si es un custom field de Jira.

    // 1. Procesar Épicas
    const epicDirs = fs
      .readdirSync(PBI_PATH, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('EPIC-'));

    for (const epicDir of epicDirs) {
      const epicLocalId = epicDir.name.split('-').slice(0, 3).join('-'); // Ej: EPIC-UPD-1
      const epicFilePath = path.join(PBI_PATH, epicDir.name, 'epic.md');
      if (fs.existsSync(epicFilePath)) {
        console.log(`\nProcesando Épica: ${epicDir.name}`);
        const epicData = parseMarkdownFile(epicFilePath, 'Epic');
        let jiraKey = epicData.jiraKey;

        if (!jiraKey) {
          // Crear nueva épica
          jiraKey = await createJiraEpic(epicData, JIRA_PROJECT_KEY, EPIC_LINK_FIELD_NAME);
        } else {
          // Actualizar épica existente (TODO: Implementar update)
          console.log(`Épica ${jiraKey} ya existe. Saltando actualización por ahora.`);
        }
        epicJiraKeyMap.set(epicLocalId, jiraKey);
      }
    }

    // 2. Procesar Historias
    for (const epicDir of epicDirs) {
      const epicLocalId = epicDir.name.split('-').slice(0, 3).join('-');
      const currentEpicJiraKey = epicJiraKeyMap.get(epicLocalId);

      if (!currentEpicJiraKey) {
        console.error(
          `❌ No se encontró Jira Key para la épica local ${epicLocalId}. Saltando sus historias.`
        );
        continue;
      }

      const storiesPath = path.join(PBI_PATH, epicDir.name, 'stories');
      if (fs.existsSync(storiesPath)) {
        const storyFiles = fs
          .readdirSync(storiesPath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('STORY-'))
          .map(dirent => path.join(storiesPath, dirent.name, 'story.md'));

        for (const storyFilePath of storyFiles) {
          console.log(`\nProcesando Historia: ${storyFilePath}`);
          const storyData = parseMarkdownFile(storyFilePath, 'Story');
          let jiraKey = storyData.jiraKey;

          if (!jiraKey) {
            // Crear nueva historia
            jiraKey = await createJiraStory(
              storyData,
              JIRA_PROJECT_KEY,
              currentEpicJiraKey,
              EPIC_LINK_FIELD_NAME
            );
          } else {
            // Actualizar historia existente (TODO: Implementar update)
            console.log(`Historia ${jiraKey} ya existe. Saltando actualización por ahora.`);
          }
        }
      }
    }

    console.log('\n✅ Sincronización completada.');
  } catch (error: any) {
    console.error('❌ Error durante la sincronización con Jira:', error.message);
    if (error.statusCode === 401) {
      console.error('   Verifica tu JIRA_USERNAME y JIRA_API_TOKEN. Credenciales inválidas.');
    } else if (error.statusCode === 403) {
      console.error(
        '   Verifica los permisos del usuario para crear/actualizar issues en el proyecto.'
      );
    } else if (error.message.includes('connect ECONNREFUSED')) {
      console.error('   Error de conexión. Asegúrate de que JIRA_URL sea accesible y correcto.');
    }
    process.exit(1);
  }
}

// =======================================================
// Funciones auxiliares para leer y parsear Markdown
// =======================================================

/**
 * Extrae contenido de una sección entre dos encabezados Markdown.
 * @param {string} markdown - Contenido completo del archivo Markdown.
 * @param {string} startHeading - Encabezado de inicio (ej: "## Scope").
 * @param {string} endHeading - Encabezado de fin (ej: "## Acceptance Criteria") o null si es la última sección.
 * @returns {string | null} - Contenido de la sección o null si no se encuentra.
 */
function extractSection(
  markdown: string,
  startHeading: string,
  endHeading: string | null = null
): string | null {
  const startIndex = markdown.indexOf(startHeading);
  if (startIndex === -1) return null;

  let endIndex: number;
  if (endHeading) {
    endIndex = markdown.indexOf(endHeading, startIndex + startHeading.length);
    if (endIndex === -1) endIndex = markdown.length; // Si el endHeading no se encuentra, va hasta el final
  } else {
    // Si no hay endHeading, buscar el siguiente encabezado de nivel superior o igual
    const nextHeadingRegex = /(^#+\s.*$)/gm;
    let match;
    const tempIndex = startIndex + startHeading.length;
    endIndex = markdown.length; // Por defecto, hasta el final del archivo

    while ((match = nextHeadingRegex.exec(markdown)) !== null) {
      if (match.index > startIndex) {
        // Encontró un encabezado después del de inicio
        endIndex = match.index;
        break;
      }
    }
  }

  // Extraer y limpiar el contenido
  let content = markdown.substring(startIndex + startHeading.length, endIndex).trim();

  // Eliminar comentarios HTML específicos de Jira Field
  content = content.replace(/<!-- Jira Field: customfield_\d+ \(.*\) -->/g, '').trim();

  return content || null;
}

/**
 * Lee y parsea un archivo Markdown de épica o historia.
 * @param {string} filePath - Ruta al archivo .md
 * @param {'Epic' | 'Story'} type - Tipo de issue ('Epic' o 'Story')
 * @returns {IssueData} - Objeto con los datos parseados.
 */
function parseMarkdownFile(filePath: string, type: 'Epic' | 'Story'): IssueData {
  const content = fs.readFileSync(filePath, 'utf8');

  const titleMatch = content.match(/^#\s(.+)$/m);
  const jiraKeyMatch = content.match(/\*\*Jira Key:\*\* (.+)$/m);
  const priorityMatch = content.match(/\*\*Priority:\*\* (.+)$/m);
  const storyPointsMatch = content.match(/\*\*Story Points:\*\* (\d+)$/m);

  const title = titleMatch ? titleMatch[1].trim() : path.basename(filePath);
  const jiraKey = jiraKeyMatch ? jiraKeyMatch[1].trim() : undefined;
  const priority = priorityMatch ? priorityMatch[1].trim() : 'Medium';
  const storyPoints = storyPointsMatch ? parseInt(storyPointsMatch[1]) : undefined;

  let description: string | null = null;
  let scope: string | null = null;
  let acceptanceCriteria: string | null = null;
  let businessRules: string | null = null;
  let workflow: string | null = null;
  const weblink: string | null = null;

  if (type === 'Epic') {
    description = extractSection(content, '## Epic Description', '## User Stories');
    scope = extractSection(content, '## Scope', '## Acceptance Criteria (Epic Level)');
    acceptanceCriteria = extractSection(
      content,
      '## Acceptance Criteria (Epic Level)',
      '## Related Functional Requirements'
    );
    // Otros campos para épicas si son relevantes para la descripción.
  } else {
    // Story
    description = extractSection(content, '## User Story', '## Scope');
    scope = extractSection(content, '## Scope', '## Acceptance Criteria (Gherkin format)');
    acceptanceCriteria = extractSection(
      content,
      '## Acceptance Criteria (Gherkin format)',
      '## Business Rules'
    );
    businessRules = extractSection(content, '## Business Rules', '## Workflow');
    workflow = extractSection(content, '## Workflow', '## Mockups/Wireframes');
    // TODO: Extraer Mockups/Wireframes si es necesario, o Weblink
  }

  // Limpiar descripciones para que Jira las acepte
  description = description ? description.replace(/<!--.*?-->/g, '').trim() : null;
  scope = scope ? scope.replace(/<!--.*?-->/g, '').trim() : null;
  acceptanceCriteria = acceptanceCriteria
    ? acceptanceCriteria.replace(/<!--.*?-->/g, '').trim()
    : null;
  businessRules = businessRules ? businessRules.replace(/<!--.*?-->/g, '').trim() : null;
  workflow = workflow ? workflow.replace(/<!--.*?-->/g, '').trim() : null;

  return {
    title,
    description: description || '',
    priority,
    issueType: type,
    jiraKey,
    scope: scope || undefined,
    acceptanceCriteria: acceptanceCriteria || undefined,
    businessRules: businessRules || undefined,
    workflow: workflow || undefined,
    storyPoints: storyPoints || undefined,
  };
}

/**
 * Crea o actualiza una Épica en Jira.
 * @param {IssueData} epicData - Datos de la épica.
 * @param {string} projectKey - Clave del proyecto de Jira.
 * @param {string} epicLinkFieldName - Nombre del campo de Jira para vincular historias a épicas.
 * @returns {Promise<string>} - Jira Key de la épica creada/actualizada.
 */
async function createJiraEpic(
  epicData: IssueData,
  projectKey: string,
  epicLinkFieldName: string
): Promise<string> {
  console.log(`Creando Épica en Jira: ${epicData.title}`);

  const fields: any = {
    project: { key: projectKey },
    summary: epicData.title,
    description: epicData.description,
    issuetype: { name: 'Epic' },
    // Campos personalizados para Epic
    [JIRA_CUSTOM_FIELDS.SCOPE]: epicData.scope,
    [JIRA_CUSTOM_FIELDS.ACCEPTANCE_CRITERIA]: epicData.acceptanceCriteria,
  };

  // Asegurarse de que el campo de Nombre de Épica (Epic Name) se configura
  // Este campo puede variar en ID/nombre dependiendo de la configuración de Jira.
  // Asumimos que es 'Epic Name' y lo configuramos con el summary.
  fields['customfield_10000'] = epicData.title; // El ID de 'Epic Name' suele ser customfield_10000

  const issue = await jira.addNewIssue({ fields });
  console.log(`Épica creada: ${issue.key}`);
  return issue.key;
}

/**
 * Crea o actualiza una Historia en Jira.
 * @param {IssueData} storyData - Datos de la historia.
 * @param {string} projectKey - Clave del proyecto de Jira.
 * @param {string} epicJiraKey - Jira Key de la épica padre.
 * @param {string} epicLinkFieldName - Nombre del campo de Jira para vincular historias a épicas.
 * @returns {Promise<string>} - Jira Key de la historia creada/actualizada.
 */
async function createJiraStory(
  storyData: IssueData,
  projectKey: string,
  epicJiraKey: string,
  epicLinkFieldName: string
): Promise<string> {
  console.log(`Creando Historia en Jira: ${storyData.title} para Épica ${epicJiraKey}`);

  const fields: any = {
    project: { key: projectKey },
    summary: storyData.title,
    description: storyData.description,
    issuetype: { name: 'Story' },
    priority: { name: storyData.priority },
    // Vincular a la épica
    [epicLinkFieldName]: epicJiraKey,
    // Campos personalizados
    [JIRA_CUSTOM_FIELDS.ACCEPTANCE_CRITERIA]: storyData.acceptanceCriteria,
    [JIRA_CUSTOM_FIELDS.SCOPE]: storyData.scope,
    [JIRA_CUSTOM_FIELDS.BUSINESS_RULES]: storyData.businessRules,
    [JIRA_CUSTOM_FIELDS.WORKFLOW]: storyData.workflow,
    [JIRA_CUSTOM_FIELDS.STORY_POINTS]: storyData.storyPoints,
    // Mockup y Weblink (si se implementa la extracción)
    // [JIRA_CUSTOM_FIELDS.MOCKUP]: storyData.mockup,
    // [JIRA_CUSTOM_FIELDS.WEBLINK]: storyData.weblink,
  };

  const issue = await jira.addNewIssue({ fields });
  console.log(`Historia creada: ${issue.key}`);
  return issue.key;
}

// =======================================================
// Ejecutar la función principal
// =======================================================
syncPBIToJira();
