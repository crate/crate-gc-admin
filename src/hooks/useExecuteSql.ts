import { QueryResults } from 'types/query';
import { apiPost } from 'utils/api';
import useGcApi from 'hooks/useGcApi';
import useCrateApi from 'hooks/useCrateApi';
import { ConnectionStatus, useGCContext } from 'contexts';

export type ExecuteSqlResult = {
  data: QueryResults | null;
  status: number;
  success: boolean;
};

export default function useExecuteSql() {
  const gcApi = useGcApi();
  const crateApi = useCrateApi();
  const { gcStatus } = useGCContext();

  const isGcConnected = gcStatus === ConnectionStatus.CONNECTED;
  const endpoint = isGcConnected ? gcApi : crateApi;
  const api = isGcConnected
    ? '/api/_sql?error_trace&types'
    : '/_sql?error_trace&types';

  const executeSql = async (query: string): Promise<ExecuteSqlResult> => {
    const response = await apiPost<QueryResults>(
      endpoint,
      api,
      { stmt: query },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        credentials: 'include',
      },
      false,
    );

    return {
      data: response.data,
      status: response.status,
      success: true,
    };
  };

  return executeSql;
}
