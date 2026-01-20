# Design System - SoloQ

## Resumen

Este documento describe el Design System de SoloQ, la plataforma de facturación para freelancers latinoamericanos.

**Stack:**

- Tailwind CSS v4
- shadcn/ui (New York style)
- Lucide Icons
- Next.js 16 App Router

---

## Paleta de Colores

### Primary: Azul Profesional

El azul transmite confianza, profesionalismo y seguridad - valores clave para una aplicación de facturación.

| Variable               | OKLCH                        | Uso                                    |
| ---------------------- | ---------------------------- | -------------------------------------- |
| `--primary`            | `oklch(0.623 0.214 259.815)` | Botones primarios, links, focus states |
| `--primary-foreground` | `oklch(0.985 0.002 247.858)` | Texto sobre primary                    |

**Clases Tailwind:**

- `bg-primary` - Fondo azul
- `text-primary` - Texto azul
- `border-primary` - Borde azul
- `ring-primary` - Focus ring azul

### Colores Semánticos

| Variable             | Light Mode | Dark Mode | Uso                          |
| -------------------- | ---------- | --------- | ---------------------------- |
| `--background`       | Blanco     | Slate 950 | Fondo de página              |
| `--foreground`       | Slate 900  | Slate 50  | Texto principal              |
| `--muted`            | Slate 100  | Slate 800 | Fondos secundarios           |
| `--muted-foreground` | Slate 500  | Slate 400 | Texto secundario             |
| `--destructive`      | Red 500    | Red 600   | Errores, acciones peligrosas |

### Colores del Sidebar

| Variable                      | Uso                        |
| ----------------------------- | -------------------------- |
| `--sidebar`                   | Fondo del sidebar          |
| `--sidebar-foreground`        | Texto del sidebar          |
| `--sidebar-accent`            | Highlight de items activos |
| `--sidebar-accent-foreground` | Texto de items activos     |

---

## Tipografía

### Font Family

```css
font-family:
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  Roboto,
  sans-serif;
```

Usamos la fuente del sistema para óptima legibilidad y performance.

### Tamaños de Texto

| Clase       | Tamaño | Uso                             |
| ----------- | ------ | ------------------------------- |
| `text-xs`   | 12px   | Labels, badges                  |
| `text-sm`   | 14px   | Texto secundario, descripciones |
| `text-base` | 16px   | Texto de cuerpo                 |
| `text-lg`   | 18px   | Subtítulos                      |
| `text-xl`   | 20px   | Títulos de sección              |
| `text-2xl`  | 24px   | Títulos de página               |
| `text-3xl`  | 30px   | Headlines                       |
| `text-4xl+` | 36px+  | Hero headlines                  |

### Pesos

- `font-normal` (400) - Texto de cuerpo
- `font-medium` (500) - Labels, buttons
- `font-semibold` (600) - Subtítulos
- `font-bold` (700) - Títulos

---

## Espaciado

### Border Radius (Estilo Moderno/Bold)

```css
--radius: 0.75rem; /* 12px */
```

| Variable       | Valor  | Uso                    |
| -------------- | ------ | ---------------------- |
| `rounded-sm`   | 8px    | Inputs pequeños        |
| `rounded-md`   | 10px   | Inputs, pequeños cards |
| `rounded-lg`   | 12px   | Cards, modals          |
| `rounded-xl`   | 16px   | Cards destacadas       |
| `rounded-full` | 9999px | Avatars, badges        |

### Padding & Margin

Usar múltiplos de 4px:

- `p-2` (8px) - Padding mínimo
- `p-4` (16px) - Padding estándar
- `p-6` (24px) - Padding generoso
- `p-8` (32px) - Secciones grandes

---

## Componentes UI (shadcn/ui)

### Componentes Instalados

| Componente    | Archivo                | Uso                         |
| ------------- | ---------------------- | --------------------------- |
| Button        | `ui/button.tsx`        | Acciones, CTAs              |
| Card          | `ui/card.tsx`          | Contenedores de información |
| Input         | `ui/input.tsx`         | Campos de texto             |
| Label         | `ui/label.tsx`         | Labels de formulario        |
| Select        | `ui/select.tsx`        | Dropdowns                   |
| Checkbox      | `ui/checkbox.tsx`      | Opciones múltiples          |
| Switch        | `ui/switch.tsx`        | Toggles                     |
| Dialog        | `ui/dialog.tsx`        | Modales                     |
| Sheet         | `ui/sheet.tsx`         | Drawers laterales           |
| Dropdown Menu | `ui/dropdown-menu.tsx` | Menús contextuales          |
| Tooltip       | `ui/tooltip.tsx`       | Hints de ayuda              |
| Badge         | `ui/badge.tsx`         | Etiquetas de estado         |
| Avatar        | `ui/avatar.tsx`        | Fotos de usuario            |
| Table         | `ui/table.tsx`         | Tablas de datos             |
| Tabs          | `ui/tabs.tsx`          | Navegación por pestañas     |
| Alert         | `ui/alert.tsx`         | Mensajes de alerta          |
| Skeleton      | `ui/skeleton.tsx`      | Loading states              |
| Form          | `ui/form.tsx`          | Formularios con validación  |
| Sidebar       | `ui/sidebar.tsx`       | Navegación lateral          |
| Breadcrumb    | `ui/breadcrumb.tsx`    | Navegación jerárquica       |
| Sonner        | `ui/sonner.tsx`        | Toasts/notificaciones       |

