import { Ace } from 'ace-builds';
import { QueryResultError, QueryResults } from 'types/query';

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
    const err = results.find(r => 'error' in r) as QueryResultError;
    if (!err) {
      return;
    }

    if (typeof err.line !== 'undefined') {
      return [
        {
          row: err.line,
          column: 0,
          text: 'error' in err ? err.error.message : '',
          type: 'error',
        },
      ];
    }

    if (!err.original_query) {
      return;
    }
    const query = err.original_query.query;
    // we take the 1st 100 lines and see if any of them are contained in the
    // query that failed. A rather naive approach.
    const lines = ace.getSession().getLines(0, 100);

    let currentString = '';
    let pos: number | null = null;
    let lineIndex = lines.length - 1;
    for (const line of lines.reverse()) {
      currentString = `${line}${lineIndex < lines.length ? '\n' : ''}${currentString}`;
      if (currentString.startsWith(query)) {
        pos = lineIndex;
      }
      lineIndex--;
    }

    if (pos !== null) {
      return [
        {
          row: pos,
          column: 0,
          text: 'error' in err ? err.error.message : '',
          type: 'error',
        },
      ];
    }
    return;
  }

  if ('error' in results) {
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
