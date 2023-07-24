import { describe, expect, beforeEach, afterEach, it, vi } from 'vitest';
import * as launch from "./launch";
import { LaunchSettings } from '../types';

describe('test', () => {

  beforeEach(() => {
    document.body.innerHTML = `
      <form action="https://assessments.atomicjolt.xyz/lti_launches/" method="POST">
          <input type="hidden" name="state" id="state" value="state" />
          <input type="hidden" name="id_token" id="id_token" value="id_token" />
      </form>
      <div id="error" class="hidden">error</div>
    `;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.cookie = 'open_id_state=;Max-Age=-1';
  });

  // TODO figure out how to write better postMessage tests

  describe('validateLaunch', () => {
    it('calls postMessage', async () => {
      const settings: LaunchSettings = {
        state: 'state',
        stateVerified: false,
        idToken: '',
        ltiStorageParams: {
          target: '_parent',
          originSupportBroken: true,
          platformOIDCUrl: 'https://canvas.instructure.com/api/lti/authorize_redirect',
        },
      };
      const postMessageSpy = vi.spyOn(window, 'postMessage');
      await launch.validateLaunch(settings);
      await new Promise(process.nextTick);
      expect(postMessageSpy).toHaveBeenCalled();
    });

    it('returns false post message times out', async () => {
      const settings: LaunchSettings = {
        state: 'state',
        stateVerified: false,
        idToken: '',
        ltiStorageParams: {
          target: '_parent',
          originSupportBroken: true,
          platformOIDCUrl: 'https://canvas.instructure.com/api/lti/authorize_redirect',
        },
      };
      await expect(launch.validateLaunch(settings)).resolves.toBeFalsy();
    });

    it('should return false when there is no ltiStorageParams', async () => {
      const settings: LaunchSettings = {
        state: 'testState',
        ltiStorageParams: null
      };
      await expect(launch.validateLaunch(settings)).resolves.toBeFalsy();
    });
  });

});
