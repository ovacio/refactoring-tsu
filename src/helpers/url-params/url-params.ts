import { EMPTY_STRING } from "../../constants/event-constants/event.constants";


export const getUrlParam = (
  searchParams: URLSearchParams,
  key: string,
  defaultValue: string = EMPTY_STRING
): string => {
  return searchParams.get(key) || defaultValue;
};

export const getNumberUrlParam = (
  searchParams: URLSearchParams,
  key: string,
  defaultValue: number
): number => {
  const value = searchParams.get(key);
  return value ? parseInt(value, 10) : defaultValue;
};

export const buildSearchParams = (
  params: Record<string, string | number>
): URLSearchParams => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== EMPTY_STRING && value != null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  
  return searchParams;
};