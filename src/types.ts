export type GlPressDetail = undefined;

export type GlChangeDetail =
  | { value: string }
  | { value: number }
  | { checked: boolean }
  | { page: number; pages: number };

export type GlCommitDetail = { value: string };

export type GlCloseDetail = { reason: string };

export type GlSelectDetail = { value: string; index: number };


