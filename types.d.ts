import { IdToken } from './src/libs/lti_definitions';

declare global {
  interface Window {
  }
}

export interface LTIStorageParams {
  target: string;
  originSupportBroken: boolean;
  platformOIDCUrl: string;
}

export interface InitSettings {
  state: string;
  responseUrl: string;
  ltiStorageParams: LTIStorageParams;
  relaunchInitUrl: string;
  openIdCookiePrefix: string;
  privacyPolicyUrl?: string;
  privacyPolicyMessage?: string;
}

export interface RedirectSettings {
  ltiStorageParams: LTIStorageParams;
}

export interface LaunchSettings {
  stateVerified: boolean;
  idToken: IdToken;
  state: string;
  ltiStorageParams?: LTIStorageParams;
}
