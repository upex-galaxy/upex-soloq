# Factura Module - Technical Documentation

## Live PDF Preview Invoice Generator

A client-side invoice generation system built with **Next.js 15 (App Router)** and **React 19** that renders professional PDF invoices with **real-time preview** as the user fills out form fields. The core technical achievement is debounced PDF regeneration using `@react-pdf/renderer`, rendered in a browser iframe via Object URLs.

### Two Invoice Modes

| Mode | Theme | Use Case | Items |
|------|-------|----------|-------|
| **UPEX** | Purple (Indigo `#6366f1`) | Company invoices for customers | Multi-item (add/remove line items) |
| **Contractor** | Teal (`#14b8a6`) | Independent contractor invoices | Single service |

---

## 1. Architecture

### 1.1 File Structure

```
app/admin/factura/
├── page.tsx                           # Main page - state owner, mode switching, order auto-fill
└── components/
    ├── types.ts                       # All types, constants, validation, utilities
    ├── InvoiceForm.tsx                # UPEX multi-item form
    ├── InvoiceDocument.tsx            # UPEX PDF layout (@react-pdf/renderer)
    ├── InvoicePreview.tsx             # UPEX live preview (debounce + PDF generation + iframe)
    ├── ContractorInvoiceForm.tsx      # Contractor single-service form
    ├── ContractorInvoiceDocument.tsx  # Contractor PDF layout
    ├── ContractorInvoicePreview.tsx   # Contractor live preview
    └── OrderSearchModal.tsx           # Supabase order lookup + auto-fill (UPEX only)
```

### 1.2 Component Relationship Diagram

```
page.tsx (state owner)
  |
  |-- manages: invoiceData (InvoiceData) & contractorData (ContractorInvoiceData)
  |-- mode switching via Tabs component
  |
  |-- [UPEX mode]
  |   |-- InvoiceForm(data, onChange)           --> calls onChange on every field edit
  |   |-- InvoicePreview(data)                  --> debounces, generates PDF, renders iframe
  |   |     └── InvoiceDocument(data)           --> react-pdf Document component (used inside pdf() API)
  |   |-- OrderSearchModal(open, onClose, onSelectOrder) --> auto-fills invoiceData from DB
  |
  |-- [Contractor mode]
      |-- ContractorInvoiceForm(data, onChange)
      |-- ContractorInvoicePreview(data)
            └── ContractorInvoiceDocument(data)
```

### 1.3 The Form-Document-Preview Triad Pattern

Each invoice mode uses three specialized components:

1. **Form** — Handles user input via standard React form controls. Calls `onChange(updatedData)` on every field change, lifting state to the parent page.

2. **Document** — Defines the PDF layout using `@react-pdf/renderer` primitives (`Document`, `Page`, `View`, `Text`, `StyleSheet`). These components **cannot** render in the browser DOM; they only render inside the react-pdf engine.

3. **Preview** — Bridges the gap between the form data and the PDF. It debounces the incoming data, calls `pdf(<Document data={...} />).toBlob()` to generate a PDF Blob, creates an Object URL, and renders it in an `<iframe>`.

This separation exists because react-pdf components are not DOM-renderable. The Preview component orchestrates the async PDF generation pipeline.

---

## 2. Dependencies

| Package | Version | Role |
|---------|---------|------|
| `@react-pdf/renderer` | `^4.3.2` | Core PDF generation engine. Provides `Document`, `Page`, `View`, `Text`, `StyleSheet`, and `pdf()` API |
| `next` | `15.3.8` | Framework (App Router, dynamic imports for code-splitting) |
| `react` | `^19` | UI framework |
| `@radix-ui/react-dialog` | `1.1.4` | OrderSearchModal dialog primitive |
| `@radix-ui/react-select` | `2.1.4` | Dropdown select components |
| `@radix-ui/react-tabs` | - | Mode switching tabs (UPEX/Contractor) |
| `@radix-ui/react-label` | `2.1.1` | Form label primitives |
| `lucide-react` | `^0.454.0` | Icon library (Download, Loader2, FileText, etc.) |
| `tailwindcss` | `^3.4.17` | Utility-first CSS styling |
| `@supabase/supabase-js` | `^2.56.0` | Database client for OrderSearchModal |

> **Note on shadcn/ui**: The Radix primitives above are wrapped in styled components at `@/components/ui/*` (Button, Input, Label, Textarea, Select, Dialog, Tabs). These are shadcn/ui-style components — Radix headless primitives + Tailwind styling.

---

## 3. Data Types and Utilities

### 3.1 Core Interfaces

