# Actualizar Template - Guia de Uso (v4.0)

Esta guia explica como usar el script `update-template.js` (v4.0) para mantener tu proyecto sincronizado con el template de UPEX.

---

## Setup Inicial (una sola vez)

### 1. Instalar GitHub CLI

```bash
# Mac
brew install gh

# Windows
winget install GitHub.cli

# Linux (Ubuntu/Debian)
sudo apt install gh
```

### 2. Autenticarse en GitHub CLI

```bash
gh auth login
```

Selecciona:

- GitHub.com
- HTTPS
- Login with web browser
- Copia el codigo de 8 digitos
- Pegalo en el navegador

### 3. Verificar acceso al template

```bash
gh repo view upex-galaxy/ai-driven-project-starter
```

Si ves la info del repo, todo listo.

### 4. Instalar dependencias

```bash
bun install
```

### 5. Agregar script al package.json

```json
{
  "scripts": {
    "up": "bun cli/update-template.js"
  }
}
```

### 6. Agregar .backups al .gitignore

```
.backups
```

---

## Uso del Script

### Menu Interactivo (recomendado)

```bash
bun up
```

Abre un menu donde puedes seleccionar que actualizar:

- Todo (all)
- Prompts (.prompts/)
- Books (.books/) - Manuales para humanos
- Documentacion (docs/)
- Context (.context/)
- Templates MCP (templates/mcp/)
- Scripts de actualizacion
- CLI Tools (cli/) - Xray CLI
- VS Code (.vscode/)
- Husky (.husky/) - Git hooks
- Tooling - Archivos de configuracion
- Examples - Archivos de ejemplo

### Comandos Directos

```bash
bun up all                    # Actualiza todo
bun up prompts                # Menu para elegir fases
bun up books                  # Manuales (.books/)
bun up docs                   # Actualiza docs/
bun up context                # Actualiza .context/
bun up templates              # Actualiza templates/mcp/
bun up scripts                # Actualiza scripts
bun up cli                    # Actualiza CLI tools
bun up vscode                 # Actualiza .vscode/
bun up husky                  # Actualiza .husky/
bun up tooling                # Actualiza archivos de configuracion
bun up examples               # Actualiza archivos de ejemplo
bun up help                   # Muestra ayuda
bun up --rollback             # Restaura desde el ultimo backup
```

### Flags Globales

```bash
bun up all --dry-run          # Preview de cambios sin modificar archivos
bun up prompts --dry-run      # Preview solo para prompts
bun up --rollback             # Restaura desde el backup mas reciente
```

### Multiples Componentes

```bash
bun up prompts docs context   # Actualiza los 3 componentes
```

---

## Opciones para Prompts

Cuando usas `bun up prompts`, puedes especificar que fases actualizar:

### Por Rol (presets)

```bash
bun up prompts --rol qa       # Fases 5, 10, 11, 12 (Testing)
bun up prompts --rol qa-full  # Fases 4, 5, 10, 11, 12 (Testing + Specification)
bun up prompts --rol dev      # Fases 6, 7, 8 (Desarrollo)
bun up prompts --rol devops   # Fases 3, 9, 13, 14 (Infraestructura)
bun up prompts --rol po       # Fases 1, 2, 4 (Producto)
bun up prompts --rol setup    # Fases 1, 2, 3 (Setup inicial)
```

### Por Fases Especificas

```bash
bun up prompts --fase 5       # Solo fase 5
bun up prompts --fase 5,10,12 # Fases 5, 10 y 12
```

### Otras Opciones

```bash
bun up prompts --all          # Todas las fases (1-14) + standalone
bun up prompts --standalone   # Solo archivos standalone (git-flow, workflows)
```

---

## Roles Disponibles

| Rol       | Fases            | Descripcion                                        |
| --------- | ---------------- | -------------------------------------------------- |
| `qa`      | 5, 10, 11, 12    | Shift-Left, Exploratory, Documentation, Automation |
| `qa-full` | 4, 5, 10, 11, 12 | QA + Specification (contexto de negocio)           |
| `dev`     | 6, 7, 8          | Planning, Implementation, Code Review              |
| `devops`  | 3, 9, 13, 14     | Infrastructure, Staging, Production, Monitoring    |
| `po`      | 1, 2, 4          | Constitution, Architecture, Specification          |
| `setup`   | 1, 2, 3          | Fases sincronicas iniciales                        |

---

## Merge Inteligente

El script usa **merge inteligente**:

- **Solo actualiza archivos del template** - Si un archivo existe en el template, se actualiza
- **Preserva tus archivos** - Si creaste archivos/carpetas propios, no se tocan
- **No elimina nada** - Solo agrega o actualiza, nunca borra

### Ejemplo

Si tienes en `docs/testing/`:

```
docs/testing/
├── api/                 # Del template - SE ACTUALIZA
├── database/            # Del template - SE ACTUALIZA
├── automation/          # Del template - SE ACTUALIZA
├── mi-guia-custom.md    # Tuyo - NO SE TOCA
└── mis-tests/           # Tuyo - NO SE TOCA
```

