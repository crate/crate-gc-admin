import { Ace } from 'ace-builds';
import { QueryResults } from 'types/query';

export const annotate = (
  ace: Ace.Editor,
  results: QueryResults,
  text: string,
  localStorageKey?: string,
): Ace.Annotation[] | undefined => {
  if (!results) {
    return;
  }

  // Update Local Storage
  if (localStorageKey) {
    localStorage.setItem(localStorageKey, text);
  }

  if (Array.isArray(results)) {
    const err = results.find(r => r.error);
    if (!err) {
      return;
    }
    const q = err.original_query;
    if (!q) {
      return;
    }
    // we take the 1st 100 lines and see if any of them are contained in the
    // query that failed. A rather naive approach.
    const lines = ace.getSession().getLines(0, 100);
    const trimmed = q.trim();
    const pos = lines
      .map((v, i) => {
        const search = v.trim();
        if (search.length > 0 && trimmed.startsWith(search)) {
          return i;
        }
        return -1;
      })
      .find(v => v > 0);
    if (pos) {
      return [
        {
          row: pos,
          column: 0,
          text: err.error?.message || '',
          type: 'error',
        },
      ];
    }
    return;
  }

  if (results.error) {
    // We always show the 1st line and 1st column as the source of the error.
    return [
      {
        row: 0,
        column: 0,
        text: results.error.message,
        type: 'error',
      },
    ];
  }
};
