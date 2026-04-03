import { Completion } from 'ace-builds-internal/autocomplete';
import { crateDbCompleter } from './cratedbCompleter';

const getCompletions = (prefix: string): Promise<Completion[]> => {
  return new Promise(resolve => {
    crateDbCompleter.getCompletions(
      {} as any,
      {} as any,
      { row: 0, column: 0 },
      prefix,
      (_err, completions: Completion[]) => resolve(completions),
    );
  });
};

describe('crateDbCompleter', () => {
  it('returns no suggestions for empty prefix', async () => {
    const results = await getCompletions('');
    expect(results).toEqual([]);
  });

  it('returns no suggestions for single character', async () => {
    const results = await getCompletions('s');
    expect(results).toEqual([]);
  });

  it('returns no suggestions for digit prefix', async () => {
    const results = await getCompletions('1');
    expect(results).toEqual([]);
  });

  it('returns no suggestions for multi-digit prefix', async () => {
    const results = await getCompletions('123');
    expect(results).toEqual([]);
  });

  it('returns matching keywords for prefix with 2+ characters', async () => {
    const results = await getCompletions('sele');
    expect(results).toEqual([
      { caption: 'select', meta: 'keyword', score: 1000, value: 'select' },
    ]);
  });

  it('does prefix matching only, not substring', async () => {
    const results = await getCompletions('ha1');
    const sha1 = results.find(c => c.value === 'sha1');
    expect(sha1).toBeUndefined();
  });

  it('matches functions in lowercase', async () => {
    const results = await getCompletions('array_a');
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'array_agg', meta: 'function' }),
        expect.objectContaining({ value: 'array_append', meta: 'function' }),
      ]),
    );
  });

  it('matches data types in uppercase', async () => {
    const results = await getCompletions('varc');
    expect(results).toEqual([
      { caption: 'varchar', meta: 'type', score: 800, value: 'varchar' },
    ]);
  });

  it('is case-insensitive', async () => {
    const lower = await getCompletions('sel');
    const upper = await getCompletions('SEL');
    expect(lower).toEqual(upper);
  });
});
