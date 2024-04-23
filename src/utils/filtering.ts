import { FilterFn } from '@tanstack/react-table';

export const arrIncludesElement: FilterFn<unknown> = (
  row,
  columnId,
  value: unknown[],
) => {
  if (value.length === 0) {
    // When filter is empty, return all the elements.
    return true;
  }
  const elementValue = row.getValue<unknown>(columnId);
  return value.includes(elementValue);
};
