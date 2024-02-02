import type { AxiosInstance } from 'axios';

export default (axiosInstance: AxiosInstance) => {
  return async (url: string) => {
    const res = await axiosInstance.get(url, {
      withCredentials: true,
    });
    return res.data;
  };
};
