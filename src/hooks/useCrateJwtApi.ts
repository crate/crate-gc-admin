import axios from 'axios';
import { useGCContext } from 'contexts';

export default function useCrateJwtApi() {
  const { crateUrl, sessionTokenKey } = useGCContext();

  const instance = axios.create({
    baseURL: crateUrl,
    withCredentials: false,
  });

  instance.interceptors.request.use(config => {
    config.headers.Authorization = `Bearer ${sessionStorage.getItem(sessionTokenKey)}`;
    return config;
  });

  return instance;
}
