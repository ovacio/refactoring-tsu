import { EMPTY_STRING } from "../../constants/event-constants/event.constants.ts";

export const buildFilteredSearchParams = (
  params: Record<string, string | number>
) =>
  Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => [key, String(value)])
      .filter(([_, value]) => value !== EMPTY_STRING && value.trim() !== "")
  );
