import jsPDF from 'jspdf'
import { Invoice } from '@/lib/types'

export const generatePDF = async (invoice: Invoice) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    })

    doc.setTextColor(0, 0, 0)

    // Add logo
    try {
        const logoWidth = 30
        const logoHeight = 30
        doc.addImage('/logo.jpg', 'JPEG', doc.internal.pageSize.width - 50, 10, logoWidth, logoHeight)
    } catch (error) {
        console.error('Error loading logo:', error)
    }

    // Header - FACTURA
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('FACTURA', 20, 30)

    // Invoice details
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Factura n.° ${invoice.invoiceNumber}`, 20, 45)
    doc.text(`Fecha: ${invoice.date}`, 20, 52)

    // Company details (right aligned)
    const rightMargin = doc.internal.pageSize.width - 20
    doc.setFontSize(11)
    doc.text([
        'Charcuteria Nacho',
        'Ignacio Dominguez Huerta',
        'NIF: 06560870M',
        'Tel: 628703287'
    ], rightMargin, 50, { align: 'right' })

    // Billing section
    doc.text('FACTURAR A:', 20, 75)
    if (invoice.billingDetails) {
        doc.text(invoice.billingDetails.name, 55, 65)
        doc.text([
            invoice.billingDetails.taxId,
            invoice.billingDetails.address,
            invoice.billingDetails.postalCode
        ], 55, 72)
    }

    // Table headers
    const tableTop = 95
    const columnConfig = {
        articulo: { x: 20, width: 70 },
        peso: { x: 70, width: 30 },
        precio: { x: 100, width: 25 },
        subtotal: { x: 125, width: 25 },
        iva: { x: 150, width: 20 },
        total: { x: 170, width: 25 }
    }

    // Headers
    Object.entries(columnConfig).forEach(([key, value]) => {
        doc.text(key.charAt(0).toUpperCase() + key.slice(1), value.x, tableTop)
    })

    // Draw line under headers
    doc.line(20, tableTop + 2, rightMargin, tableTop + 2)

    // Table content
    let currentY = tableTop + 10
    invoice.items.forEach(item => {
        doc.text(item.article, columnConfig.articulo.x, currentY)
        doc.text(`${item.weight} ${item.weightUnit}`, columnConfig.peso.x, currentY)
        doc.text(`${parseFloat(item.price).toFixed(2)}`, columnConfig.precio.x, currentY, { align: 'left' })
        doc.text(`${item.subtotal.toFixed(2)}`, columnConfig.subtotal.x, currentY, { align: 'left' })
        doc.text(`${item.iva}%`, columnConfig.iva.x, currentY, { align: 'left' })
        doc.text(
            `${typeof item.total === 'number' ? item.total.toFixed(2) : String(item.total)}`,
            columnConfig.total.x,
            currentY,
            { align: 'left' }
        )
        currentY += 8
    })

    // Line under items
    doc.line(20, currentY + 5, rightMargin, currentY + 5)

    // Totals section
    const bottomY = doc.internal.pageSize.height - 65
    const totalsX = rightMargin - 40
    const totalsLabelX = rightMargin - 80

    // Line above totals
    doc.line(totalsLabelX, bottomY - 5, rightMargin, bottomY - 5)

    doc.text('Subtotal:', totalsLabelX, bottomY)
    doc.text(`${invoice.subtotal.toFixed(2)}`, totalsX, bottomY, { align: 'right' })

    doc.setFont('helvetica', 'bold')
    doc.text('Impuestos:', totalsLabelX, bottomY + 7)
    doc.setFont('helvetica', 'normal')
    doc.text(`${invoice.tax.toFixed(2)}`, totalsX, bottomY + 7, { align: 'right' })

    doc.setFont('helvetica', 'bold')
    doc.text('Total:', totalsLabelX, bottomY + 14)
    doc.text(`${invoice.total.toFixed(2)}€`, totalsX, bottomY + 14, { align: 'right' })

    // Thank you message
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('¡Gracias por su compra!', 20, bottomY + 25)

    // Draw line above footer
    doc.line(20, bottomY + 30, rightMargin, bottomY + 30)

    // Payment information
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Información de pago', 20, bottomY + 40)
    doc.setFont('helvetica', 'normal')
    doc.text([
        'Efectivo',
        'Tarjeta',
        'Bizum: 628703287'
    ], 20, bottomY + 47)

    // Contact information
    doc.setFont('helvetica', 'bold')
    doc.text('Contacto', rightMargin - 80, bottomY + 40)
    doc.setFont('helvetica', 'normal')
    doc.text([
        'Charcuteria y Jamoneria Nacho',
        'C/ Angel Luis de la Herran 27',
        '28043 Madrid',
        'Tel:628703287'
    ], rightMargin - 80, bottomY + 47)

    // Save the PDF
    doc.save(`factura-${invoice.invoiceNumber}.pdf`)
}

