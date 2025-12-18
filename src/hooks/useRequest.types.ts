export type RequestFunction = <T>(
  promise: Promise<T>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (data: T) => void;
  }
) => Promise<T>;

export type useRequestReturn = {
  request: RequestFunction;
};