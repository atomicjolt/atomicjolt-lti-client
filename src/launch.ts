import { LaunchSettings } from './types';
import { validateLaunch } from "./libs/launch";

export async function LtiLaunch(settings: LaunchSettings): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    if (!settings.stateVerified) {
      window.addEventListener("load", async () => {
        try {
          const result = await validateLaunch(settings);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    } else {
      resolve(true);
    }
  });
}
