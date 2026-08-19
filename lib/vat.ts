export const VAT_RATE = 0.16;

export function vatBreakdown(subtotal: number) {
  const vat = Math.round(subtotal * VAT_RATE);
  return { subtotal, vat, total: subtotal + vat };
}