# Invoice PDF Generation System - Technical Specification

> **Objetivo**: Documentacion exhaustiva para replicar el sistema de facturacion con generacion de PDF en tiempo real.
>
> **Epicos relacionados**:
>
> - `EPIC-SQ-20-invoice-creation`
> - `EPIC-SQ-31-pdf-generation`
>
> **Fuente**: Documentacion de referencia de UPEX Galaxy

---

## 1. RESUMEN EJECUTIVO

Este sistema implementa un generador de facturas profesional con:

- Generacion de PDF en tiempo real mientras el usuario completa el formulario
- Dos modos de facturacion: Empresa (multi-item) y Contractor (servicio unico)
- Vista previa live con debouncing para optimizar rendimiento
- Descarga directa del PDF generado
- Auto-llenado desde base de datos de ordenes existentes

---

## 2. DEPENDENCIAS CRITICAS

### 2.1 Dependencia Principal para PDF

```bash
# CRITICO: Esta es la libreria que genera los PDFs
npm install @react-pdf/renderer
# o
bun add @react-pdf/renderer
```

**Version probada**: `@react-pdf/renderer@4.3.2`

### 2.2 Dependencias Complementarias

```bash
# UI Components (puedes usar cualquier libreria de UI)
npm install lucide-react          # Iconos
npm install date-fns              # Formateo de fechas

# Si usas shadcn/ui (recomendado)
npx shadcn@latest add button input select textarea dialog tabs
```

### 2.3 Stack Tecnologico Completo

| Tecnologia          | Version | Proposito          |
| ------------------- | ------- | ------------------ |
| Next.js             | 15.x    | App Router         |
| React               | 19.x    | Framework UI       |
| @react-pdf/renderer | 4.3.2   | Generacion de PDF  |
| TypeScript          | 5.x     | Tipado estatico    |
| lucide-react        | Latest  | Iconos             |
| date-fns            | 4.x     | Formateo de fechas |

---

## 3. ARQUITECTURA DE ARCHIVOS

```
/app/(app)/invoices/
├── page.tsx                         # Pagina principal (orquestador)
└── components/
    ├── types.ts                     # Tipos, interfaces y utilidades
    ├── InvoiceForm.tsx              # Formulario modo Empresa
    ├── InvoicePreview.tsx           # Preview PDF modo Empresa
    ├── InvoiceDocument.tsx          # Template PDF modo Empresa
    ├── ContractorInvoiceForm.tsx    # Formulario modo Contractor
    ├── ContractorInvoicePreview.tsx # Preview PDF modo Contractor
    ├── ContractorInvoiceDocument.tsx# Template PDF modo Contractor
    └── OrderSearchModal.tsx         # Modal busqueda de ordenes (opcional)

/lib/
├── payment-methods.json             # Configuracion de metodos de pago
└── admin/
    └── admin-config.ts              # Datos de la empresa/contractor
```

---

## 4. TIPOS E INTERFACES (types.ts)

### 4.1 Estructura de Item de Factura

```typescript
interface InvoiceItem {
  id: string; // UUID unico
  description: string; // Descripcion del producto/servicio
  quantity: number; // Cantidad (minimo 1)
  unitPrice: number; // Precio unitario
}
```

### 4.2 Datos de Factura Empresa (Multi-item)

```typescript
interface InvoiceData {
  // Identificacion
  invoiceNumber: string; // Ej: "UPEX-2025-001"
  invoiceDate: string; // ISO format: "2025-02-08"

  // Cliente
  clientName: string; // Nombre completo (requerido)
  clientEmail: string; // Email (requerido)
  clientAddress: string; // Direccion (opcional)
  clientCountry: string; // Pais (opcional)
  clientTaxIdType: TaxIdType | ''; // Tipo de ID fiscal
  clientTaxId: string; // Numero de ID fiscal

  // Items
  items: InvoiceItem[]; // Array de productos/servicios

  // Totales
  subtotal: number; // Suma de (qty * price)
  discount: number; // Descuento aplicado
  total: number; // subtotal - discount

  // Pago
  paymentMethodId: string; // ID del metodo de pago
  notes: string; // Notas adicionales
}
```

### 4.3 Datos de Factura Contractor (Servicio unico)

