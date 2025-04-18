import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { homeTranslations } from './translations';
import { filter, map } from 'rxjs/operators';
import { AuthManagerSignal } from '../../../_signals/authManager.signal';

@Component({
  selector: 'app-requester-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './requester-home.component.html'
})
export class RequesterHomeComponent implements OnInit {
  currentLanguage: string = 'pt-PT';

  // ✅ Inject the signal (Angular v14+ way)
  authManagerSignal = inject(AuthManagerSignal);

  // ✅ Reactive getter (stays in sync automatically)
  get user() {
    return this.authManagerSignal.currentUser;
  }

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.extractLanguageFromPath();

    // React to route language changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.getFirstPathSegment())
    ).subscribe(lang => {
      if (lang) this.currentLanguage = lang;
    });
  }

  private getFirstPathSegment(): string | null {
    const pathSegments = this.router.url.split('/').filter(Boolean);
    return pathSegments.length > 0 ? pathSegments[0] : null;
  }

  private extractLanguageFromPath(): void {
    const lang = this.route.snapshot.paramMap.get('lang');
    if (lang) {
      this.currentLanguage = lang;
    }
  }

  getTranslation(key: string): string {
    return homeTranslations[this.currentLanguage]?.[key] || homeTranslations['en']?.[key] || key;
  }
}
