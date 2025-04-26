import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { homeTranslations } from './translations';
import { filter, map } from 'rxjs/operators';
import { AuthManagerSignal } from '../../../_signals/authManager.signal';
import { RequesterTransportsSignal } from '../../../_signals/requesterTransports.signal';

@Component({
  selector: 'app-requester-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './requester-home.component.html'
})
export class RequesterHomeComponent implements OnInit {
  currentLanguage: string = 'pt-PT';

  transportRequests: any[] = [];
  totalRequests = 0;
  scheduledRequests = 0;
  completedRequests = 0;
  cancelledRequests = 0;


  // ✅ Inject the signal (Angular v14+ way)
  authManagerSignal = inject(AuthManagerSignal);
  requesterTransportsSignal = inject(RequesterTransportsSignal);

  // ✅ Reactive getter (stays in sync automatically)
  get user() {
    return this.authManagerSignal.currentUser;
  }

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.extractLanguageFromPath();

    this.loadTransportRequests();

    // React to route language changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.getFirstPathSegment())
    ).subscribe(lang => {
      if (lang) this.currentLanguage = lang;
    });
  }

  private loadTransportRequests(): void {
    this.transportRequests = this.requesterTransportsSignal.requesterTransports;

    if (this.transportRequests.length > 0) {
      this.calculateRequestStats();
    } else {
      // Maybe trigger a load if empty
      console.warn('⚠️ No transport requests loaded.');
    }
  }

  private calculateRequestStats(): void {
    this.totalRequests = this.transportRequests.length;
    this.scheduledRequests = this.transportRequests.filter(t => t.status === 'Pending').length;
    this.completedRequests = this.transportRequests.filter(t => t.status === 'Delivered').length;
    this.cancelledRequests = this.transportRequests.filter(t => t.status === 'Cancelled').length;
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