```typescript
/**
 * Individual item in an invoice
 */
interface InvoiceItem {
  id: string;        // crypto.randomUUID()
  description: string;
  quantity: number;
  unitPrice: number;
}

/**
 * Complete UPEX invoice data structure
 */
interface InvoiceData {
  // Invoice info
  invoiceNumber: string;    // Format: UPEX-2025-001
  invoiceDate: string;      // ISO date string (YYYY-MM-DD)

  // Client info
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientCountry: string;
  clientTaxIdType: TaxIdType | '';
  clientTaxId: string;

  // Items
  items: InvoiceItem[];

  // Financial
  subtotal: number;
  discount: number;
  total: number;

  // Payment - ID from payment-methods.json
  paymentMethodId: string;

  // Notes
  notes: string;
}

/**
 * Contractor invoice data structure (simplified - single service)
 */
interface ContractorInvoiceData {
  invoiceNumber: string;         // Format: INV-2025-001
  invoiceDate: string;           // ISO date string
  clientCompanyName: string;
  clientCompanyAddress: string;
  serviceDescription: string;
  servicePeriod: string;         // e.g. "January 2025" or "Q1 2025"
  serviceAmount: number;
  paymentMethodId: string;       // ID from payment-methods.json
  notes: string;
}

/**
 * Invoice mode selector
 */
type InvoiceMode = 'upex' | 'contractor';
```

### 3.2 Tax ID Types

Comprehensive support for 18 international tax ID formats, organized by category:

```typescript
type TaxIdType =
  // Business
  | 'EIN'      // USA - Employer Identification Number (XX-XXXXXXX)
  | 'VAT'      // Europe - Value Added Tax
  | 'RIF'      // Venezuela
  | 'CUIT'     // Argentina - Empresa (XX-XXXXXXXX-X)
  | 'RFC'      // Mexico
  | 'RUT'      // Chile (XX.XXX.XXX-X)
  | 'RUC'      // Peru/Ecuador
  | 'NIT'      // Colombia/Guatemala
  | 'CNPJ'     // Brazil - Empresa
  // Personal
  | 'DNI'      // Spain
  | 'NIE'      // Spain - Foreigners
  | 'CEDULA'   // Latin America
  | 'CUIL'     // Argentina - Personal
  | 'CPF'      // Brazil - Personal
  | 'SSN'      // USA - Social Security
  | 'DUI'      // El Salvador
  | 'PASSPORT' // International
  | 'OTHER';

// Each type has metadata for validation:
interface TaxIdMeta {
  label: string;
  country: string;
  pattern: RegExp;       // Regex for validation
  placeholder: string;   // Input placeholder example
  formatHint: string;    // Shown when validation fails
  category: 'business' | 'personal';
}

// Full record with all 18 types:
const TAX_ID_TYPES: Record<TaxIdType, TaxIdMeta> = {
  EIN: {
    label: 'EIN',
    country: 'USA',
    pattern: /^\d{2}-\d{7}$/,
    placeholder: '12-3456789',
    formatHint: 'Formato: XX-XXXXXXX',
    category: 'business',
  },
  CUIT: {
    label: 'CUIT',
    country: 'Argentina',
    pattern: /^\d{2}-\d{8}-\d$/,
    placeholder: '30-12345678-9',
    formatHint: 'Formato: XX-XXXXXXXX-X',
    category: 'business',
  },
  // ... (16 more types with same structure)
};
```

### 3.3 Payment Method Types

```typescript
type PaymentMethodCategory =
  | 'bank_transfer'
  | 'international_transfer'
  | 'digital_wallet'
  | 'cryptocurrency'
  | 'card';

interface PaymentMethodData {
  id: string;                        // e.g. 'binance', 'lead_bank_wire'
  name: string;                      // Display name with emoji
  type: PaymentMethodCategory;
  icon: string;                      // Emoji icon
  priority: number;
  data: {
    bank?: string;
    accountType?: string;
    accountNumber?: string;
    accountHolder?: string;
    bankAddress?: string;
    currency?: string;
    iban?: string;
    bic?: string;
    routingNumber?: string;
    email?: string;
    username?: string;
    address?: string;                // Crypto wallet address
    network?: string;                // Crypto network
    instructions: string;            // Always present
  };
}

interface PaymentMethodsConfig {
  recipient: { name: string };
  methods: PaymentMethodData[];
  categories: Record<PaymentMethodCategory, {
    title: string;
    description: string;
    color: string;
  }>;
}
```

### 3.4 Utility Functions

