//Преобразуем номер
export function parsePhone(input: string): number | null {
  const value = input.trim();
  if (value.length > 32 || !/^\+?[\d\s()-]+$/.test(value)) return null;

  let digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8"))
    digits = `7${digits.slice(1)}`;

  const isRussia = digits.length === 11 && digits.startsWith("7");
  const isBelarus = digits.length === 12 && digits.startsWith("375");
  return isRussia || isBelarus ? Number(digits) : null;
}
