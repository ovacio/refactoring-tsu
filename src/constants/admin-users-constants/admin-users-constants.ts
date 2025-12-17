export const ADMIN_USERS_CONSTANTS = {
  PAGE_SIZE: 15,
  CYRILLIC_ALPHABET: "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯ",
  VIEW_MODE: {
    LIST: "list",
    CARDS: "cards",
  } as const,
  ALPHABET_DEFAULT_LABEL: "А - Я",
  DEFAULT_PAGE: 1,
};

export type ViewMode = typeof ADMIN_USERS_CONSTANTS.VIEW_MODE[keyof typeof ADMIN_USERS_CONSTANTS.VIEW_MODE];
