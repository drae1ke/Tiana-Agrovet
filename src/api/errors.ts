import { AxiosError } from 'axios';

interface ValidationError {
  field?: string;
  message: string;
}

interface ApiErrorPayload {
  message?: string;
  errors?: ValidationError[];
}

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<ApiErrorPayload>;

  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }

  return fallback;
};

export const getApiValidationMessages = (error: unknown) => {
  const axiosError = error as AxiosError<ApiErrorPayload>;
  return axiosError.response?.data?.errors ?? [];
};
