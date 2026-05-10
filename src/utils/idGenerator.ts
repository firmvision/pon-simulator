let counter = 0;
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++counter}`;
}

export function generateSerialNumber(vendor = 'HWTC'): string {
  const hex = Math.random().toString(16).substring(2, 10).toUpperCase().padEnd(8, '0');
  return `${vendor}${hex}`;
}
