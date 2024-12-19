export interface BillingDetails {
  name: string
  taxId: string
  address: string
  postalCode: string
}

export interface InvoiceItem {
  article: string
  weight: string
  weightUnit: 'kg' | 'und'
  price: string
  subtotal: number
  iva: number
  total: number
}

export interface Invoice {
  invoiceNumber: string
  date: string
  billingDetails: BillingDetails
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
}

