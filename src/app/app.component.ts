import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './_shared/components/navbar/navbar.component';
import { AuthManagerSignal } from './_signals/authManager.signal';

// Declare gtag as any to avoid TypeScript complaints about its usage.
declare var gtag: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    public authManagerSignal: AuthManagerSignal,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.authManagerSignal.loadUserFromLocalStorage();

    // Ensure that code runs only in the browser context.
    if (isPlatformBrowser(this.platformId)) {
      // --- Google Analytics 4 (GA4) ---
      const scriptGA = document.createElement('script');
      scriptGA.src = 'https://www.googletagmanager.com/gtag/js?id=G-6FK4NJS35W'; // Your GA4 Measurement ID
      scriptGA.async = true;
      document.head.appendChild(scriptGA);

      const scriptGAInit = document.createElement('script');
      scriptGAInit.text = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-6FK4NJS35W');
      `;
      document.head.appendChild(scriptGAInit);

      // --- Google Ads Conversion Tracking (AW-16977624080) ---
      const scriptAds = document.createElement('script');
      scriptAds.src = 'https://www.googletagmanager.com/gtag/js?id=AW-16977624080';
      scriptAds.async = true;
      document.head.appendChild(scriptAds);

      const scriptAdsInit = document.createElement('script');
      scriptAdsInit.text = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'AW-16977624080');
      `;
      document.head.appendChild(scriptAdsInit);

      // Track route changes to measure pageviews for Angular routing (GA4)
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          gtag('config', 'G-6FK4NJS35W', {
            'page_path': event.urlAfterRedirects,
          });
        }
      });
    }
  }

}