```typescript
/**
 * Format currency with thousands separator
 * formatCurrency(1869.21, '$') => '$1,869.21'
 * formatCurrency(1869.21, '€', 'EUR') => '€1,869.21 EUR'
 */
const formatCurrency = (
  amount: number,
  symbol: string = '$',
  code?: string
): string => {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return code ? `${symbol}${formatted} ${code}` : `${symbol}${formatted}`;
};

/**
 * Remove emojis from text (react-pdf CANNOT render emojis - they cause crashes)
 * removeEmojis('Curso 🎓 QA') => 'Curso QA'
 */
const removeEmojis = (text: string): string => {
  return text
    .replace(
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]/gu,
      ''
    )
    .trim();
};

/**
 * Get country name from ISO code or raw name
 * Uses shared COUNTRIES_LIST from CountrySelect component
 */
const getCountryName = (countryValue: string): string => {
  const byName = COUNTRIES_LIST.find(
    (c) => c.label.toLowerCase() === countryValue.toLowerCase()
  );
  if (byName) return byName.label;
  const byCode = COUNTRIES_LIST.find(
    (c) => c.value.toLowerCase() === countryValue.toLowerCase()
  );
  if (byCode) return byCode.label;
  return countryValue;
};

/**
 * Get currency symbol and code based on payment method ID
 */
const getCurrencyFromMethod = (
  methodId: string
): { code: string; symbol: string } => {
  const currencyMap: Record<string, { code: string; symbol: string }> = {
    bbva: { code: 'ARS', symbol: '$' },
    santander: { code: 'ARS', symbol: '$' },
    eur_sepa: { code: 'EUR', symbol: '€' },
    lead_bank_wire: { code: 'USD', symbol: '$' },
    lead_bank_ach: { code: 'USD', symbol: '$' },
    mercadopago: { code: 'ARS', symbol: '$' },
    airtm: { code: 'USD', symbol: '$' },
    binance: { code: 'USDT', symbol: '$' },
    wallet_usdt: { code: 'USDT', symbol: '$' },
    card_link: { code: 'USD', symbol: '$' },
  };
  return currencyMap[methodId] || { code: 'USD', symbol: '$' };
};
```

### 3.5 Default Values

```typescript
const DEFAULT_INVOICE_DATA: InvoiceData = {
  invoiceNumber: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  clientName: '',
  clientEmail: '',
  clientAddress: '',
  clientCountry: '',
  clientTaxIdType: '',
  clientTaxId: '',
  items: [{
    id: crypto.randomUUID(),
    description: '',
    quantity: 1,
    unitPrice: 0,
  }],
  subtotal: 0,
  discount: 0,
  total: 0,
  paymentMethodId: 'binance',   // Default - most common
  notes: '',
};

const DEFAULT_CONTRACTOR_INVOICE: ContractorInvoiceData = {
  invoiceNumber: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  clientCompanyName: '',
  clientCompanyAddress: '',
  serviceDescription: '',
  servicePeriod: '',
  serviceAmount: 0,
  paymentMethodId: 'lead_bank_wire',  // Default - USD international
  notes: '',
};

const CONTRACTOR_INFO = {
  name: 'Elyer Maldonado',
  title: 'Senior QA Engineer & SDET',
  address: 'Avenida Del Puerto 615, Rincon de Milberg, Nordelta. Buenos Aires, Argentina.',
  emails: ['elyermad@gmail.com', 'ely@upexgalaxy.com'],
  cuit: '20-95884861-8',
} as const;
```

---

## 4. Live PDF Preview Mechanism (Core Feature)

This is the most important section. The live preview is what makes this module special — the PDF regenerates automatically as the user types.

### 4.1 Complete Data Flow

```
User types in Form
       │
       ▼
Form calls onChange(updatedData)
       │
       ▼
page.tsx updates state via setInvoiceData(updatedData)
       │
       ▼
React re-renders → Preview receives new `data` prop
       │
       ▼
useDebounce(data, 1500) buffers the change
       │
       ▼ (1.5 seconds after user stops typing)
       │
debouncedData changes → useEffect fires
       │
       ▼
hasMinimumData check passes?
       │
       ├── NO → Show "complete required fields" checklist
       │
       └── YES → generatePdf(debouncedData)
                     │
                     ▼
              Dynamic import @react-pdf/renderer + InvoiceDocument
                     │
                     ▼
              pdf(<InvoiceDocument data={...} />).toBlob()
                     │
                     ▼
              URL.createObjectURL(blob) → setPdfUrl(url)
                     │
                     ▼
              <iframe src={pdfUrl} /> renders the PDF
                     │
                     ▼
              User sees updated preview in real-time
```

### 4.2 The useDebounce Hook

Defined inline in each Preview component (not a shared hook):

```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage: 1500ms delay balances responsiveness vs CPU cost
const debouncedData = useDebounce(data, 1500);
```

**Why 1500ms?** PDF generation is CPU-intensive. Generating on every keystroke would be sluggish. 1.5 seconds gives the user time to type a full word/number before regeneration kicks in.

### 4.3 The generatePdf Function

This is the heart of the system. Complete implementation:

