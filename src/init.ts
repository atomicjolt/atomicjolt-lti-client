import i18next from "i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import { doLtiStorageLaunch } from "./libs/init";
import es from "./locale/es.json";
import fr from "./locale/fr.json";

import { InitSettings } from "./types";

function showError() {
  const container = document.getElementById('main-content');
  if (!container) {
    throw 'Could not find main-content element';
  }
  container.innerHTML += `
    <div class="u-flex aj-centered-message">
      <i class="material-icons-outlined aj-icon" aria-hidden="true">warning</i>
      <p class="aj-text translate">
        ${i18next.t("There was an error launching the LTI tool. Please reload and try again.")}
      </p>
    </div>
  `;
}

export function InitOIDCLaunch(settings: InitSettings) {
  let isLaunched = false;

  i18next
  .use(LanguageDetector)
  .init({
      detection: { order: ['querystring', 'navigator'] },
      fallbackLng: 'en',
      keySeparator: false,
  });

  i18next.addResourceBundle('es', 'translation', es);
  i18next.addResourceBundle('fr', 'translation', fr);
  i18next.changeLanguage();

  window.addEventListener("load", () => {
    doLtiStorageLaunch(settings);
    isLaunched = true;
  });

  setTimeout(() => {
    if (!isLaunched) {
      showError();
    }
  }, 5000);
}
