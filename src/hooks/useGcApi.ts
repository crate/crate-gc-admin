import axios from 'axios';
import useJWTManagerStore from 'state/jwtManager';

export default function useGcApi() {
  const gcUrl = useJWTManagerStore(state => state.gcUrl);
  const getToken = useJWTManagerStore(state => state.getToken);

  const instance = axios.create({
    baseURL: gcUrl,
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
