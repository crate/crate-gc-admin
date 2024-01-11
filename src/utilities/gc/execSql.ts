type Error = {
  code: number;
  message: string;
};

type QueryResults = {
  cols: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[][];
  rowcount: bigint;
  duration: number;
  original_query: string | undefined;
  error: Error | undefined;
};

type ExecResult = {
  data: QueryResults;
  status: number;
};

async function execSql(url: string | undefined, sql: string): Promise<ExecResult> {
  if (!url) {
    throw 'URL Not specified';
  }

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ stmt: sql }),
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    credentials: 'include',
  });

  return { data: await response.json(), status: response.status };
}

export type { Error, QueryResults, ExecResult };
export default execSql;
