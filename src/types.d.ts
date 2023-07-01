declare global {
  interface Window {
  }
}

export interface LTIStorageParams  {
  target: string;
  originSupportBroken: boolean;
  oidcUrl: string;
}

export interface InitSettings {
  state: string;
  csrfToken: string;
  response_url: string;
  ltiStorageParams: LTIStorageParams;
  relaunchInitUrl: string;
  privacyPolicyUrl?: string;
  privacyPolicyMessage?: string;
}

export interface RedirectSettings {
  requireCsrf: boolean;
  state: string;
  ltiStorageParams: LTIStorageParams,
}
