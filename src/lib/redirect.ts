import { RedirectSettings, LTIStorageParams } from '../types';

function submitForm(): void {
  document?.forms[0]?.submit();
}

function showError(): void {
  const error = document.getElementById('error');
  if (error) {
    error.classList.remove('hidden');
  }
}

function hasCookie(settings: RedirectSettings): boolean {
  return !!document.cookie.match(`(^|;)\\s*open_id_${settings.state}`);
}

function loadCsrf(state: string, storage_params: LTIStorageParams): Promise<string> {
  return new Promise((resolve, reject) => {
    let platformOrigin = new URL(storage_params.platformOIDCUrl).origin;
    let frameName = storage_params.target;
    let parent = window.parent || window.opener;
    let targetFrame = frameName === '_parent' ? parent : parent.frames[frameName];

    if (storage_params.originSupportBroken) {
      // The spec requires that the message's target origin be set to the platform's OIDC Authorization url
      // but Canvas does not yet support this, so we have to use '*'.
      platformOrigin = '*';
    }

    const timeout = setTimeout(() => {
      console.log('postMessage timeout');
      reject(new Error('Timeout while waiting for platform response'));
    }, 2000);

    const receiveMessage = (event: MessageEvent) => {
      if (
        typeof event.data === 'object' &&
        event.data.subject === 'lti.get_data.response' &&
        event.data.message_id === state &&
        (event.origin === platformOrigin || platformOrigin === '*')
      ) {
        removeEventListener('message', receiveMessage);
        clearTimeout(timeout);

        if (event.data.error) {
          // handle errors
          console.log(event.data.error.code);
          console.log(event.data.error.message);
          reject(new Error(event.data.errormessage));
        }
        resolve(event.data.value);
      }
    };
    window.addEventListener('message', receiveMessage);

    targetFrame.postMessage(
      {
        subject: 'lti.get_data',
        message_id: state,
        key: `atomic_lti_${state}`,
      },
      platformOrigin,
    );

    // Platform will post a message back
  });
}

export async function doLtiRedirect(settings: RedirectSettings): Promise<void> {
  if (hasCookie(settings) || !settings.requireCsrf) {
    return submitForm();
  }

  if (settings.ltiStorageParams) {
    // We have lti postMessage storage
    try {
      const csrfToken = await loadCsrf(settings.state, settings.ltiStorageParams);
      const csrfInput = document.getElementsByName('csrfToken')[0] as HTMLInputElement;
      csrfInput.value = csrfToken;
      return submitForm();
    } catch (e) {
      console.log(e);
      showError();
    }
  }
  submitForm();
}