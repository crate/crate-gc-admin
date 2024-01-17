export function formatNum(num: number, digits = 2) {
  return num.toLocaleString('en', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}