```typescript
// Refs to avoid dependency issues in useCallback
const generationRef = useRef<number>(0);
const pdfUrlRef = useRef<string | null>(null);

const generatePdf = useCallback(async (dataToRender: InvoiceData) => {
  // 1. Increment generation counter (stale generation cancellation pattern)
  const currentGeneration = ++generationRef.current;

  setIsGenerating(true);
  setError(null);

  try {
    // 2. Small delay to ensure component is fully mounted
    await new Promise(resolve => setTimeout(resolve, 200));

    // 3. Check if this generation is still current (user may have typed again)
    if (currentGeneration !== generationRef.current) return;

    // 4. Dynamic imports (avoids SSR issues + code-splitting)
    const { pdf } = await import('@react-pdf/renderer');
    const { InvoiceDocument } = await import('./InvoiceDocument');

    // 5. Check again after async imports
    if (currentGeneration !== generationRef.current) return;

    // 6. THE KEY LINE: React-PDF renders the component tree to a PDF Blob
    const blob = await pdf(<InvoiceDocument data={dataToRender} />).toBlob();

    // 7. Check one more time after PDF generation
    if (currentGeneration !== generationRef.current) return;

    // 8. Revoke old Object URL to prevent memory leaks
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
    }

    // 9. Create new Object URL and update state
    const url = URL.createObjectURL(blob);
    setPdfBlob(blob);
    setPdfUrl(url);
    setError(null);
  } catch (err) {
    console.error('Error generating PDF:', err);
    if (currentGeneration === generationRef.current) {
      setError(err instanceof Error ? err.message : 'Error al generar el PDF');
    }
  } finally {
    if (currentGeneration === generationRef.current) {
      setIsGenerating(false);
    }
  }
}, []); // Empty deps - uses refs to avoid stale closures
```

**Key Design Decisions:**

- **Generation counter pattern**: `generationRef.current` is incremented on each call. If the user types again before a generation completes, the counter advances, and all stale generations self-cancel at their next checkpoint.
- **Dynamic imports**: `@react-pdf/renderer` is imported dynamically to: (a) avoid SSR hydration errors (react-pdf is client-only), (b) code-split the heavy PDF library out of the main bundle.
- **Refs over state for deps**: `pdfUrlRef` is used instead of `pdfUrl` state to avoid adding it as a dependency to `useCallback`, which would cause infinite re-renders.
- **The `pdf()` API**: This is react-pdf's programmatic API. It takes a JSX element tree (your Document component), renders it to PDF format, and returns a Blob. This is more stable than `BlobProvider` (react-pdf's component-based approach).

### 4.4 Minimum Data Gate

Before generating a PDF, the system checks that essential fields are filled:

**UPEX Mode:**
```typescript
const hasMinimumData = useMemo(() => {
  return (
    data.invoiceNumber.trim() !== '' &&
    data.clientName.trim() !== '' &&
    data.items.some((item) => item.description.trim() !== '')
  );
}, [data.invoiceNumber, data.clientName, data.items]);
```

**Contractor Mode:**
```typescript
const hasMinimumData = useMemo(() => {
  return (
    data.invoiceNumber.trim() !== '' &&
    data.clientCompanyName.trim() !== '' &&
    data.serviceDescription.trim() !== '' &&
    data.serviceAmount > 0
  );
}, [data.invoiceNumber, data.clientCompanyName, data.serviceDescription, data.serviceAmount]);
```

When minimum data is NOT met, the Preview shows a checklist with green/yellow indicators showing which fields are complete.

### 4.5 Effect Hooks (Generation Triggers)

```typescript
// Trigger: Generate PDF when debounced data changes and has minimum data
useEffect(() => {
  if (debouncedHasMinimumData && isClient) {
    generatePdf(debouncedData);
  }
}, [debouncedData, debouncedHasMinimumData, isClient, generatePdf]);

// Cleanup: Clear PDF when data becomes incomplete
useEffect(() => {
  if (!debouncedHasMinimumData && pdfUrl) {
    URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setPdfBlob(null);
  }
}, [debouncedHasMinimumData, pdfUrl]);

// Cleanup: Revoke URL on component unmount
useEffect(() => {
  return () => {
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
    }
  };
}, []);
```

### 4.6 Iframe Rendering

The generated PDF is displayed using the browser's native PDF viewer via an iframe:

```tsx
{pdfUrl && !error && (
  <iframe
    src={pdfUrl}
    className="w-full h-full border-0"
    title="Vista previa de factura"
  />
)}
```

The `pdfUrl` is an Object URL (`blob:...`) pointing to the in-memory PDF Blob.

### 4.7 State Management in Preview

```typescript
// State
const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);     // PDF data for download
const [pdfUrl, setPdfUrl] = useState<string | null>(null);      // Object URL for iframe
const [isGenerating, setIsGenerating] = useState(false);        // Loading indicator
const [error, setError] = useState<string | null>(null);        // Error message
const [isClient, setIsClient] = useState(false);                // SSR guard

// Refs
const generationRef = useRef<number>(0);                        // Stale generation counter
const pdfUrlRef = useRef<string | null>(null);                  // URL ref for cleanup
```

