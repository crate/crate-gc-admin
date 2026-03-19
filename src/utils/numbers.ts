import prettyBytes from "pretty-bytes";

export function formatNum(num: number | undefined, digits = 2, suffix = '') {
  if (num == undefined || isNaN(num)) {
    return;
  }
  return num.toLocaleString('en', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }) + suffix;
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

export function formatBytes(num: number | undefined, digits = 2, suffix = '') {
  if (num == undefined || isNaN(num)) {
    return;
  }
  return prettyBytes(num, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }) + suffix;
}