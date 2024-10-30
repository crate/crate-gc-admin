import { QueryResults } from 'types/query';
import useJWTManagerStore from 'state/jwtManager';

export type ExecuteSqlResult = {
  data: QueryResults | null;
  status: number;
  success: boolean;
};

export default function useExecuteSql() {
  const executeSql = async (
    sql: string,
    url?: string,
  ): Promise<ExecuteSqlResult> => {
    const headers = await useJWTManagerStore.getState().getHeaders();

    const res = await fetch(useJWTManagerStore.getState().getUrl(url), {
      body: JSON.stringify({ stmt: sql }),
      headers: headers,
      method: 'POST',
    });

    const data = await res.json();

    return {
      data,
      status: res.status,
      success: true,
    };
  };

  return executeSql;
}
