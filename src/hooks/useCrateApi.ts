import axios from 'axios';
import { useGCContext } from '../contexts';

export default function useCrateApi() {
  const { crateUrl } = useGCContext();

  return axios.create({
    baseURL: crateUrl,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    withCredentials: true,
  });
}