```typescript
interface ContractorInvoiceData {
  invoiceNumber: string;
  invoiceDate: string;

  // Cliente (simplificado)
  clientCompanyName: string; // Nombre de empresa (requerido)
  clientCompanyAddress: string; // Direccion (opcional)

  // Servicio unico
  serviceDescription: string; // Descripcion del servicio
  servicePeriod: string; // Ej: "January 2025", "Q1 2025"
  serviceAmount: number; // Monto del servicio

  paymentMethodId: string;
  notes: string;
}
```

### 4.4 Tipos de ID Fiscal (20 opciones)

```typescript
type TaxIdType =
  // Empresariales
  | 'EIN'
  | 'VAT'
  | 'RIF'
  | 'CUIT'
  | 'RFC'
  | 'RUT'
  | 'RUC'
  | 'NIT'
  | 'CNPJ'
  // Personales
  | 'DNI'
  | 'NIE'
  | 'CEDULA'
  | 'CUIL'
  | 'CPF'
  | 'SSN'
  | 'DUI'
  | 'PASSPORT'
  | 'OTHER';

// Metadata para cada tipo
const TAX_ID_TYPES: Record<
  TaxIdType,
  {
    label: string;
    pattern: RegExp;
    placeholder: string;
    hint: string;
    category: 'business' | 'personal';
  }
> = {
  EIN: {
    label: 'EIN (USA)',
    pattern: /^\d{2}-\d{7}$/,
    placeholder: '12-3456789',
    hint: 'Format: XX-XXXXXXX',
    category: 'business',
  },
  // ... etc
};
```

### 4.5 Funciones Utilitarias Esenciales

```typescript
// Formatear moneda con separador de miles
function formatCurrency(amount: number, symbol: string = '$', code?: string): string {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return code ? `${symbol}${formatted} ${code}` : `${symbol}${formatted}`;
}
// Ejemplo: formatCurrency(1869.21, '$', 'USD') → "$1,869.21 USD"

// CRITICO: Remover emojis (PDFs no los renderizan)
function removeEmojis(text: string): string {
  return text.replace(
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]/gu,
    ''
  );
}

// Obtener moneda desde metodo de pago
function getCurrencyFromMethod(methodId: string): { code: string; symbol: string } {
  const currencyMap: Record<string, { code: string; symbol: string }> = {
    bbva: { code: 'ARS', symbol: '$' },
    santander: { code: 'ARS', symbol: '$' },
    mercadopago: { code: 'ARS', symbol: '$' },
    eur_sepa: { code: 'EUR', symbol: '€' },
    lead_bank_wire: { code: 'USD', symbol: '$' },
    lead_bank_ach: { code: 'USD', symbol: '$' },
    airtm: { code: 'USD', symbol: '$' },
    binance: { code: 'USDT', symbol: '$' },
    wallet_usdt: { code: 'USDT', symbol: '$' },
    card_link: { code: 'USD', symbol: '$' },
  };
  return currencyMap[methodId] || { code: 'USD', symbol: '$' };
}
```

### 4.6 Valores por Defecto

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
  items: [{ id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 }],
  subtotal: 0,
  discount: 0,
  total: 0,
  paymentMethodId: 'binance', // default
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
  paymentMethodId: 'lead_bank_wire', // default
  notes: '',
};
```

---

## 5. PAGINA PRINCIPAL (page.tsx)

### 5.1 Estructura del Componente

```tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { ContractorInvoiceForm } from './components/ContractorInvoiceForm';
import { ContractorInvoicePreview } from './components/ContractorInvoicePreview';
import { OrderSearchModal } from './components/OrderSearchModal';
import {
  InvoiceData,
  ContractorInvoiceData,
  InvoiceMode,
  DEFAULT_INVOICE_DATA,
  DEFAULT_CONTRACTOR_INVOICE,
} from './components/types';