The `isClient` state is necessary because `@react-pdf/renderer` cannot execute during SSR. It's set to `true` in a `useEffect(() => setIsClient(true), [])`.

### 4.8 Download Mechanism

```typescript
const handleDownload = useCallback(() => {
  if (pdfBlob) {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;       // e.g. "factura-UPEX-UPEX-2025-001-2025-03-12.pdf"
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}, [pdfBlob, fileName]);

// Filename generation:
const fileName = useMemo(() => {
  const number = data.invoiceNumber || 'borrador';
  const date = data.invoiceDate || new Date().toISOString().split('T')[0];
  return `factura-UPEX-${number}-${date}.pdf`;
}, [data.invoiceNumber, data.invoiceDate]);
```

### 4.9 Known Gotchas and Critical Lessons

1. **Custom fonts cause crashes**: Using custom fonts in `@react-pdf/renderer` can cause `"offset is outside the bounds of the DataView"` errors. **Use `Helvetica`** (the default PDF font) for maximum compatibility.

2. **Emojis crash react-pdf**: If any text passed to a `<Text>` component contains emojis, the PDF generation will fail. Always use `removeEmojis()` before passing text that may contain emojis (e.g., payment method names with emoji icons).

3. **BlobProvider is unstable**: react-pdf provides a `<BlobProvider>` component, but it's unreliable in practice. The direct `pdf()` API (used here) is significantly more stable for dynamic regeneration.

4. **Dynamic imports are essential**: `@react-pdf/renderer` cannot run during SSR. Always use dynamic `import()` and an `isClient` guard to prevent hydration errors.

5. **Object URL memory leaks**: Every `URL.createObjectURL()` allocates memory that isn't garbage-collected. You MUST call `URL.revokeObjectURL()` when:
   - Creating a new URL (revoke the old one first)
   - Data becomes incomplete (clear the URL)
   - Component unmounts (cleanup effect)

6. **Generation counter pattern**: Without the `generationRef` counter, rapid typing could cause race conditions where older PDFs overwrite newer ones. The counter ensures only the most recent generation updates the state.

---

## 5. PDF Document Layout

### 5.1 Color Palette

**UPEX (Indigo theme):**
```typescript
const colors = {
  primary: '#6366f1',      // Indigo - headers, accents
  primaryDark: '#4f46e5',
  secondary: '#1e3a5f',
  textPrimary: '#1a1a1a',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  background: '#ffffff',
  backgroundAlt: '#f9fafb',
  success: '#10b981',
};
```

**Contractor (Teal theme):**
```typescript
const colors = {
  primary: '#14b8a6',      // Teal-500
  primaryDark: '#0d9488',  // Teal-600
  secondary: '#115e59',    // Teal-800
  backgroundAlt: '#f0fdfa', // Teal-50
  // ... same textPrimary/Secondary/etc.
};
```

### 5.2 Document Structure (UPEX)

```
┌─────────────────────────────────────────────┐
│  UPEX QUALITY LLC.          INVOICE         │
│  EIN: 93-1511329            N° UPEX-2025-001│
│                             March 12, 2026  │
├─────────────────────────────────────────────┤
│  FROM                    BILL TO            │
│  UPEX QUALITY LLC.       Client Name        │
│  4278 North Hazel St...  client@email.com   │
│  Chicago, IL 60613, USA  Address, Country   │
│  ely@upexgalaxy.com      CUIT: XX-XXXXXXXX │
├─────────────────────────────────────────────┤
│  DESCRIPTION     QTY    PRICE     TOTAL     │
│  ─────────────────────────────────────────  │
│  Curso QA Pro     1    $150.00   $150.00    │
│  Sprint Agil      1    $89.00    $89.00     │
│  Tutorias         1    $45.00    $45.00     │
├─────────────────────────────────────────────┤
│                          Subtotal  $284.00  │
│                          Discount  -$20.00  │
│                         ┌─────────────────┐ │
│                         │ Total USD $264.00│ │
│                         └─────────────────┘ │
├─────────────────────────────────────────────┤
│  PAYMENT METHOD       NOTES                 │
│  Binance (USDT)       Orden #123            │
│  Address: TXyz...                           │
│  Network: TRC20                             │
├─────────────────────────────────────────────┤
│     Gracias por confiar en UPEX Quality LLC.│
│           www.upexgalaxy.com                │
└─────────────────────────────────────────────┘
```

### 5.3 StyleSheet Architecture

react-pdf uses its own styling engine (subset of CSS, flexbox-based, no grid):

```typescript
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',    // MUST use Helvetica (see gotchas)
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  // Table uses flex-based columns (not HTML table):
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  colDescription: { flex: 3 },
  colQuantity: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 1, textAlign: 'right' },
  colTotal: { flex: 1, textAlign: 'right' },
  // Footer is absolutely positioned at page bottom:
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
  },
});
```

