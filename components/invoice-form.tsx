'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Invoice, InvoiceItem, BillingDetails } from '@/lib/types'
import { Trash2 } from 'lucide-react'

interface InvoiceFormProps {
  onInvoiceCreate: (invoice: Invoice) => void
}

export default function InvoiceForm({ onInvoiceCreate }: InvoiceFormProps) {
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [date, setDate] = useState('')
  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    name: '',
    taxId: '',
    address: '',
    postalCode: ''
  })
  const [items, setItems] = useState<InvoiceItem[]>([{
    article: '',
    weight: '',
    weightUnit: 'kg',
    price: '',
    subtotal: 0,
    iva: 10,
    total: 0
  }])

  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
  }

  const handleBillingChange = (field: keyof BillingDetails, value: string) => {
    setBillingDetails(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calculateItemTotals = (item: InvoiceItem) => {
    const weight = parseFloat(item.weight) || 0
    const price = parseFloat(item.price) || 0
    const iva = item.iva

    const subtotal = weight * price
    const total = subtotal + (subtotal * (iva / 100))

    return { ...item, subtotal, total }
  }

  const calculateItemPrice = (item: InvoiceItem) => {
    const weight = parseFloat(item.weight) || 0
    const total = parseFloat(item.total.toString()) || 0
    const iva = item.iva

    const subtotal = total / (1 + iva / 100)
    const price = weight > 0 ? subtotal / weight : 0

    return { ...item, subtotal, price: price.toFixed(2) }
  }

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items]
    let updatedItem = { ...newItems[index], [field]: value }

    if (field === 'total') {
      updatedItem = calculateItemPrice(updatedItem)
    } else {
      updatedItem = calculateItemTotals(updatedItem)
    }

    newItems[index] = updatedItem
    setItems(newItems)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const tax = items.reduce((sum, item) => sum + (item.subtotal * (item.iva / 100)), 0)
    const total = subtotal + tax

    const invoice: Invoice = {
      invoiceNumber,
      date,
      billingDetails,
      items,
      subtotal,
      tax,
      total
    }

    onInvoiceCreate(invoice)
  }

  return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles de Factura</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Factura n.°</Label>
              <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
              />
            </div>
            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FACTURAR A</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre/Empresa</Label>
              <Input
                  id="name"
                  value={billingDetails.name}
                  onChange={(e) => handleBillingChange('name', e.target.value)}
                  required
              />
            </div>
            <div>
              <Label htmlFor="taxId">NIF/CIF</Label>
              <Input
                  id="taxId"
                  value={billingDetails.taxId}
                  onChange={(e) => handleBillingChange('taxId', e.target.value)}
                  required
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                  id="address"
                  value={billingDetails.address}
                  onChange={(e) => handleBillingChange('address', e.target.value)}
                  required
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Código Postal</Label>
              <Input
                  id="postalCode"
                  value={billingDetails.postalCode}
                  onChange={(e) => handleBillingChange('postalCode', e.target.value)}
                  required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Artículos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4 p-4 border rounded-lg">
                  <div className="col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-2">
                    <Label>Artículo</Label>
                    <Input
                        value={item.article}
                        onChange={(e) => handleItemChange(index, 'article', e.target.value)}
                        required
                    />
                  </div>
                  <div className="col-span-1">
                    <Label>Peso/Cantidad</Label>
                    <Input
                        type="number"
                        step="0.001"
                        value={item.weight}
                        onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                        required
                    />
                  </div>
                  <div className="col-span-1">
                    <Label>Unidad</Label>
                    <Select
                        value={item.weightUnit}
                        onValueChange={(value) => handleItemChange(index, 'weightUnit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="und">und</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Label>Precio</Label>
                    <Input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                        required
                    />
                  </div>
                  <div className="col-span-1">
                    <Label>% IVA</Label>
                    <Input
                        type="number"
                        value={item.iva}
                        onChange={(e) => handleItemChange(index, 'iva', e.target.value)}
                        required
                    />
                  </div>
                  <div className="col-span-1">
                    <Label>Total</Label>
                    <Input
                        type="number"
                        step="0.01"
                        value={typeof item.total === 'number' ? item.total.toFixed(2) : String(item.total)}
                        onChange={(e) => handleItemChange(index, 'total', e.target.value)}
                    />
                  </div>
                  <div className="col-span-1 flex items-end">
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteItem(index)}
                        disabled={items.length === 1}
                        className="h-10 w-10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete item</span>
                    </Button>
                  </div>
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                onClick={() => setItems([...items, {
                  article: '',
                  weight: '',
                  weightUnit: 'kg',
                  price: '',
                  subtotal: 0,
                  iva: 10,
                  total: 0
                }])}
            >
              Añadir Artículo
            </Button>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full">Generar Factura</Button>
      </form>
  )
}