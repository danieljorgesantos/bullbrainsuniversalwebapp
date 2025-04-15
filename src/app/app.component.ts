import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './_shared/components/navbar/navbar.component';

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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Ensure that code runs only in the browser context.
    if (isPlatformBrowser(this.platformId)) {
      // Dynamically insert the GA script.
      const script1 = document.createElement('script');
      script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-6FK4NJS35W'; // Replace with your GA4 Measurement ID.
      script1.async = true;
      document.head.appendChild(script1);

      // Insert the GA initialization script.
      const script2 = document.createElement('script');
      script2.text = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-6FK4NJS35W');
      `;
      document.head.appendChild(script2);

      // Track route changes to measure pageviews for Angular routing.
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
