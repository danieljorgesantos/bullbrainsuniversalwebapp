import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from 'express';
import { homeTranslations } from './translations';

@Component({
  selector: 'app-requester-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './requester-home.component.html'
})
export class RequesterHomeComponent {
  user: any | null = null;

  // Language
  currentLanguage: any = 'pt-PT';

  constructor(
    // private router: Router,
    // private configSignal: ConfigSignal,
    // public authManagerSignal: AuthManagerSignal,
  ) { }

  // Get a specific translation by key
  getTranslation(key: string) {
    return homeTranslations[this.currentLanguage]?.[key] || homeTranslations['en']?.[key];
  }

  ngOnInit(): void {

    // This puts the user object into the variable
    // this.user = this.authManagerSignal.currentUser ?? null;

    this.user = null;
  }
}