### Variantes de Button

```tsx
<Button variant="default">Primary</Button>     // Azul, acción principal
<Button variant="secondary">Secondary</Button> // Gris, acción secundaria
<Button variant="outline">Outline</Button>     // Borde, acción terciaria
<Button variant="ghost">Ghost</Button>         // Sin fondo, acción sutil
<Button variant="destructive">Delete</Button>  // Rojo, acción peligrosa
<Button variant="link">Link</Button>           // Como link de texto
```

### Variantes de Badge (Estados de Factura)

```tsx
// Para estados de factura, usar clases personalizadas:
<Badge className="bg-gray-100 text-gray-800">Borrador</Badge>
<Badge className="bg-blue-100 text-blue-800">Enviada</Badge>
<Badge className="bg-green-100 text-green-800">Pagada</Badge>
<Badge className="bg-red-100 text-red-800">Vencida</Badge>
<Badge className="bg-gray-100 text-gray-500">Cancelada</Badge>
```

---

## Layout Components

### AppSidebar (`components/layout/app-sidebar.tsx`)

Sidebar collapsible con:

- Logo SoloQ
- Navegación principal (Dashboard, Facturas, Clientes, Configuración)
- User menu con dropdown
- Estado persistido en cookies

```tsx
import { AppSidebar } from '@/components/layout/app-sidebar';

<SidebarProvider>
  <AppSidebar />
  <SidebarInset>{/* Content */}</SidebarInset>
</SidebarProvider>;
```

### SiteHeader (`components/layout/site-header.tsx`)

Header para páginas públicas (landing):

- Logo
- Navigation links
- Auth buttons

---

## Iconografía

Usamos **Lucide React** para iconos.

### Iconos Comunes

| Icono             | Uso                           |
| ----------------- | ----------------------------- |
| `FileText`        | Facturas, documentos          |
| `Users`           | Clientes                      |
| `LayoutDashboard` | Dashboard                     |
| `Settings`        | Configuración                 |
| `Plus`            | Crear nuevo                   |
| `ArrowRight`      | CTAs, navegación              |
| `DollarSign`      | Dinero, totales               |
| `Clock`           | Tiempo, pendiente             |
| `Bell`            | Notificaciones, recordatorios |
| `CheckCircle2`    | Completado, éxito             |
| `AlertTriangle`   | Advertencia, vencido          |

### Tamaños

- `h-4 w-4` - En buttons, inputs
- `h-5 w-5` - En listas
- `h-6 w-6` - En cards
- `h-8 w-8` - Destacados
- `h-12 w-12` - Empty states

---

## Patrones de Diseño

### Cards con Stats

```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
    <DollarSign className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">$2,450.00</div>
    <p className="text-xs text-muted-foreground">Facturas enviadas sin pagar</p>
  </CardContent>
</Card>
```

### Empty State

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
  <h3 className="text-lg font-medium">No hay facturas aún</h3>
  <p className="text-muted-foreground mb-4">Crea tu primera factura para comenzar.</p>
  <Button asChild>
    <Link href="/invoices/create">
      <Plus className="mr-2 h-4 w-4" />
      Crear Primera Factura
    </Link>
  </Button>
</div>
```

### Page Header

```tsx
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1 className="text-3xl font-bold tracking-tight">Título</h1>
    <p className="text-muted-foreground">Descripción breve</p>
  </div>
  <Button asChild>
    <Link href="/create">
      <Plus className="mr-2 h-4 w-4" />
      Acción Principal
    </Link>
  </Button>
</div>
```

---

## Responsive Design

### Breakpoints

| Prefix | Min Width | Uso               |
| ------ | --------- | ----------------- |
| `sm`   | 640px     | Mobile landscape  |
| `md`   | 768px     | Tablets           |
| `lg`   | 1024px    | Desktop           |
| `xl`   | 1280px    | Desktop grande    |
| `2xl`  | 1536px    | Pantallas amplias |

### Grid Patterns

```tsx
// Stats cards: 1 col mobile, 2 md, 4 lg
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

// Features: 1 col mobile, 3 md
<div className="grid gap-8 md:grid-cols-3">

// Two columns con contenido
<div className="grid gap-12 lg:grid-cols-2 items-center">
```

---

## Utilidades

### Función cn()

Para merge de clases Tailwind:

```tsx
import { cn } from "@/lib/utils"

<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  className
)}>
```

### Type Helpers

```tsx
import type { Invoice, InvoiceStatus, Client } from "@/lib/types"

// Usar en componentes
const invoice: Invoice = ...
const status: InvoiceStatus = "sent"
```

---

## Accesibilidad

- Todos los inputs tienen labels asociados
- Focus visible en todos los elementos interactivos
- Contraste de colores WCAG AA
- Keyboard navigation completa
- Screen reader friendly

---

## Archivos de Referencia

| Archivo                   | Descripción             |
| ------------------------- | ----------------------- |
| `src/app/globals.css`     | Variables CSS, tema     |
| `components.json`         | Configuración shadcn/ui |
| `src/lib/utils.ts`        | Función cn()            |
| `src/lib/types.ts`        | Type helpers            |
| `src/components/ui/*`     | Componentes shadcn/ui   |
| `src/components/layout/*` | Layout components       |
