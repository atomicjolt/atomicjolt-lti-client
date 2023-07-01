import { describe, expect, beforeEach, afterEach, it, vi } from 'vitest';
import { doLtiRedirect } from "./redirect";

const settings = {
  'state': 'state',
  'requireCsrf': true,
  'ltiStorageParams': {
    'target': '_parent',
    'originSupportBroken': true,
    'platformOIDCUrl': 'https://canvas.instructure.com/api/lti/authorize_redirect',
  },
};

describe('test', () => {

  beforeEach(() => {
    document.body.innerHTML = `
      <form action="https://assessments.atomicjolt.xyz/lti_launches/" method="POST">
          <input type="hidden" name="state" id="state" value="state" />
          <input type="hidden" name="id_token" id="id_token" value="id_token" />
          <input type="hidden" name="csrfToken" id="csrfToken" value="" />
      </form>
      <div id="error" class="hidden">error</div>
    `;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.cookie = 'open_id_state=;Max-Age=-1';
  });

  it('submits form when cookie is present', () => {
    vi.spyOn(window.document, 'cookie', 'get').mockReturnValue('open_id_state=jwt');
    const mockSubmit = vi.fn()
    document.forms[0].submit = mockSubmit;
    doLtiRedirect(settings);
    expect(mockSubmit).toHaveBeenCalled();
  });

  it('submits form when cookie is not present and lti storage isn\'t available', () => {
    const mockSubmit = vi.fn()
    document.forms[0].submit = mockSubmit;
    doLtiRedirect({ ...settings, ltiStorageParams: null });
    expect(mockSubmit).toHaveBeenCalled();
  });

  it('uses the lti storage api when available', async () => {
    const postMessageSpy = vi.spyOn(window, 'postMessage')
    doLtiRedirect(settings);
    await new Promise(process.nextTick);
    expect(postMessageSpy).toHaveBeenCalled();
    // TODO: Figure out how to test the postMessage API
  });
});
