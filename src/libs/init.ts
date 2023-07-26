import i18next from "i18next";
import { STATE_KEY_PREFIX } from './constants';
import { InitSettings, LTIStorageParams } from '../types';

function privacyHtml(settings: InitSettings) {
  return i18next.t(settings.privacyPolicyMessage || `We use cookies for login and security.`) + ' '
    + i18next.t(`Learn more in our <a href='{{url}}' target='_blank'>privacy policy</a>.`);
}

function showLaunchNewWindow(settings: InitSettings, options: { disableLaunch: boolean, showRequestStorageAccess: boolean, showStorageAccessDenied: boolean }) {
  const { disableLaunch, showRequestStorageAccess, showStorageAccessDenied } = options;
  const container = document.getElementById('main-content');
  if (!container) {
    throw i18next.t('Could not find main-content element');
  }
  container.innerHTML = `
    <div class="aj-centered-message">
      <h1 class="aj-title">
        <i class="material-icons-outlined aj-icon" aria-hidden="true">cookie_off</i>
        ${ i18next.t("Cookies Required") }
      </h1>
      <p class="aj-text">
        ${ privacyHtml(settings) } </p>
      <p class="aj-text">
        ${ i18next.t('Please click the button below to reload in a new window.') }
      </p>
      <button id="button_launch_new_window" class="aj-btn aj-btn--blue" ${ disableLaunch? 'disabled=""' : '' } >
        ${ i18next.t('Open in a new window') }
      </button>
      </a>
      ${ showRequestStorageAccess? `
        <div id="request_storage_access">
          <p class="aj-text">
            ${ i18next.t("If you have used this application before, your browser may allow you to <a id='request_storage_access_link' href='#'>enable cookies</a> and prevent this message in the future.") }
          </p>
        </div>
      `:''}
      ${ showStorageAccessDenied? `
      <div id="request_storage_access_error" class="u-flex">
        <i class="material-icons-outlined aj-icon" aria-hidden="true">warning</i>
        <p class="aj-text">
        ${ i18next.t('The browser prevented access.  Try launching in a new window first and then clicking this option again next time. If that doesn\'t work check your privacy settings. Some browsers will prevent all third party cookies.') }
        </p>
      </div>
      `:''}
    </div>
  `;

  document.getElementById("button_launch_new_window")!.onclick = () => launchNewWindow(settings);

  if (showRequestStorageAccess) {
    document.getElementById("request_storage_access_link")!.
      onclick = () => tryRequestStorageAccess(settings);
  }
}

function showCookieError(settings: InitSettings) {
  const container = document.getElementById('main-content');

  if (!container) {
    throw i18next.t('Could not find main-content element');
  }

  container.innerHTML = `
    <div id="cookie_error" class="aj-centered-message">
      <h1 class="aj-title">
        <i class="material-icons-outlined aj-icon" aria-hidden="true">cookie_off</i>
        ${ i18next.t("Cookies Required") }
      </h1>
      <p class="aj-text">
        ${ privacyHtml(settings) }
      </p>
      <p class="aj-text">
        ${ i18next.t("Please check your browser settings and enable cookies.") }
      </p>
    </div>
  `;
}

export function launchNewWindow(settings: InitSettings) {
  window.open(settings.relaunchInitUrl);
  showLaunchNewWindow(settings, { disableLaunch: true, showRequestStorageAccess: false, showStorageAccessDenied: false });
}

function storeState(state: string, storageParams: LTIStorageParams): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let platformOrigin = new URL(storageParams.platformOIDCUrl).origin;
    let frameName = storageParams.target;
    let parent = window.parent || window.opener;
    let targetFrame = frameName === "_parent" ? parent : parent.frames[frameName];

    if (storageParams.originSupportBroken) {
      // The spec requires that the message's target origin be set to the platform's OIDC Authorization url
      // but Canvas does not yet support this, so we have to use '*'.
      platformOrigin = '*';
    }

    let timeout = setTimeout(() => {
      console.error("postMessage timeout");
      reject(new Error(i18next.t('Timeout while waiting for platform response')));
    }, 2000);

    let receiveMessage = (event: any) => {
      if (typeof event.data === "object" &&
          event.data.subject === "lti.put_data.response" &&
          event.data.message_id === state &&
          (event.origin === platformOrigin ||
            (storageParams.originSupportBroken && platformOrigin === "*"))) {

        removeEventListener('message', receiveMessage);
        clearTimeout(timeout);

        if (event.data.error) {
          // handle errors
          console.error(event.data.error.code);
          console.error(event.data.error.message);
          reject(new Error(event.data.errormessage));
        }
        resolve();
      }
    };

    window.addEventListener('message', receiveMessage);
    targetFrame?.postMessage({
      "subject": "lti.put_data",
      "message_id": state,
      "key": `${STATE_KEY_PREFIX}${state}`,
      "value": state,
    }, platformOrigin);

    // Platform should post a message back
  });
}

export function tryRequestStorageAccess(settings: InitSettings) {
  document.requestStorageAccess()
    .then(() => {
      // We should have cookies now
      setCookie(settings);
      window.location.replace(settings.responseUrl);
    })
    .catch((e) => {
      console.log(e);
      showLaunchNewWindow(settings, { showStorageAccessDenied: true, disableLaunch: true, showRequestStorageAccess: false });
    });
}

function hasCookie(settings: InitSettings) {
  if (document.cookie) {
    return document.cookie.match(`(^|;)\\s*${settings.openIdCookiePrefix}` + settings.state);
  }
  return false;
}

function setCookie(settings: InitSettings) {
  document.cookie = settings.openIdCookiePrefix + settings.state +'=1; path=/; max-age=60; SameSite=None;'
}

function hasStorageAccessAPI() {
  return typeof document.hasStorageAccess === 'function'
    && typeof document.requestStorageAccess === 'function';
}

export async function doLtiStorageLaunch(settings: InitSettings) {
  let submitToPlatform = () => { window.location.replace(settings.responseUrl) };

  if (hasCookie(settings)) {
    // We have cookies
    return submitToPlatform();
  }

  if (settings.ltiStorageParams) {
    // We have lti postMessage storage
    try {
      await storeState(settings.state, settings.ltiStorageParams);
      return submitToPlatform();
    } catch (e) {
      console.error(e);
    }
  }

  if (window.self !== window.top) {
    let showRequestStorageAccess = false;
    if (hasStorageAccessAPI()) {
      // We have storage access API, which will work for Safari as long as the
      // user already has used the application in the top layer and it set a cookie.
      try {
        let hasAccess = await document.hasStorageAccess();
        if (!hasAccess) {
          showRequestStorageAccess = true;
        }
      } catch(e) {
        console.log(e);
      }
    }
    showLaunchNewWindow(settings, { showRequestStorageAccess, disableLaunch: false, showStorageAccessDenied: false });
  } else {
    showCookieError(settings);
  }
}