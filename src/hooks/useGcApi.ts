import axios from 'axios';
import useJWTManagerStore from 'state/jwtManager';

export default function useGcApi() {
  const jwtClusters = useJWTManagerStore(state => state.clusters);
  const getToken = useJWTManagerStore(state => state.getToken);

  const instance = axios.create({
    baseURL: jwtClusters.default.gcUrl,
    withCredentials: true,
  });

  instance.interceptors.request.use(async config => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
}
