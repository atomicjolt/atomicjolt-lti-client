import i18next from "i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import { doLtiStorageLaunch } from "./lib/init";
import es from "./locale/es.json";
import fr from "./locale/fr.json";

import { InitSettings } from "./types";


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
      document.getElementById('error')?.classList?.remove('hidden'); 
    }
  }, 5000);
}
