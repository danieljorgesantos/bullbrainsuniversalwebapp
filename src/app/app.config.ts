import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

import { provideNgxStripe } from 'ngx-stripe';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideClientHydration(),
    provideNgxStripe('pk_test_51Qvz43FQKbu2elOQuFD5qGlmxxnUBMMsZt1ATmOnHgsxLhfqk0cXgNrzueAgbWIaEFFXa6gzcRDOJ83POUT0e9nQ00GQiuJWVc'),
  ]
};
