import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import {
  CommonModule,
  DOCUMENT,
  isPlatformBrowser,
  isPlatformServer,
  PlatformLocation
} from '@angular/common';
import { lowCostCheapTransportTranslations } from './translations';
import { LandingPageCtaComponent } from '../../../_shared/components/landing-page-cta/landing-page-cta.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-low-cost-cheap-transport',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LandingPageCtaComponent
  ],
  templateUrl: './low-cost-cheap-transport.component.html'

})
export class LowCostCheapTransportComponent implements OnInit, OnDestroy {
  currentLanguage: string = 'pt-PT';

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private platformLocation: PlatformLocation
  ) {}

  ngOnInit(): void {
    const langParam = this.route.snapshot.paramMap.get('lang');
    if (langParam) {
      this.currentLanguage = langParam;
    }

    this.setInitialPageConfiguration();
  }

  getTranslation(key: string): string {
    return lowCostCheapTransportTranslations[this.currentLanguage]?.[key] || lowCostCheapTransportTranslations['en']?.[key];
  }

  setInitialPageConfiguration(): void {
    const titleToSet = this.getTranslation('meta_title');
    const descriptionToSet = this.getTranslation('meta_description');
    const shareImage = 'https://www.floand-go.com/flo-logo-11.jpg';
    const canonicalUrl = `https://www.floand-go.com/${this.currentLanguage}/low-cost-cheap-transport`;

    // Meta tags
    this.titleService.setTitle(titleToSet);
    this.updateMetaTag('description', descriptionToSet);
    this.updateMetaTag('robots', 'index, follow');
    this.updateMetaTag('author', 'Flo and Go');
    this.updateMetaTag('keywords', 'transporte barato, mudanças low cost, Flo and Go');
    this.updateMetaTag('theme-color', '#ff6600');
    this.metaService.updateTag({ httpEquiv: 'content-language', content: this.currentLanguage });

    // Open Graph
    this.updateMetaProperty('og:title', titleToSet);
    this.updateMetaProperty('og:description', descriptionToSet);
    this.updateMetaProperty('og:url', canonicalUrl);
    this.updateMetaProperty('og:site_name', 'Flo and Go');
    this.updateMetaProperty('og:image', shareImage);
    this.updateMetaProperty('og:image:alt', 'Logo da empresa Flo and Go - transporte barato');

    // Twitter
    this.updateMetaTag('twitter:title', titleToSet);
    this.updateMetaTag('twitter:description', descriptionToSet);
    this.updateMetaTag('twitter:site', '@floandgo');
    this.updateMetaTag('twitter:image', shareImage);

    // Canonical
    this.setCanonicalURL(canonicalUrl);

    // Hreflangs
    this.setHreflangTags();

    // OG locale alternates
    this.setOgLocaleAlternates();

    // JSON-LD Structured Data
    this.injectJsonLdSchema(titleToSet, descriptionToSet, shareImage);
  }

  updateMetaTag(name: string, content: string): void {
    this.metaService.updateTag({ name, content });
  }

  updateMetaProperty(property: string, content: string): void {
    this.metaService.updateTag({ property, content });
  }

  setCanonicalURL(url: string): void {
    if (isPlatformBrowser(this.platformId) || isPlatformServer(this.platformId)) {
      let link: HTMLLinkElement = this.document.querySelector("link[rel='canonical']") || this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', url);
      if (!link.parentElement) {
        this.document.head.appendChild(link);
      }
    }
  }

  setHreflangTags(): void {
    if (isPlatformBrowser(this.platformId) || isPlatformServer(this.platformId)) {
      const pageSlug = 'low-cost-cheap-transport';
      const baseUrl = 'https://www.floand-go.com';

      const languages = [
        'fr-FR', 'es-ES', 'de-DE', 'it-IT', 'zh-CN', 'hi-IN', 'en',
        'pl-PL', 'sv-SE', 'da-DK', 'fi-FI', 'ja-JP', 'pt-PT'
      ];

      const existingLinks = this.document.querySelectorAll("link[rel='alternate']");
      existingLinks.forEach(link => link.remove());

      languages.forEach(lang => {
        const href = `${baseUrl}/${lang}/${pageSlug}`;
        this.addLinkTag('alternate', href, lang);
      });

      const defaultHref = `${baseUrl}/en/${pageSlug}`;
      this.addLinkTag('alternate', defaultHref, 'x-default');
    }
  }

  setOgLocaleAlternates(): void {
    const ogLocales = [
      'fr_FR', 'es_ES', 'de_DE', 'it_IT', 'zh_CN', 'hi_IN', 'en_US',
      'pl_PL', 'sv_SE', 'da_DK', 'fi_FI', 'ja_JP', 'pt_PT'
    ];

    ogLocales.forEach(locale => {
      this.updateMetaProperty('og:locale:alternate', locale);
    });
  }

  injectJsonLdSchema(title: string, description: string, imageUrl: string): void {
    if (isPlatformBrowser(this.platformId) || isPlatformServer(this.platformId)) {
      const script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: title,
        description: description,
        image: imageUrl,
        areaServed: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Lisboa',
            addressCountry: 'PT'
          }
        },
        provider: {
          '@type': 'Organization',
          name: 'Flo and Go',
          url: 'https://www.floand-go.com',
          logo: imageUrl
        }
      });
      this.document.head.appendChild(script);
    }
  }

  addLinkTag(rel: string, href: string, hreflang?: string): void {
    const link: HTMLLinkElement = this.document.createElement('link');
    link.setAttribute('rel', rel);
    link.setAttribute('href', href);
    if (hreflang) {
      link.setAttribute('hreflang', hreflang);
    }
    this.document.head.appendChild(link);
  }

  ngOnDestroy(): void {}
}
