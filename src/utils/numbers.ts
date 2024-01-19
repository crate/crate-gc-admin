export function formatNum(num: number | undefined, digits = 2) {
  if (num == undefined || isNaN(num)) {
    return;
  }
  return num.toLocaleString('en', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

export function formatHumanReadable(num: number | undefined) {
  if (num == undefined || isNaN(num)) {
    return;
  }
  return Intl.NumberFormat('en', {
    notation: 'compact',
    unitDisplay: 'narrow',
  }).format(num);
}
