import { CanActivateFn } from '@angular/router';

export const langGuard: CanActivateFn = (route, state) => {
  // List of allowed language codes (BCP 47 format)
  const validLangs = [
    'pt-PT',
    'en',
    'fr-FR',
    'es-ES',
    'de-DE',
    'it-IT',
    'zh-CN',
    'hi-IN',
    'pl-PL',
    'sv-SE',
    'da-DK',
    'fi-FI',
    'ja-JP'
  ];

  const lang = route.params['lang'];

  // If the lang param is missing or invalid, block navigation
  return validLangs.includes(lang);
};
