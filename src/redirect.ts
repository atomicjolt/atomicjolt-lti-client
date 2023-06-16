import { doLtiRedirect } from "./lib/redirect";

import { RedirectSettings } from "./types";

export function InitRedirect(settings: RedirectSettings) {
  window.addEventListener("load", () => {
    doLtiRedirect(settings);
  });
}
