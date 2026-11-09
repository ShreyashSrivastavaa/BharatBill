import { Injectable, InternalServerErrorException } from '@nestjs/common';
import PDFDocument from 'pdfkit';

export interface InvoicePdfData {
  invoiceNumber: string;
  date: Date | string;
  dueDate?: Date | string | null;
  status: string;
  placeOfSupply?: string | null;
  subtotal: any;
  discountAmount: any;
  taxableAmount: any;
  cgst: any;
  sgst: any;
  igst: any;
  roundOff: any;
  total: any;
  amountPaid: any;
  business: {
    name: string;
    legalName?: string | null;
    gstin?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    stateCode?: string | null;
    pincode?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  customer?: {
    name: string;
    gstin?: string | null;
    billingAddress?: string | null;
    city?: string | null;
    state?: string | null;
    stateCode?: string | null;
    phone?: string | null;
  } | null;
  items: Array<{
    productName: string;
    hsn?: string | null;
    quantity: any;
    unit?: string | null;
    rate: any;
    gstRate: any;
    taxableAmount: any;
    amount?: any;
    total?: any;
  }>;
}

@Injectable()
export class PdfService {
  async generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        const primaryColor = '#1e3a8a'; // Deep Navy
        const darkColor = '#1f2937';
        const mutedColor = '#6b7280';
        const borderColor = '#e5e7eb';

        // ─── Header ──────────────────────────────────────────────────────────
        doc
          .fillColor(primaryColor)
          .fontSize(20)
          .font('Helvetica-Bold')
          .text(data.business.name.toUpperCase(), 40, 40);

        if (data.business.legalName && data.business.legalName !== data.business.name) {
          doc
            .fillColor(mutedColor)
            .fontSize(9)
            .font('Helvetica')
            .text(`(${data.business.legalName})`, 40, 65);
        }

        const bizAddr = [
          data.business.address,
          data.business.city,
          data.business.state ? `${data.business.state} (${data.business.stateCode || ''})` : null,
          data.business.pincode,
        ]
          .filter(Boolean)
          .join(', ');

        doc
          .fillColor(darkColor)
          .fontSize(8)
          .font('Helvetica')
          .text(bizAddr, 40, 80, { width: 280 });

        if (data.business.gstin) {
          doc
            .font('Helvetica-Bold')
            .text(`GSTIN: `, 40, 95, { continued: true })
            .font('Helvetica')
            .text(data.business.gstin);
        }

        if (data.business.phone || data.business.email) {
          const contact = [data.business.phone, data.business.email].filter(Boolean).join(' | ');
          doc.text(`Contact: ${contact}`, 40, 108);
        }

        // Title & Tax Badge on the Right
        doc
          .fillColor(primaryColor)
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('TAX INVOICE', 350, 40, { align: 'right' });

        doc
          .fillColor(mutedColor)
          .fontSize(8)
          .font('Helvetica')
          .text('ORIGINAL FOR RECIPIENT', 350, 60, { align: 'right' });

        doc
          .fontSize(9)
          .fillColor(darkColor)
          .font('Helvetica-Bold')
          .text(`Invoice No: `, 350, 78, { align: 'right', continued: true })
          .font('Helvetica')
          .text(data.invoiceNumber);

