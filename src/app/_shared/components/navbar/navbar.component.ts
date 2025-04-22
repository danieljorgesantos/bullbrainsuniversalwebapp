import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule, Router, NavigationEnd } from '@angular/router';
import { navTranslations } from './translations';
import { filter, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AuthManagerSignal } from '../../../_signals/authManager.signal'; // <-- Import your signal

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {
  currentLanguage: string = 'pt-PT';
  menuOpen = false;

  // ✅ Inject the signal (Angular v14+ way)
  authManagerSignal = inject(AuthManagerSignal);

  // ✅ Reactive getters
  get user() {
    return this.authManagerSignal.currentUser;
  }

  get userId(): number | null {
    return this.user?.id ?? null;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.extractLanguageFromPath();

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.getFirstPathSegment())
    ).subscribe(lang => {
      if (lang && navTranslations[lang]) {
        this.currentLanguage = lang;
      } else {
        this.currentLanguage = 'pt-PT';
      }
    });
  }

  private getFirstPathSegment(): string | null {
    const pathSegments = this.router.url.split('/').filter(segment => segment !== '');
    return pathSegments.length > 0 ? pathSegments[0] : null;
  }

  private extractLanguageFromPath(): void {
    const initialLang = this.getFirstPathSegment();
    if (initialLang && navTranslations[initialLang]) {
      this.currentLanguage = initialLang;
    }
  }

  getTranslation(key: string) {
    return navTranslations[this.currentLanguage]?.[key] || navTranslations['en']?.[key] || key;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  logout(): void {
    this.closeMenu();
    this.authManagerSignal.logout();
    this.router.navigate(['/']);
  }
}
