export type ApiError<T> = {
  errors: {
    [key in keyof T]: string[];
  };
  message: string;
  success: boolean;
};