### 5.4 Payment Method Integration in PDF

The Document component reads payment method details from `payment-methods.json` and renders them dynamically:

```typescript
const selectedMethod = (paymentMethodsData as PaymentMethodsConfig)
  .methods.find((m) => m.id === data.paymentMethodId);

// Render all data fields except 'instructions':
{Object.entries(selectedMethod.data).map(([key, value]) =>
  key !== 'instructions' && value ? (
    <View key={key} style={styles.paymentDetailRow}>
      <Text style={styles.paymentDetailLabel}>{formatKey(key)}:</Text>
      <Text style={styles.paymentDetailValue}>{value}</Text>
    </View>
  ) : null
)}
```

### 5.5 UPEX vs Contractor Document Differences

| Aspect | UPEX | Contractor |
|--------|------|-----------|
| Header | Company name + EIN | Personal name + title + CUIT |
| Color | Indigo `#6366f1` | Teal `#14b8a6` |
| Items | Multi-item table (Description, Qty, Price, Total) | Single service box (Description + Period) |
| Company info | `UPEX_COMPANY_INFO` from admin-config | `CONTRACTOR_INFO` from types.ts |
| Footer | "Gracias por confiar..." + website | "Thank you for your business" + email |

---

## 6. Form Components

### 6.1 InvoiceForm (UPEX - Multi-item)

**Sections:**
1. **Invoice Details** — Number (UPEX-YYYY-NNN) + Date picker
2. **Client Info** — Name, Email, Address, Country (dropdown from 60+ countries), Tax ID type + number with live validation
3. **Items/Products** — Dynamic list with Add/Remove. Each item has: Description, Quantity (+/- buttons), Price (decimal input), auto-calculated Total
4. **Payment & Totals** — Payment method dropdown (from payment-methods.json), Discount input, live Subtotal/Discount/Total display
5. **Notes** — Optional textarea

**Key patterns:**

```typescript
// Generic field updater
const updateField = <K extends keyof InvoiceData>(
  field: K, value: InvoiceData[K]
) => {
  onChange({ ...data, [field]: value });
};

// Recalculate totals on any item/discount change
const recalculateTotals = (items: InvoiceItem[], discount: number) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice, 0
  );
  const total = Math.max(0, subtotal - discount);
  return { subtotal, total };
};

// Price input sanitization (allows only numbers and one decimal point)
const handlePriceChange = (index: number, value: string) => {
  const sanitized = value.replace(/[^0-9.]/g, '');
  const parts = sanitized.split('.');
  const formatted = parts.length > 1
    ? `${parts[0]}.${parts[1].slice(0, 2)}`
    : sanitized;
  updateItem(index, 'unitPrice', parseFloat(formatted) || 0);
};
```

**Tax ID Validation** — Real-time feedback with color-coded messages:

```tsx
{data.clientTaxIdType && data.clientTaxId && (
  <p className={`text-xs ${
    TAX_ID_TYPES[data.clientTaxIdType].pattern.test(data.clientTaxId)
      ? 'text-green-400'    // Valid format
      : 'text-amber-400'    // Invalid - show format hint
  }`}>
    {TAX_ID_TYPES[data.clientTaxIdType].pattern.test(data.clientTaxId)
      ? '✓ Formato válido'
      : `⚠ ${TAX_ID_TYPES[data.clientTaxIdType].formatHint}`}
  </p>
)}
```

### 6.2 ContractorInvoiceForm (Single Service)

Simplified version:
1. **Invoice Details** — Number (INV-YYYY-NNN) + Date
2. **Client** — Company name + address only (no email, no tax ID)
3. **Service** — Description (textarea), Period, Amount with dynamic currency symbol based on payment method
4. **Payment Method** — Same dropdown as UPEX + details preview
5. **Notes** — Optional

The currency symbol changes automatically when the payment method changes:
```typescript
const currency = getCurrencyFromMethod(data.paymentMethodId);
// Label shows: "Monto (USD) *" or "Monto (ARS) *" or "Monto (EUR) *"
```

---

## 7. Order Auto-Fill (OrderSearchModal)

UPEX-mode only feature. Allows selecting an existing database order to auto-populate the invoice.

### 7.1 Supabase Query

```typescript
const { data } = await supabase
  .from('orders')
  .select(`
    id, user_id, items, total, payment_method, status,
    discount_amount, discount_percentage, created_at,
    profiles!inner (full_name, email, country)
  `)
  .order('created_at', { ascending: false })
  .limit(100);
```

### 7.2 OrderWithProfile Interface

