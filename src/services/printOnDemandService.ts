import type { PdfExportResult } from './pdfExportService';

export type PrintPartner = 'mixam' | 'blurb' | 'printify';
export type BindingType = 'perfect-bound' | 'hardcover' | 'saddle-stitched';
export type PaperType = 'matte' | 'lustre' | 'premium-uncoated';

export type PrintOrder = {
  id: string;
  partner: PrintPartner;
  pdfId: string;
  bindingType: BindingType;
  paperType: PaperType;
  status: 'draft' | 'uploaded' | 'submitted' | 'in-production' | 'shipped';
  trackingCode?: string;
};

const orders = new Map<string, PrintOrder>();

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function uploadPdfToPrintPartner(partner: PrintPartner, pdf: PdfExportResult) {
  const order: PrintOrder = {
    id: createId(partner),
    partner,
    pdfId: pdf.id,
    bindingType: 'perfect-bound',
    paperType: 'matte',
    status: 'uploaded',
  };
  orders.set(order.id, order);
  return order;
}

export async function submitPrintOrder(
  orderId: string,
  options: { bindingType: BindingType; paperType: PaperType },
) {
  const order = orders.get(orderId);
  if (!order) {
    throw new Error('Print order not found.');
  }

  const submitted: PrintOrder = {
    ...order,
    ...options,
    status: 'submitted',
    trackingCode: `KS-${order.partner.toUpperCase()}-${order.id.slice(-6)}`,
  };
  orders.set(orderId, submitted);
  return submitted;
}

export async function trackPrintOrder(orderId: string) {
  const order = orders.get(orderId);
  if (!order) {
    throw new Error('Print order not found.');
  }

  return {
    ...order,
    status: order.status === 'submitted' ? 'in-production' : order.status,
  } satisfies PrintOrder;
}
