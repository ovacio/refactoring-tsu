import { EventFormat } from "../../services/event.service";

export const BREADCRUMB_SEPARATOR = " / ";
export const EMPTY_STRING = "";

export const CYRILLIC_ALPHABET = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯ";

export const PAGE_SIZE = 15;
export const PAGE_DEFAULT = 1;

export const TIMEZONE_OFFSET = 420;

export const FORMAT_TEXTS = {
  [EventFormat.Online]: "Онлайн",
  [EventFormat.Offline]: "Оффлайн",
} as const;
