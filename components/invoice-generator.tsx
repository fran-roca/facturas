'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import InvoiceForm from './invoice-form'
import { Invoice } from '@/lib/types'
import { generatePDF } from '@/lib/pdf-generator'

export default function InvoiceGenerator() {
  const [invoice, setInvoice] = useState<Invoice | null>(null)

  const handleInvoiceCreate = async (newInvoice: Invoice) => {
    setInvoice(newInvoice)
    await generatePDF(newInvoice)
  }

  return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Generator</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceForm onInvoiceCreate={handleInvoiceCreate} />
          </CardContent>
        </Card>
      </div>
  )
}