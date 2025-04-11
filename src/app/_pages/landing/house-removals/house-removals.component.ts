import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { houseRemovalsTranslations } from './translations';

@Component({
  selector: 'app-house-removals',
  standalone: true,
  imports: [],
  templateUrl: './house-removals.component.html'
})
export class HouseRemovalsComponent {
// Language
  currentLanguage: any = 'pt-PT';

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Get the "lang" route param
    const langParam = this.route.snapshot.paramMap.get('lang');

    if (langParam) {
      this.currentLanguage = langParam;
    }

    this.setInitialPageConfiguration();
  }

  // Get a specific translation by key
  getTranslation(key: string) {
    return houseRemovalsTranslations[this.currentLanguage]?.[key] || houseRemovalsTranslations['en']?.[key];
  }

  setInitialPageConfiguration() {
    const titleToSet = houseRemovalsTranslations[this.currentLanguage]?.meta_title || houseRemovalsTranslations['en']?.meta_title;
    const descriptionToSet = houseRemovalsTranslations[this.currentLanguage]?.meta_description || houseRemovalsTranslations['en']?.meta_description;
    const shareImage = 'https://www.floand-go.com/flo-logo-11.jpg';

    this.titleService.setTitle(titleToSet);
    this.metaService.updateTag({ name: 'description', content: descriptionToSet });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
    this.metaService.updateTag({ name: 'author', content: 'Flo and Go' });
    this.metaService.updateTag({ httpEquiv: 'content-language', content: this.currentLanguage });

    // Open Graph
    this.metaService.updateTag({ property: 'og:title', content: titleToSet });
    this.metaService.updateTag({ property: 'og:description', content: descriptionToSet });
    this.metaService.updateTag({ property: 'og:url', content: 'https://www.floand-go.com/available-anytime-moving-services' });
    // this.metaService.updateTag({ property: 'og:type', content: contentType });
    this.metaService.updateTag({ property: 'og:site_name', content: 'Flo and Go' });
    // this.metaService.updateTag({ property: 'og:locale', content: this.formatLocale(currentLanguage) });
    this.metaService.updateTag({ property: 'og:image', content: shareImage });

    // if (alternateLocales) {
    //   alternateLocales.forEach(alt => {
    //     this.metaService.addTag({ property: 'og:locale:alternate', content: alt.locale });
    //     // You might need to handle the alternate URL separately if needed by some platforms
    //   });
    // }

    // Twitter
    // this.metaService.updateTag({ name: 'twitter:card', content: twitterCard });
    this.metaService.updateTag({ name: 'twitter:title', content: titleToSet });
    this.metaService.updateTag({ name: 'twitter:description', content: descriptionToSet });
    this.metaService.updateTag({ name: 'twitter:site', content: '@floandgo' }); // Replace with your Twitter handle
    this.metaService.updateTag({ name: 'twitter:image', content: shareImage });
  }

  ngOnDestroy(): void {
    // Optional: Reset title and description to default values if this component might be navigated away from frequently
    // this.titleService.setTitle('Default Title | Flo and Go');
    // this.metaService.updateTag({ name: 'description', content: 'Default Description' });
  }
}
