// --- LogService.ts ---
let logCallback: ((msg: string) => void) | null = null;

export const setLogCallback = (cb: (msg: string) => void) => {
  logCallback = cb;
};

export const log = (msg: string) => {
  console.log(msg); // デバッグ用にも出す
  if (logCallback) {
    logCallback(msg);
  }
};
