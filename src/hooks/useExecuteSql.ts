import { QueryResults } from 'types/query';
import { apiPost } from 'utils/api';
import { jwtDecode } from 'jwt-decode';
import useGcApi from 'hooks/useGcApi';
import useCrateApi from 'hooks/useCrateApi';
import useCrateJwtApi from './useCrateJwtApi';
import { ConnectionStatus, useGCContext } from 'contexts';
import { CRATE_AUTHENTICATE_VIA_JWT_MIN_VERSION } from 'constants/database';
import { compare } from 'compare-versions';

export type ExecuteSqlResult = {
  data: QueryResults | null;
  status: number;
  success: boolean;
};

export default function useExecuteSql() {
  const gcApi = useGcApi();
  const crateApi = useCrateApi();
  const crateJwtApi = useCrateJwtApi();
  const { crateVersion, gcStatus, onGcApiJwtExpire, sessionTokenKey } =
    useGCContext();

  const isGcConnected = gcStatus === ConnectionStatus.CONNECTED;

  // check if the crate version supports JWT authentication
  // (in the case of gc-admin, the crate version is always undefined)
  // and that we have the onGcApiJwtExpire function to fetch a new token
  const crateAcceptsJwt =
    onGcApiJwtExpire &&
    crateVersion !== undefined &&
    compare(crateVersion, CRATE_AUTHENTICATE_VIA_JWT_MIN_VERSION, '>=');

  const executeSql = async (query: string): Promise<ExecuteSqlResult> => {
    const token = sessionStorage.getItem(sessionTokenKey);

    if (crateAcceptsJwt) {
      let refreshToken = token == null;

      // decode the token
      if (token) {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp) {
          // check for token expiry
          const exp = decodedToken.exp * 1000;
          const now = new Date().getTime();
          refreshToken = exp < now;
        } else {
          // token is malformed
          refreshToken = true;
        }
      }

      if (refreshToken) {
        await onGcApiJwtExpire();
      }
    }

    let endpoint = crateJwtApi;
    let api = '/_sql?error_trace&types';
    if (!crateAcceptsJwt || (crateAcceptsJwt && !token)) {
      endpoint = isGcConnected ? gcApi : crateApi;
      api = isGcConnected
        ? '/api/_sql?error_trace&types'
        : '/_sql?error_trace&types';
    }

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