```typescript
interface OrderWithProfile {
  order_id: number;
  user_id: string;
  items: {
    courses?: Array<{
      id: number;
      code: string;
      name: string;
      price: number;
      edition_name?: string;
    }>;
    sprints?: Array<{ id: number; name: string; price: number }>;
    tutorships?: number;   // Amount (not count)
  };
  total: string;
  payment_method: string;
  status: string;            // 'approved' | 'submitted' | 'rejected' | 'expired'
  discount_amount: string;
  discount_percentage: string;
  created_at: string;
  full_name: string;
  email: string;
  country: string | null;
}
```

### 7.3 Auto-Fill Transformation (page.tsx)

```typescript
const handleOrderSelect = (order: OrderWithProfile) => {
  const items: InvoiceData['items'] = [];

  // Transform courses to invoice items
  if (order.items.courses?.length) {
    order.items.courses.forEach((course) => {
      items.push({
        id: crypto.randomUUID(),
        description: course.edition_name
          ? `${removeEmojis(course.name)} - ${course.edition_name}`
          : removeEmojis(course.name),
        quantity: 1,
        unitPrice: course.price,
      });
    });
  }

  // Transform tutorships
  if (order.items.tutorships && order.items.tutorships > 0) {
    items.push({
      id: crypto.randomUUID(),
      description: 'Tutorías Personalizadas',
      quantity: 1,
      unitPrice: order.items.tutorships,
    });
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = parseFloat(order.discount_amount) || 0;
  const total = Math.max(0, subtotal - discount);

  setInvoiceData({
    ...DEFAULT_INVOICE_DATA,
    clientName: order.full_name,
    clientEmail: order.email,
    clientCountry: getCountryName(order.country || ''),
    items,
    subtotal,
    discount,
    total,
    paymentMethodId: order.payment_method,
    notes: `Orden #${order.order_id}`,
  });
};
```

### 7.4 Filters

The modal supports:
- **Text search**: by name, email, order ID, or amount
- **Payment method filter**: dropdown with all payment methods
- **Status filter**: approved, submitted, rejected, expired

---

## 8. External Configuration Files

### 8.1 payment-methods.json

Located at `lib/payment-methods.json`. Structure:

```json
{
  "recipient": { "name": "UPEX QUALITY LLC" },
  "methods": [
    {
      "id": "binance",
      "name": "💰 Binance (USDT)",
      "type": "cryptocurrency",
      "icon": "💰",
      "priority": 1,
      "data": {
        "address": "TXyz...",
        "network": "TRC20",
        "currency": "USDT",
        "instructions": "Send USDT via TRC20 network..."
      }
    },
    {
      "id": "lead_bank_wire",
      "name": "🏦 Lead Bank (Wire Transfer)",
      "type": "international_transfer",
      "icon": "🏦",
      "priority": 2,
      "data": {
        "bank": "Lead Bank",
        "accountHolder": "UPEX QUALITY LLC",
        "accountNumber": "...",
        "routingNumber": "...",
        "currency": "USD",
        "instructions": "..."
      }
    }
    // ... more methods
  ],
  "categories": {
    "bank_transfer": { "title": "...", "description": "...", "color": "..." },
    "international_transfer": { "title": "...", "description": "...", "color": "..." },
    "digital_wallet": { "title": "...", "description": "...", "color": "..." },
    "cryptocurrency": { "title": "...", "description": "...", "color": "..." },
    "card": { "title": "...", "description": "...", "color": "..." }
  }
}
```

### 8.2 admin-config.ts

Located at `lib/admin/admin-config.ts`:

```typescript
export const UPEX_COMPANY_INFO = {
  name: 'UPEX QUALITY LLC.',
  ein: '93-1511329',
  address: '4278 North Hazel St, Apt 4 Unit E',
  city: 'Chicago, IL 60613',
  country: 'USA',
  email: 'ely@upexgalaxy.com',
  phone: '+54 9 11 22515559',
  website: 'www.upexgalaxy.com',
} as const;
```

---

## 9. Page-Level State Management

The parent `page.tsx` owns all state and orchestrates the two modes:

```typescript
export default function FacturaPage() {
  const [mode, setMode] = useState<InvoiceMode>('upex');
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(DEFAULT_INVOICE_DATA);
  const [contractorData, setContractorData] = useState<ContractorInvoiceData>(DEFAULT_CONTRACTOR_INVOICE);
  const [orderSearchOpen, setOrderSearchOpen] = useState(false);

  // Reset form when switching modes
  const handleModeChange = (newMode: string) => {
    setMode(newMode as InvoiceMode);
    if (newMode === 'upex') {
      setInvoiceData(DEFAULT_INVOICE_DATA);
    } else {
      setContractorData(DEFAULT_CONTRACTOR_INVOICE);
    }
  };

  return (
    // Layout: side-by-side Form (left) + Preview (right)
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-black/40 ...">
        <InvoiceForm data={invoiceData} onChange={setInvoiceData} />
      </div>
      <div className="bg-black/40 ... h-[calc(100vh-280px)] min-h-[700px] sticky top-8">
        <InvoicePreview data={invoiceData} />
      </div>
    </div>
  );
}
```

**Key layout detail**: The Preview panel has `sticky top-8` positioning so it stays visible as the user scrolls the form.

---

## 10. Replication Guide

Step-by-step instructions to replicate the core live PDF preview pattern in another project.

### Step 1: Install Dependencies

```bash
npm install @react-pdf/renderer
# or
bun add @react-pdf/renderer
```

Version `^4.3.2` is tested and stable.

### Step 2: Create Your Data Types

Define your invoice/document data interface. At minimum:

```typescript
interface YourDocumentData {
  // Required fields for minimum data gate
  title: string;
  recipient: string;
  // ... your fields
}
```

### Step 3: Create the Document Component

Use react-pdf primitives. **Critical constraints:**
- Use `Helvetica` font only (no custom fonts)
- Use `removeEmojis()` on any text that may contain emojis
- Only `Document`, `Page`, `View`, `Text`, `StyleSheet` — no HTML elements

```tsx
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, padding: 40 },
  // ... your styles
});

