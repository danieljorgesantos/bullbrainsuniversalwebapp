import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router, NavigationEnd } from '@angular/router';
import { navTranslations } from './translations';
import { filter, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule ],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {
  // Language
  currentLanguage: string = 'pt-PT';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  menuOpen = false;

  ngOnInit(): void {
    this.extractLanguageFromPath();

    // Subscribe to navigation end events to update language on route changes
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => {
        return this.getFirstPathSegment();
      })
    ).subscribe(lang => {
      if (lang && navTranslations[lang]) {
        this.currentLanguage = lang;
      } else {
        this.currentLanguage = 'pt-PT'; // Default if not found
      }
    });
  }

  // Helper function to extract the first segment of the path
  private getFirstPathSegment(): string | null {
    const pathSegments = this.router.url.split('/').filter(segment => segment !== '');
    return pathSegments.length > 0 ? pathSegments[0] : null;
  }

  // Extract language from the initial path
  private extractLanguageFromPath(): void {
    const initialLang = this.getFirstPathSegment();
    if (initialLang && navTranslations[initialLang]) {
      this.currentLanguage = initialLang;
    }
  }

  // Get a specific translation by key
  getTranslation(key: string) {
    return navTranslations[this.currentLanguage]?.[key] || navTranslations['en']?.[key] || key;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}