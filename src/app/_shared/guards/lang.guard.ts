import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const langGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // lang codes (BCP 47 standard):
  // Portuguese (Portugal)      → pt-PT  
  // English (Global)           → en  
  // French (France)            → fr-FR  
  // Spanish (Spain)            → es-ES  
  // German (Germany)           → de-DE  
  // Italian (Italy)            → it-IT  
  // Chinese (Mandarin, China)  → zh-CN  
  // Hindi (India)              → hi-IN  
  // Polish (Poland)            → pl-PL  
  // Swedish (Sweden)           → sv-SE  
  // Danish (Denmark)           → da-DK  
  // Finnish (Finland)          → fi-FI  
  // Japanese (Japan)           → ja-JP

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

  if (!validLangs.includes(lang)) {
    router.navigate(['/pt-PT/404']); // or redirect to default language like ['/en']
    return false;
  }

  return true;
};