export default function FacturaPage() {
  // Estado del modo actual
  const [mode, setMode] = useState<InvoiceMode>('upex');

  // Estados de datos para cada modo
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(DEFAULT_INVOICE_DATA);
  const [contractorData, setContractorData] = useState<ContractorInvoiceData>(
    DEFAULT_CONTRACTOR_INVOICE
  );

  // Modal de busqueda de ordenes (opcional)
  const [orderSearchOpen, setOrderSearchOpen] = useState(false);

  // Handler para auto-llenado desde orden
  const handleOrderSelect = (order: OrderWithProfile) => {
    // Transformar orden a InvoiceData
    const items = buildItemsFromOrder(order);
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discount = parseFloat(order.discount_amount) || 0;

    setInvoiceData({
      ...DEFAULT_INVOICE_DATA,
      items,
      subtotal,
      discount,
      total: Math.max(0, subtotal - discount),
      clientName: order.full_name,
      clientEmail: order.email,
      clientCountry: getCountryName(order.country),
      paymentMethodId: mapPaymentMethod(order.payment_method),
      notes: `Orden #${order.order_id}`,
    });

    setOrderSearchOpen(false);
  };

  return (
    <div className="container mx-auto p-6" data-testid="FacturaPage">
      <h1 className="text-2xl font-bold mb-6">Generador de Facturas</h1>

      <Tabs value={mode} onValueChange={v => setMode(v as InvoiceMode)}>
        <TabsList>
          <TabsTrigger value="upex">Empresa</TabsTrigger>
          <TabsTrigger value="contractor">Contractor</TabsTrigger>
        </TabsList>

        <TabsContent value="upex">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Formulario */}
            <div>
              <Button onClick={() => setOrderSearchOpen(true)}>Cargar desde Orden</Button>
              <InvoiceForm data={invoiceData} onChange={setInvoiceData} />
            </div>

            {/* Columna Preview (sticky) */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              <InvoicePreview data={invoiceData} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contractor">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContractorInvoiceForm data={contractorData} onChange={setContractorData} />
            <div className="lg:sticky lg:top-6 lg:self-start">
              <ContractorInvoicePreview data={contractorData} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <OrderSearchModal
        open={orderSearchOpen}
        onClose={() => setOrderSearchOpen(false)}
        onSelectOrder={handleOrderSelect}
      />
    </div>
  );
}
```

---

## 6. COMPONENTE DE FORMULARIO (InvoiceForm.tsx)

### 6.1 Patron de Props

```typescript
interface InvoiceFormProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
}
```

### 6.2 Logica de Actualizacion de Campos

```tsx
'use client';

