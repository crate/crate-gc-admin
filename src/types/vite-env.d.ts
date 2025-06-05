/// <reference types="vite/client" />

interface ImportMetaEnv {
  TZ: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
