type KeysMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

export const sortByString = <T, K extends KeysMatching<T, string>>(key: K) => {
  return (a: T, b: T) => {
    if (a[key] < b[key]) {
      return -1;
    }
    if (a[key] > b[key]) {
      return 1;
    }
    return 0;
  };
};
