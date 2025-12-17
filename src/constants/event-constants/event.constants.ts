import { EventFormat } from "../../services/event.service";

export const BREADCRUMB_SEPARATOR = " / ";
export const EMPTY_STRING = "";

export const FORMAT_TEXTS = {
  [EventFormat.Online]: "Онлайн",
  [EventFormat.Offline]: "Оффлайн",
} as const;
