/**
 * Formatters and numeric limiters for BebêAqui forms
 * Ensures strict limitation of digits and uniform Brazilian masks
 */

// CNPJ: 14 digits -> 00.000.000/0001-00 (max 18 chars)
export const formatCNPJ = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
};

// Phone / WhatsApp: 10 or 11 digits -> (00) 0000-0000 or (00) 00000-0000 (max 15 chars)
export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

// CEP: 8 digits -> 00000-000 (max 9 chars)
export const formatCEP = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
};

// Address number: numbers only, limited to maxLength digits (default 6)
export const formatAddressNumber = (value: string, maxLength: number = 6): string => {
  return value.replace(/\D/g, '').slice(0, maxLength);
};

// CPF: 11 digits -> 000.000.000-00 (max 14 chars)
export const formatCPF = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
};

// Bank Agency: numbers only, up to 5 digits
export const formatAgency = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, 5);
};

// Bank Account: numbers and optional hyphen digit, up to 12 chars
export const formatBankAccount = (value: string): string => {
  const cleaned = value.toUpperCase().replace(/[^0-9X-]/g, '').slice(0, 12);
  return cleaned;
};

// Helper to count clean digits
export const getDigitCount = (value: string): number => {
  return value.replace(/\D/g, '').length;
};
