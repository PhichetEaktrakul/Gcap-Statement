const STAGE1_TOKEN = "gcap.stage1_token";
const STAGE2_TOKEN = "gcap.stage2_token";
const REF_CODE = "gcap.ref_code";

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function write(key: string, value: string | null) {
  if (typeof window === "undefined") return;
  if (value === null) window.localStorage.removeItem(key);
  else window.localStorage.setItem(key, value);
}

export const registrationStorage = {
  getStage1Token: () => read(STAGE1_TOKEN),
  setStage1Token: (v: string | null) => write(STAGE1_TOKEN, v),

  getStage2Token: () => read(STAGE2_TOKEN),
  setStage2Token: (v: string | null) => write(STAGE2_TOKEN, v),

  getRefCode: () => read(REF_CODE),
  setRefCode: (v: string | null) => write(REF_CODE, v),

  clear: () => {
    write(STAGE1_TOKEN, null);
    write(STAGE2_TOKEN, null);
    write(REF_CODE, null);
  },
};
