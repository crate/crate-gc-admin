import wrap from 'word-wrap';

export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const wrapText = (text: string, wrapSize: number) => {
  return text
    .split('\n')
    .map(line => wrap(line, { width: wrapSize, indent: '' }).trimEnd())
    .join('\n');
};