        const formattedDate = new Date(data.date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        doc
          .font('Helvetica-Bold')
          .text(`Date: `, 350, 92, { align: 'right', continued: true })
          .font('Helvetica')
          .text(formattedDate);

        if (data.placeOfSupply) {
          doc
            .font('Helvetica-Bold')
            .text(`Place of Supply: `, 350, 106, { align: 'right', continued: true })
            .font('Helvetica')
            .text(data.placeOfSupply);
        }

        // Horizontal Divider
        doc
          .moveTo(40, 125)
          .lineTo(555, 125)
          .strokeColor(borderColor)
          .lineWidth(1)
          .stroke();

        // ─── Buyer / Recipient Details ────────────────────────────────────────
        doc
          .fillColor(primaryColor)
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('BILLED TO (BUYER):', 40, 135);

        const custName = data.customer?.name || 'Walk-in Customer / Counter Sale';
        doc
          .fillColor(darkColor)
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(custName, 40, 148);

        const custAddr = [
          data.customer?.billingAddress,
          data.customer?.city,
          data.customer?.state ? `${data.customer.state} (${data.customer.stateCode || ''})` : null,
        ]
          .filter(Boolean)
          .join(', ');

        if (custAddr) {
          doc.fontSize(8).font('Helvetica').text(custAddr, 40, 162, { width: 300 });
        }

        const buyerGstin = data.customer?.gstin || 'Unregistered Consumer';
        doc
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('Buyer GSTIN: ', 40, 175, { continued: true })
          .font('Helvetica')
          .text(buyerGstin);

        // ─── Table Header ─────────────────────────────────────────────────────
        const tableTop = 195;
        doc
          .rect(40, tableTop, 515, 20)
          .fillColor('#f8fafc')
          .fill();

        doc
          .rect(40, tableTop, 515, 20)
          .strokeColor(borderColor)
          .stroke();

        doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(8);
        doc.text('#', 45, tableTop + 6, { width: 20 });
        doc.text('Item Description', 70, tableTop + 6, { width: 170 });
        doc.text('HSN', 245, tableTop + 6, { width: 50 });
        doc.text('Qty', 300, tableTop + 6, { width: 45, align: 'right' });
        doc.text('Rate', 355, tableTop + 6, { width: 55, align: 'right' });
        doc.text('GST %', 420, tableTop + 6, { width: 40, align: 'center' });
        doc.text('Amount', 470, tableTop + 6, { width: 80, align: 'right' });

        // ─── Items Rows ───────────────────────────────────────────────────────
        let y = tableTop + 24;
        doc.font('Helvetica').fontSize(8);

        data.items.forEach((item, index) => {
          doc.fillColor(mutedColor).text(String(index + 1), 45, y, { width: 20 });
          doc.fillColor(darkColor).text(item.productName, 70, y, { width: 170 });
          doc.fillColor(mutedColor).text(item.hsn || '—', 245, y, { width: 50 });
          doc
            .fillColor(darkColor)
            .text(`${item.quantity} ${item.unit || 'PCS'}`, 300, y, { width: 45, align: 'right' });
          doc.text(`₹${Number(item.rate).toFixed(2)}`, 355, y, { width: 55, align: 'right' });
          doc.text(`${item.gstRate}%`, 420, y, { width: 40, align: 'center' });
          doc
            .font('Helvetica-Bold')
            .text(`₹${Number(item.amount).toFixed(2)}`, 470, y, { width: 80, align: 'right' })
            .font('Helvetica');

          y += 20;

          // Draw item bottom line
          doc
            .moveTo(40, y - 4)
            .lineTo(555, y - 4)
            .strokeColor('#f1f5f9')
            .lineWidth(0.5)
            .stroke();
        });

        // ─── Summary / Totals Box ─────────────────────────────────────────────
        const summaryTop = Math.max(y + 10, 360);

        // Terms Box on Left
        doc
          .rect(40, summaryTop, 270, 100)
          .strokeColor(borderColor)
          .lineWidth(0.5)
          .stroke();

        doc
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .fontSize(8)
          .text('TERMS & CONDITIONS', 50, summaryTop + 8);

        doc
          .fillColor(mutedColor)
          .font('Helvetica')
          .fontSize(7)
          .text(
            '1. Goods once sold will not be taken back or exchanged.\n' +
              '2. Interest @ 18% p.a. will be charged for delayed payments.\n' +
              '3. Subject to local state jurisdiction only.',
            50,
            summaryTop + 22,
            { width: 250, lineGap: 3 },
          );

        // Totals Breakdown on Right
        let totY = summaryTop;
        const addTotRow = (label: string, val: string, bold = false, color = darkColor) => {
          doc
            .font(bold ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(8)
            .fillColor(color);
          doc.text(label, 330, totY, { width: 130, align: 'right' });
          doc.text(val, 470, totY, { width: 80, align: 'right' });
          totY += 15;
        };

        addTotRow('Taxable Amount:', `₹${Number(data.taxableAmount).toFixed(2)}`);

        if (Number(data.cgst) > 0) {
          addTotRow('CGST:', `₹${Number(data.cgst).toFixed(2)}`);
        }
        if (Number(data.sgst) > 0) {
          addTotRow('SGST:', `₹${Number(data.sgst).toFixed(2)}`);
        }
        if (Number(data.igst) > 0) {
          addTotRow('IGST:', `₹${Number(data.igst).toFixed(2)}`);
        }
        if (Number(data.roundOff) !== 0) {
          addTotRow('Round Off:', `₹${Number(data.roundOff).toFixed(2)}`);
        }

        // Grand Total Line
        doc
          .moveTo(330, totY + 2)
          .lineTo(555, totY + 2)
          .strokeColor(borderColor)
          .stroke();

        totY += 6;
        doc
          .rect(330, totY - 2, 225, 22)
          .fillColor('#eff6ff')
          .fill();

        addTotRow('Grand Total:', `₹${Number(data.total).toFixed(2)}`, true, primaryColor);

        // ─── Signatures & Footer ──────────────────────────────────────────────
        const footerY = 500;
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor(mutedColor)
          .text('This is a computer generated invoice and does not require physical signature.', 40, footerY);

        doc
          .font('Helvetica-Bold')
          .fillColor(darkColor)
          .text(`For ${data.business.name.toUpperCase()}`, 350, footerY, { align: 'right' });

        doc
          .font('Helvetica')
          .fontSize(7)
          .fillColor(mutedColor)
          .text('Authorized Signatory', 350, footerY + 35, { align: 'right' });

        doc.end();
      } catch (error) {
        reject(new InternalServerErrorException('Error generating invoice PDF: ' + error.message));
      }
    });
  }
}