---

## Dry Run (Preview)

El flag `--dry-run` permite previsualizar que archivos se sincronizarian **sin modificar nada** en tu proyecto. Es util para ver el alcance de una actualizacion antes de aplicarla.

### Uso

```bash
bun up all --dry-run          # Preview de todo
bun up prompts --dry-run      # Preview solo de prompts
bun up docs context --dry-run # Preview de docs y context
```

### Que muestra

- Cantidad de archivos por componente que se sincronizarian
- Total de archivos que cambiarian
- Componentes que no existen en el template (marcados como "No encontrado")

### Ejemplo de salida

```
🔍 DRY RUN — No se modificaran archivos

   Prompts (.prompts/)  →  Sincronizaria 42 archivos
   Context (.context/)  →  Sincronizaria 18 archivos
   Tooling  →  Sincronizaria 5 archivos de config

ℹ Total: 65 archivos se sincronizarian
ℹ Ejecuta sin --dry-run para aplicar los cambios.
```

---

## Rollback (Restaurar Backup)

El flag `--rollback` restaura tu proyecto desde el backup mas reciente. No necesitas buscar manualmente en `.backups/`.

### Uso

```bash
bun up --rollback
```

### Que hace

1. Lista los backups disponibles en `.backups/` (muestra hasta 5, con indicador del mas reciente)
2. Selecciona automaticamente el backup mas reciente
3. Restaura todos los archivos del backup a sus ubicaciones originales
4. Muestra cuantos archivos fueron restaurados

### Ejemplo de salida

```
🔄 Rollback desde Backup

ℹ Se encontraron 3 backups:
   update-2026-04-13-143022  (mas reciente)
   update-2026-04-12-091500
   update-2026-04-10-170845

▸ Restaurando desde: update-2026-04-13-143022
✓ Restaurados 65 archivos desde update-2026-04-13-143022
```

---

## Version Tracking

Despues de cada sincronizacion exitosa, el script registra metadata en `.template-version.json` en la raiz del proyecto.

### Que registra

| Campo                   | Descripcion                                         |
| ----------------------- | --------------------------------------------------- |
| `lastSync`              | Fecha y hora de la ultima sincronizacion (ISO 8601) |
| `templateCommit`        | Hash del commit del template que se uso             |
| `cliVersion`            | Version del CLI (`4.0`)                             |
| `syncedComponents`      | Lista de componentes que se sincronizaron           |
| `variableSystemVersion` | Indica que el proyecto usa el sistema de variables  |

### Ejemplo

```json
{
  "lastSync": "2026-04-13T14:30:22.000Z",
  "templateCommit": "abc1234",
  "cliVersion": "4.0",
  "syncedComponents": ["prompts", "context", "docs"],
  "variableSystemVersion": true
}
```

> **Nota**: Este archivo se puede commitear al repo. Es util para saber cuando fue la ultima vez que el proyecto se sincronizo con el template.

---

## Deteccion de Variables

Despues de cada sincronizacion, el script escanea los archivos sincronizados buscando placeholders `{{VARIABLE}}` que aun no han sido configurados en `CLAUDE.md`.

### Que hace

1. Lee la tabla de **Project Variables** en `CLAUDE.md`
2. Escanea `.prompts/`, `.context/guidelines/` y `docs/` buscando `{{VARIABLE}}`
3. Compara los valores en la tabla con patrones de placeholder (ej: `[`, `example`, `myproject`, `localhost`)
4. Muestra una tabla con el estado de cada variable

### Ejemplo de salida

```
⚠ Variables necesitan configuracion en CLAUDE.md:

   Variable                Usado en    Estado
   ────────────────────────────────────────────────
   {{PROJECT_NAME}}        12 archivos ⚠ Aun placeholder
   {{API_URL_STAGING}}     8 archivos  ⚠ Aun placeholder
   {{JIRA_URL}}            3 archivos  ✓ Configurado

ℹ Abre CLAUDE.md y completa la tabla de Project Variables.
ℹ O ejecuta este prompt en tu asistente IA:
   @.prompts/project-doc-setup.md
```

### Como resolver

Abre `CLAUDE.md`, busca la seccion **Project Variables** y reemplaza los valores de ejemplo con los valores reales de tu proyecto. Tambien puedes ejecutar `@.prompts/project-doc-setup.md` en tu asistente IA para configurarlos automaticamente.

---

## Deteccion de Migracion

Si tu proyecto fue creado con una version anterior del template (antes del sistema de variables), el script detecta esto automaticamente y muestra un banner de migracion.

### Cuando aparece

- Tu proyecto tiene `CLAUDE.md` pero **no** tiene la seccion `## Project Variables`
- No existe `.template-version.json` con `variableSystemVersion: true`

### Que muestra