export function YourDocument({ data }: { data: YourDocumentData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View><Text>{data.title}</Text></View>
        {/* ... your layout */}
      </Page>
    </Document>
  );
}
```

### Step 4: Create the Preview Component

Copy the pattern from InvoicePreview.tsx:

1. Add `useDebounce` hook (or install `use-debounce` package)
2. Add `generatePdf` with generation counter pattern
3. Add minimum data check
4. Add effect hooks for generation + cleanup
5. Render iframe with Object URL

```tsx
'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// 1. Debounce hook
function useDebounce<T>(value: T, delay: number): T { /* ... */ }

export function YourPreview({ data }: { data: YourDocumentData }) {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const generationRef = useRef<number>(0);
  const pdfUrlRef = useRef<string | null>(null);

  const debouncedData = useDebounce(data, 1500);
  useEffect(() => { setIsClient(true); }, []);

  // 2. generatePdf with dynamic imports + generation counter
  const generatePdf = useCallback(async (dataToRender) => {
    const gen = ++generationRef.current;
    setIsGenerating(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { YourDocument } = await import('./YourDocument');
      if (gen !== generationRef.current) return;
      const blob = await pdf(<YourDocument data={dataToRender} />).toBlob();
      if (gen !== generationRef.current) return;
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
      const url = URL.createObjectURL(blob);
      setPdfBlob(blob);
      setPdfUrl(url);
      pdfUrlRef.current = url;
    } catch (err) { /* handle error */ }
    finally { if (gen === generationRef.current) setIsGenerating(false); }
  }, []);

  // 3. Trigger on debounced data change
  useEffect(() => {
    if (/* hasMinimumData */ && isClient) generatePdf(debouncedData);
  }, [debouncedData, isClient, generatePdf]);

  // 4. Cleanup on unmount
  useEffect(() => () => {
    if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
  }, []);

  // 5. Render
  return (
    <div style={{ height: '100%' }}>
      {pdfUrl && <iframe src={pdfUrl} style={{ width: '100%', height: '100%', border: 'none' }} />}
    </div>
  );
}
```

### Step 5: Create the Form Component

Standard React form with `onChange` callback:

```tsx
interface YourFormProps {
  data: YourDocumentData;
  onChange: (data: YourDocumentData) => void;
}

export function YourForm({ data, onChange }: YourFormProps) {
  const updateField = <K extends keyof YourDocumentData>(
    field: K, value: YourDocumentData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div>
      <input value={data.title} onChange={(e) => updateField('title', e.target.value)} />
      {/* ... */}
    </div>
  );
}
```

### Step 6: Wire Together in Parent Page

```tsx
'use client';
import { useState } from 'react';

export default function InvoicePage() {
  const [data, setData] = useState<YourDocumentData>(DEFAULT_DATA);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      <YourForm data={data} onChange={setData} />
      <div style={{ height: 'calc(100vh - 200px)', position: 'sticky', top: '2rem' }}>
        <YourPreview data={data} />
      </div>
    </div>
  );
}
```

### Critical Checklist

- [ ] `'use client'` directive on all components (react-pdf is client-only)
- [ ] Dynamic imports for `@react-pdf/renderer` and Document component
- [ ] `isClient` guard to prevent SSR execution
- [ ] `Helvetica` font only (no custom fonts)
- [ ] `removeEmojis()` on any user-generated text passed to PDF
- [ ] `URL.revokeObjectURL()` on every URL lifecycle event (replace, clear, unmount)
- [ ] Generation counter pattern to cancel stale generations
- [ ] Debounce delay of 1000-2000ms (1500ms recommended)
- [ ] Minimum data gate to prevent generating empty PDFs
