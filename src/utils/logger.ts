const stamp = () => new Date().toISOString();

export const log = {
  info: (msg: string) => console.log(`[INFO]  ${stamp()} ${msg}`),
  step: (msg: string) => console.log(`[STEP]  ${stamp()} ${msg}`),
  warn: (msg: string) => console.warn(`[WARN]  ${stamp()} ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${stamp()} ${msg}`),
};
