import {
  builtinFunctions,
  dataTypes,
  keywords,
} from '../../constants/cratedbEditorKeywords';
import type { Ace } from 'ace-builds';

type Completion = {
  caption: string;
  value: string;
  score: number;
  meta: string;
};

function buildCompletions(list: string, meta: string, score: number): Completion[] {
  return list.split('|').map(word => {
    return { caption: word, value: word, score, meta };
  });
}

const allCompletions: Completion[] = [
  ...buildCompletions(keywords, 'keyword', 1000),
  ...buildCompletions(builtinFunctions, 'function', 900),
  ...buildCompletions(dataTypes, 'type', 800),
];

export const crateDbCompleter: Ace.Completer = {
  getCompletions(
    _editor: Ace.Editor,
    _session: Ace.EditSession,
    _pos: Ace.Point,
    prefix: string,
    callback: (err: null, completions: Completion[]) => void,
  ): void {
    if (!prefix || prefix.length < 2 || /^\d/.test(prefix)) {
      callback(null, []);
      return;
    }
    const lower = prefix.toLowerCase();
    const filtered = allCompletions.filter(c =>
      c.value.toLowerCase().startsWith(lower),
    );
    callback(null, filtered);
  },
};
