import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { footerTranslations } from './translations';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit {

  currentLanguage: string = 'pt-PT';
  private route = inject(ActivatedRoute);

  ngOnInit() {
    const langParam = this.route.snapshot.paramMap.get('lang');
    if (langParam) {
      this.currentLanguage = langParam;
    }
  }

  getTranslation(key: string): string {
    return footerTranslations[this.currentLanguage]?.[key] || footerTranslations['en']?.[key] || '';
  }
}