export function InvoiceForm({ data, onChange }: InvoiceFormProps) {
  // Funcion generica para actualizar cualquier campo
  const updateField = <K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => {
    onChange({ ...data, [field]: value });
  };

  // Recalcular totales cuando cambian items o descuento
  const recalculateTotals = (items: InvoiceItem[], discount: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const total = Math.max(0, subtotal - discount);

    onChange({
      ...data,
      items,
      subtotal,
      discount,
      total,
    });
  };

  // Agregar nuevo item
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
    };
    recalculateTotals([...data.items, newItem], data.discount);
  };

  // Eliminar item (minimo 1)
  const removeItem = (id: string) => {
    if (data.items.length <= 1) return;
    const filtered = data.items.filter(item => item.id !== id);
    recalculateTotals(filtered, data.discount);
  };

  // Actualizar item especifico
  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const updated = data.items.map(item => (item.id === id ? { ...item, [field]: value } : item));
    recalculateTotals(updated, data.discount);
  };

  return (
    <div className="space-y-6" data-testid="InvoiceForm">
      {/* Seccion: Detalles de Factura */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Numero de Factura"
          placeholder="UPEX-2025-001"
          value={data.invoiceNumber}
          onChange={e => updateField('invoiceNumber', e.target.value)}
        />
        <Input
          type="date"
          label="Fecha"
          value={data.invoiceDate}
          onChange={e => updateField('invoiceDate', e.target.value)}
        />
      </div>

      {/* Seccion: Informacion del Cliente */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nombre Completo *"
          value={data.clientName}
          onChange={e => updateField('clientName', e.target.value)}
          required
        />
        <Input
          label="Email *"
          type="email"
          value={data.clientEmail}
          onChange={e => updateField('clientEmail', e.target.value)}
          required
        />
        <Input
          label="Direccion"
          value={data.clientAddress}
          onChange={e => updateField('clientAddress', e.target.value)}
        />
        <CountrySelect
          label="Pais"
          value={data.clientCountry}
          onChange={value => updateField('clientCountry', value)}
        />
        <Select
          label="Tipo de ID Fiscal"
          value={data.clientTaxIdType}
          onChange={value => updateField('clientTaxIdType', value)}
          options={Object.entries(TAX_ID_TYPES).map(([key, meta]) => ({
            value: key,
            label: meta.label,
          }))}
        />
        <Input
          label="Numero de ID Fiscal"
          value={data.clientTaxId}
          onChange={e => updateField('clientTaxId', e.target.value)}
          placeholder={data.clientTaxIdType ? TAX_ID_TYPES[data.clientTaxIdType]?.placeholder : ''}
        />
      </div>

      {/* Seccion: Items/Productos */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Productos/Servicios</h3>
          <Button onClick={addItem} size="sm">
            + Agregar
          </Button>
        </div>

        {data.items.map((item, index) => (
          <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-5">
              <Input
                label={index === 0 ? 'Descripcion' : undefined}
                value={item.description}
                onChange={e => updateItem(item.id, 'description', e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => updateItem(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                >
                  -
                </Button>
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                  className="text-center"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => updateItem(item.id, 'quantity', item.quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="col-span-2">
              <Input
                label={index === 0 ? 'Precio' : undefined}
                type="number"
                step="0.01"
                min={0}
                value={item.unitPrice}
                onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="col-span-2">
              <div className="text-right font-medium">
                ${(item.quantity * item.unitPrice).toFixed(2)}
              </div>
            </div>
            <div className="col-span-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeItem(item.id)}
                disabled={data.items.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Seccion: Metodo de Pago */}
      <Select
        label="Metodo de Pago"
        value={data.paymentMethodId}
        onChange={value => updateField('paymentMethodId', value)}
        options={PAYMENT_METHODS}
      />

      {/* Seccion: Totales */}
      <div className="space-y-2 text-right">
        <div>Subtotal: ${data.subtotal.toFixed(2)}</div>
        <div className="flex justify-end items-center gap-2">
          <span>Descuento:</span>
          <Input
            type="number"
            step="0.01"
            min={0}
            value={data.discount}
            onChange={e => recalculateTotals(data.items, parseFloat(e.target.value) || 0)}
            className="w-24 text-right"
          />
        </div>
        <div className="text-xl font-bold">Total: ${data.total.toFixed(2)}</div>
      </div>

      {/* Seccion: Notas */}
      <Textarea
        label="Notas"
        value={data.notes}
        onChange={e => updateField('notes', e.target.value)}
        placeholder="Notas adicionales para la factura..."
      />
    </div>
  );
}
```

---

## 7. COMPONENTE DE PREVIEW (InvoicePreview.tsx)

### 7.1 Hook de Debounce (Critico para Performance)

```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

### 7.2 Componente de Preview Completo

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { InvoiceData } from './types';
import { Download, Loader2, AlertCircle, Eye, Check } from 'lucide-react';

interface InvoicePreviewProps {
  data: InvoiceData;
}

export function InvoicePreview({ data }: InvoicePreviewProps) {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Refs para control de generacion
  const generationRef = useRef<number>(0);
  const pdfUrlRef = useRef<string | null>(null);

  // CRITICO: Debounce de 1.5s para evitar regeneracion excesiva
  const debouncedData = useDebounce(data, 1500);

  // Check client-side (SSR safety)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Validacion de datos minimos
  const hasMinimumData =
    data.invoiceNumber.trim() !== '' &&
    data.clientName.trim() !== '' &&
    data.items.some(item => item.description.trim() !== '');

  // Generacion del PDF
  useEffect(() => {
    if (!isClient || !hasMinimumData) {
      setPdfBlob(null);
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
        pdfUrlRef.current = null;
        setPdfUrl(null);
      }
      return;
    }

    const generatePdf = async () => {
      // Incrementar contador de generacion
      const currentGeneration = ++generationRef.current;

      setIsGenerating(true);
      setError(null);

      try {
        // CRITICO: Dynamic import para code-splitting
        const { pdf } = await import('@react-pdf/renderer');
        const { InvoiceDocument } = await import('./InvoiceDocument');

        // Verificar que esta generacion sigue siendo la actual
        if (currentGeneration !== generationRef.current) return;

        // Generar blob del PDF
        const blob = await pdf(<InvoiceDocument data={debouncedData} />).toBlob();

        // Verificar nuevamente
        if (currentGeneration !== generationRef.current) return;

        // Limpiar URL anterior (prevenir memory leaks)
        if (pdfUrlRef.current) {
          URL.revokeObjectURL(pdfUrlRef.current);
        }

        // Crear nueva URL
        const url = URL.createObjectURL(blob);
        pdfUrlRef.current = url;

        setPdfBlob(blob);
        setPdfUrl(url);
      } catch (err) {
        if (currentGeneration === generationRef.current) {
          setError('Error al generar el PDF');
          console.error('PDF generation error:', err);
        }
      } finally {
        if (currentGeneration === generationRef.current) {
          setIsGenerating(false);
        }
      }
    };

    generatePdf();

    // Cleanup on unmount
    return () => {
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
      }
    };
  }, [debouncedData, isClient, hasMinimumData]);

  // Handler de descarga
  const handleDownload = () => {
    if (!pdfBlob) return;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(pdfBlob);

    // Generar nombre de archivo
    const date = new Date().toISOString().split('T')[0];
    const invoiceNum = data.invoiceNumber || 'draft';
    link.download = `factura-${invoiceNum}-${date}.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // UI: Datos incompletos
  if (!hasMinimumData) {
    return (
      <div className="border rounded-lg p-6 bg-gray-50" data-testid="InvoicePreview">
        <div className="flex flex-col items-center justify-center h-[600px] text-gray-500">
          <Eye className="h-12 w-12 mb-4" />
          <p className="font-medium mb-4">Completa los campos requeridos:</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              {data.invoiceNumber ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <div className="h-4 w-4 border rounded" />
              )}
              Numero de factura
            </li>
            <li className="flex items-center gap-2">
              {data.clientName ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <div className="h-4 w-4 border rounded" />
              )}
              Nombre del cliente
            </li>
            <li className="flex items-center gap-2">
              {data.items.some(i => i.description.trim()) ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <div className="h-4 w-4 border rounded" />
              )}
              Al menos un item con descripcion
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // UI: Error
  if (error) {
    return (
      <div className="border rounded-lg p-6 bg-red-50" data-testid="InvoicePreview">
        <div className="flex flex-col items-center justify-center h-[600px] text-red-600">
          <AlertCircle className="h-12 w-12 mb-4" />
          <p>{error}</p>
          <Button onClick={() => setError(null)} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // UI: Generando o con PDF listo
  return (
    <div className="border rounded-lg overflow-hidden" data-testid="InvoicePreview">
      {/* Header con boton de descarga */}
      <div className="flex justify-between items-center p-4 bg-gray-100 border-b">
        <span className="font-medium">Vista Previa</span>
        <div className="flex items-center gap-2">
          {pdfUrl && !isGenerating && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Check className="h-4 w-4" />
              Listo
            </span>
          )}
          <Button onClick={handleDownload} disabled={!pdfBlob || isGenerating}>
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Descargar PDF
          </Button>
        </div>
      </div>

      {/* Preview iframe */}
      <div className="relative h-[600px] bg-gray-200">
        {isGenerating && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Generando vista previa...</span>
          </div>
        )}

        {pdfUrl ? (
          <iframe src={pdfUrl} className="w-full h-full" title="Invoice Preview" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 8. TEMPLATE PDF (InvoiceDocument.tsx)

### 8.1 Estructura Completa del Documento

```tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { InvoiceData, formatCurrency, removeEmojis } from './types';
import paymentMethodsData from '@/lib/payment-methods.json';

// Informacion de tu empresa (personalizar)
const COMPANY_INFO = {
  name: 'TU EMPRESA S.A.',
  taxId: '12-3456789',
  taxIdType: 'EIN',
  address: 'Calle Principal 123',
  city: 'Ciudad, CP 12345',
  country: 'Pais',
  email: 'contacto@tuempresa.com',
  phone: '+1 234 567 8900',
  website: 'www.tuempresa.com',
};

// Paleta de colores
const colors = {
  primary: '#6366f1', // Color principal (cambiar segun marca)
  primaryDark: '#4f46e5',
  secondary: '#1e3a5f',
  textPrimary: '#1a1a1a',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  backgroundAlt: '#f9fafb',
};

// CRITICO: Usar Helvetica (fuente por defecto, evita errores)
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    backgroundColor: '#ffffff',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  companySubtitle: {
    fontSize: 8,
    color: colors.textSecondary,
    marginTop: 2,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'right',
  },
  invoiceNumber: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  invoiceDate: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 2,
  },

  // Info containers (From/To)
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  infoBox: {
    width: '48%',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 4,
  },
  infoTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoText: {
    fontSize: 10,
    color: colors.textPrimary,
    marginBottom: 2,
    lineHeight: 1.4,
  },
  infoLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    marginBottom: 1,
  },

  // Items table
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tableRowAlt: {
    backgroundColor: colors.backgroundAlt,
  },
  tableText: {
    fontSize: 10,
    color: colors.textPrimary,
  },
  tableTextMuted: {
    fontSize: 10,
    color: colors.textSecondary,
  },

  // Column widths
  colDescription: { flex: 3 },
  colQuantity: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 1, textAlign: 'right' },
  colTotal: { flex: 1, textAlign: 'right' },

  // Totals
  totalsContainer: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  totalsBox: {
    width: 220,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  totalsLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  totalsValue: {
    fontSize: 10,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  totalsFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  totalsFinalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  totalsFinalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  // Payment & Notes section
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paymentSection: {
    width: '45%',
  },
  notesSection: {
    width: '50%',
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  paymentMethod: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
  },
  paymentDetail: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  paymentDetailLabel: {
    fontSize: 8,
    color: colors.textSecondary,
    width: 80,
    textTransform: 'capitalize',
  },
  paymentDetailValue: {
    fontSize: 9,
    color: colors.textPrimary,
    flex: 1,
  },
  notesText: {
    fontSize: 9,
    color: colors.textSecondary,
    lineHeight: 1.5,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerText: {
    fontSize: 8,
    color: colors.textMuted,
  },
  footerLink: {
    fontSize: 8,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

// Formatear fecha
const formatDate = (isoDate: string): string => {
  if (!isoDate) return '---';
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return isoDate;
  }
};

// Formatear key de payment method
const formatKey = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ');
};

interface InvoiceDocumentProps {
  data: InvoiceData;
}

export function InvoiceDocument({ data }: InvoiceDocumentProps) {
  // Obtener metodo de pago seleccionado
  const selectedMethod = paymentMethodsData.methods.find(m => m.id === data.paymentMethodId);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{COMPANY_INFO.name}</Text>
            <Text style={styles.companySubtitle}>
              {COMPANY_INFO.taxIdType}: {COMPANY_INFO.taxId}
            </Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>N {data.invoiceNumber || '---'}</Text>
            <Text style={styles.invoiceDate}>{formatDate(data.invoiceDate)}</Text>
          </View>
        </View>

        {/* FROM / TO */}
        <View style={styles.infoContainer}>
          {/* From */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>From</Text>
            <Text style={styles.infoText}>{COMPANY_INFO.name}</Text>
            <Text style={styles.infoText}>{COMPANY_INFO.address}</Text>
            <Text style={styles.infoText}>
              {COMPANY_INFO.city}, {COMPANY_INFO.country}
            </Text>
            <Text style={styles.infoLabel}>{COMPANY_INFO.email}</Text>
            <Text style={styles.infoLabel}>{COMPANY_INFO.phone}</Text>
          </View>

          {/* To */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Bill To</Text>
            <Text style={styles.infoText}>{data.clientName || '---'}</Text>
            <Text style={styles.infoLabel}>{data.clientEmail}</Text>
            {data.clientAddress && <Text style={styles.infoText}>{data.clientAddress}</Text>}
            {data.clientCountry && <Text style={styles.infoText}>{data.clientCountry}</Text>}
            {data.clientTaxIdType && data.clientTaxId && (
              <Text style={styles.infoLabel}>
                {data.clientTaxIdType}: {data.clientTaxId}
              </Text>
            )}
          </View>
        </View>

        {/* ITEMS TABLE */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.colQuantity]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Price</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
          </View>

          {/* Rows */}
          {data.items.map((item, index) => (
            <View
              key={item.id}
              style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={[styles.tableText, styles.colDescription]}>
                {removeEmojis(item.description) || 'No description'}
              </Text>
              <Text style={[styles.tableTextMuted, styles.colQuantity]}>{item.quantity}</Text>
              <Text style={[styles.tableTextMuted, styles.colPrice]}>
                {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={[styles.tableText, styles.colTotal]}>
                {formatCurrency(item.quantity * item.unitPrice)}
              </Text>
            </View>
          ))}
        </View>

        {/* TOTALS */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{formatCurrency(data.subtotal)}</Text>
            </View>

            {data.discount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Discount</Text>
                <Text style={styles.totalsValue}>-{formatCurrency(data.discount)}</Text>
              </View>
            )}

            <View style={styles.totalsFinal}>
              <Text style={styles.totalsFinalLabel}>Total USD</Text>
              <Text style={styles.totalsFinalValue}>{formatCurrency(data.total)}</Text>
            </View>
          </View>
        </View>

        {/* PAYMENT & NOTES */}
        <View style={styles.bottomSection}>
          {/* Payment Method */}
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            {selectedMethod && (
              <>
                <Text style={styles.paymentMethod}>{removeEmojis(selectedMethod.name)}</Text>
                {Object.entries(selectedMethod.data).map(([key, value]) =>
                  key !== 'instructions' && value ? (
                    <View key={key} style={styles.paymentDetail}>
                      <Text style={styles.paymentDetailLabel}>{formatKey(key)}:</Text>
                      <Text style={styles.paymentDetailValue}>{String(value)}</Text>
                    </View>
                  ) : null
                )}
              </>
            )}
          </View>

          {/* Notes */}
          {data.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notesText}>{removeEmojis(data.notes)}</Text>
            </View>
          )}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your business!</Text>
          <Text style={styles.footerLink}>{COMPANY_INFO.website}</Text>
        </View>
      </Page>
    </Document>
  );
}
```

---

## 9. CONFIGURACION DE METODOS DE PAGO

### 9.1 Estructura del JSON (payment-methods.json)

```json
{
  "recipient": {
    "name": "Nombre del Receptor de Pagos"
  },
  "methods": [
    {
      "id": "bank_local",
      "name": "Banco Local",
      "type": "bank_transfer",
      "icon": "bank",
      "priority": 1,
      "data": {
        "bank": "Nombre del Banco",
        "accountType": "Cuenta Corriente",
        "accountNumber": "1234567890",
        "accountHolder": "Nombre del Titular",
        "currency": "USD",
        "instructions": "Instrucciones para el usuario (no se muestra en PDF)"
      }
    },
    {
      "id": "international_wire",
      "name": "Transferencia Internacional",
      "type": "international_transfer",
      "icon": "globe",
      "priority": 2,
      "data": {
        "bank": "Nombre del Banco",
        "iban": "ES12 3456 7890 1234 5678 9012",
        "bic": "ABCDEFGH",
        "routingNumber": "123456789",
        "accountNumber": "987654321",
        "accountHolder": "Nombre del Titular",
        "currency": "EUR",
        "instructions": "..."
      }
    },
    {
      "id": "crypto_usdt",
      "name": "USDT (Tether)",
      "type": "cryptocurrency",
      "icon": "bitcoin",
      "priority": 3,
      "data": {
        "address": "TXyz123...abc",
        "network": "TRC-20",
        "currency": "USDT",
        "instructions": "..."
      }
    },
    {
      "id": "paypal",
      "name": "PayPal",
      "type": "digital_wallet",
      "icon": "credit-card",
      "priority": 4,
      "data": {
        "email": "pagos@tuempresa.com",
        "currency": "USD",
        "instructions": "..."
      }
    }
  ],
  "categories": {
    "bank_transfer": {
      "label": "Transferencia Bancaria",
      "icon": "bank"
    },
    "international_transfer": {
      "label": "Transferencia Internacional",
      "icon": "globe"
    },
    "cryptocurrency": {
      "label": "Criptomonedas",
      "icon": "bitcoin"
    },
    "digital_wallet": {
      "label": "Billetera Digital",
      "icon": "smartphone"
    }
  }
}
```

---

## 10. DIFERENCIAS ENTRE MODELOS (Empresa vs Contractor)

| Aspecto          | Modo Empresa                           | Modo Contractor                 |
| ---------------- | -------------------------------------- | ------------------------------- |
| Emisor           | Empresa (LLC, S.A., etc.)              | Persona fisica                  |
| ID Fiscal Emisor | EIN, VAT, RIF, etc.                    | CUIT, CUIL, SSN, etc.           |
| Color Tema       | Indigo (#6366f1)                       | Teal (#14b8a6)                  |
| Items            | Multi-item (tabla)                     | Servicio unico (seccion)        |
| Cliente          | Nombre, email, direccion, pais, tax ID | Solo nombre empresa y direccion |
| Totales          | Subtotal, descuento, total             | Solo monto total                |
| Moneda           | Fija (USD)                             | Dinamica (segun metodo de pago) |
| Datos minimos    | 3 campos                               | 4 campos                        |
| Footer           | "Gracias por confiar..."               | "Thank you for your business"   |

---

## 11. PUNTOS CRITICOS PARA LA IMPLEMENTACION

### 11.1 Errores Comunes a Evitar

1. **NO usar fuentes personalizadas** - Causa errores "offset is outside the bounds of the DataView"
   - Solucion: Usar solo Helvetica (fuente por defecto)

2. **NO incluir emojis en el PDF** - No se renderizan correctamente
   - Solucion: Usar `removeEmojis()` en todo texto dinamico

3. **NO regenerar PDF en cada keystroke** - Causa lag y crashes
   - Solucion: Debounce de 1.5 segundos minimo

4. **NO olvidar limpiar Object URLs** - Memory leaks
   - Solucion: `URL.revokeObjectURL()` antes de crear nuevas

5. **NO importar react-pdf en SSR** - Errores de server
   - Solucion: Dynamic import + check `isClient`

### 11.2 Checklist de Implementacion

- [ ] Instalar `@react-pdf/renderer`
- [ ] Crear `types.ts` con interfaces y utilidades
- [ ] Crear hook `useDebounce`
- [ ] Implementar `InvoiceForm` con recalculo de totales
- [ ] Implementar `InvoicePreview` con debouncing y memory management
- [ ] Implementar `InvoiceDocument` con estilos react-pdf
- [ ] Crear `payment-methods.json` con metodos de pago
- [ ] Crear `admin-config.ts` con datos de empresa
- [ ] Agregar `data-testid` para testing

### 11.3 Performance Tips

1. Usar `React.memo` en componentes pesados
2. Dynamic imports para code-splitting del PDF
3. Debounce minimo 1500ms
4. Limitar preview a 600px height
5. No regenerar si datos no cambiaron

---

## 12. EJEMPLO DE USO RAPIDO

```tsx
// 1. Instalar dependencia
// bun add @react-pdf/renderer

// 2. Crear pagina
// app/(app)/invoices/page.tsx

'use client';
import { useState } from 'react';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { DEFAULT_INVOICE_DATA } from './components/types';

export default function InvoicePage() {
  const [data, setData] = useState(DEFAULT_INVOICE_DATA);

  return (
    <div className="grid grid-cols-2 gap-6 p-6">
      <InvoiceForm data={data} onChange={setData} />
      <InvoicePreview data={data} />
    </div>
  );
}
```

---

## 13. RESUMEN FINAL

Este sistema de facturacion es una solucion production-ready que incluye:

- Generacion de PDF en tiempo real con `@react-pdf/renderer`
- Arquitectura modular facil de adaptar
- Dos modelos de factura (empresa y contractor)
- Sistema de metodos de pago configurable via JSON
- Validacion de datos con feedback visual
- Performance optimizado con debouncing y memory management
- Diseno profesional con estilos personalizables

### Para replicar en otro proyecto:

1. Copia la estructura de archivos
2. Instala las dependencias
3. Personaliza `COMPANY_INFO` y `payment-methods.json`
4. Ajusta colores en el `StyleSheet`

---

## Referencias

- **Epico Creacion de Facturas**: `.context/PBI/epics/EPIC-SQ-20-invoice-creation/`
- **Epico Generacion PDF**: `.context/PBI/epics/EPIC-SQ-31-pdf-generation/`
- **Documentacion react-pdf**: https://react-pdf.org/

---

**Ultima actualizacion**: 2026-02-08