```
╔══════════════════════════════════════════════════════════════╗
║                      UPGRADE NOTICE                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                            ║
║  Este template ahora usa Project Variables.                 ║
║  Todos los prompts usan {{VARIABLE}} placeholders que       ║
║  se resuelven desde tu configuracion en CLAUDE.md.           ║
║                                                            ║
║  DESPUES de que esta actualizacion termine, ejecuta:        ║
║                                                            ║
║    @.prompts/project-doc-setup.md                          ║
║                                                            ║
║  Esto actualizara tu CLAUDE.md con la nueva tabla de         ║
║  variables y lo configurara para tu proyecto.                ║
║                                                            ║
╚══════════════════════════════════════════════════════════════╝
```

### Que hacer

Despues de que la actualizacion termine, ejecuta el prompt `@.prompts/project-doc-setup.md` en tu asistente IA. Esto agregara la tabla de variables a tu `CLAUDE.md` y te guiara para llenarla con los valores de tu proyecto.

---

## Self-Update Mejorado

El script se auto-actualiza antes de cada sincronizacion. En la v4.0, el self-update muestra la transicion de versiones y advierte sobre cambios mayores.

### Que hace

- Compara tu version local del script con la version del template
- Muestra la transicion de version (ej: `v3.0 → v4.0`)
- Si detecta un **cambio de version mayor** (ej: `3.x → 4.x`), muestra una advertencia adicional para que revises posibles cambios incompatibles

### Ejemplo de salida

```
⚠ Cambio de version mayor detectado: v3.0 → v4.0
ℹ Revisa el changelog por posibles cambios incompatibles despues de esta actualizacion.
▸ Auto-actualizando update-template.js (v3.0 → v4.0)...
✓ update-template.js actualizado a v4.0
```

> **Nota**: El self-update ocurre automaticamente. No necesitas ejecutar ningun comando adicional.

---

## Que se Actualiza

### Se actualizan (merge)

| Componente               | Contenido                                                  |
| ------------------------ | ---------------------------------------------------------- |
| `.prompts/`              | Fases seleccionadas + archivos standalone                  |
| `.books/`                | Manuales para humanos (mismas fases que prompts)           |
| `docs/`                  | architectures/, methodology/, testing/, workflows/, setup/ |
| `.context/`              | system-prompt.md, README.md, guidelines/ (DEV, QA, TAE)    |
| `templates/mcp/`         | Todos los templates de configuracion MCP                   |
| `scripts/`               | jira-sync.ts                                               |
| `cli/`                   | update-template.js, resend.ts, sync-openapi.ts, xray/      |
| `context-engineering.md` | Documentacion de la arquitectura del template              |

### NO se tocan (tu trabajo)

| Directorio       | Descripcion                                |
| ---------------- | ------------------------------------------ |
| `.context/idea/` | Tu documentacion de negocio                |
| `.context/PRD/`  | Tus requerimientos de producto             |
| `.context/SRS/`  | Tus especificaciones tecnicas              |
| `.context/PBI/`  | Tu product backlog                         |
| `src/`           | Tu codigo                                  |
| `.env`           | Tus credenciales                           |
| Archivos propios | Cualquier archivo/carpeta que hayas creado |

---

## Sistema de Backups

Cada ejecucion crea un backup automatico:

- Formato: `.backups/update-YYYY-MM-DD-HHMMSS/`
- Los backups NO se sobrescriben, se acumulan
- Util para comparar versiones o revertir cambios

### Restaurar un Backup

La forma mas facil es usar el flag `--rollback`:

```bash
bun up --rollback             # Restaura desde el backup mas reciente
```

Si prefieres restaurar manualmente un backup especifico:

```bash
# Ver backups disponibles
ls -la .backups/

# Restaurar (reemplaza la fecha)
cp -r .backups/update-2026-XX-XX-XXXXXX/.prompts .
cp -r .backups/update-2026-XX-XX-XXXXXX/.books .
cp -r .backups/update-2026-XX-XX-XXXXXX/docs .
cp -r .backups/update-2026-XX-XX-XXXXXX/.context .
```

---

## Troubleshooting

### "gh: command not found"

```bash
# Instala GitHub CLI segun tu OS
brew install gh        # Mac
winget install GitHub.cli  # Windows
sudo apt install gh    # Linux
```

### "authentication required"

```bash
gh auth login
```

### "repository not found"

Verifica que tienes acceso al repositorio privado de UPEX Galaxy.

### "Cannot find module '@inquirer/prompts'"

```bash
bun install
# O especificamente:
bun add @inquirer/prompts
```

---

## Tips

- Usa `bun up` sin argumentos para el menu interactivo
- El script **preserva tus archivos personalizados**
- Los backups se guardan automaticamente
- Usa `bun up help` para ver todas las opciones
- Usa `--dry-run` antes de actualizar para ver que cambiaria sin riesgo
- Usa `--rollback` si algo salio mal — restaura el backup mas reciente en un paso
- Revisa `.template-version.json` para saber cuando fue tu ultima sincronizacion
- Si ves advertencias de variables, completa la tabla en `CLAUDE.md` o ejecuta `@.prompts/project-doc-setup.md`

---

**Ver tambien:**

- [Git Flow](./git-flow.md)
- [Environments](./environments.md)
