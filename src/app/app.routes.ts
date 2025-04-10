import { Routes } from '@angular/router';
import { HomeComponent } from './_pages/landing/home/home.component';
import { AvailableAnytimeMovingServicesComponent } from './_pages/landing/available-anytime-moving-services/available-anytime-moving-services.component';
import { LocalChangesComponent } from './_pages/landing/local-changes/local-changes.component';
import { HouseRemovalsComponent } from './_pages/landing/house-removals/house-removals.component';
import { LastMinuteChangesComponent } from './_pages/landing/last-minute-changes/last-minute-changes.component';
import { LongDistanceComponent } from './_pages/landing/long-distance/long-distance.component';
import { LowCostCheapTransportComponent } from './_pages/landing/low-cost-cheap-transport/low-cost-cheap-transport.component';
import { OfficeChangesComponent } from './_pages/landing/office-changes/office-changes.component';
import { SmallChangesComponent } from './_pages/landing/small-changes/small-changes.component';

// lang codes (BCP 47 standard):
// Portuguese (Portugal)      → pt-PT  
// English (Global)           → en  
// French (France)            → fr-FR  
// Spanish (Spain)            → es-ES  
// German (Germany)           → de-DE  
// Italian (Italy)            → it-IT  
// Chinese (Mandarin, China)  → zh-CN  
// Hindi (India)              → hi-IN  
// Polish (Poland)            → pl-PL  
// Swedish (Sweden)           → sv-SE  
// Danish (Denmark)           → da-DK  
// Finnish (Finland)          → fi-FI  
// Japanese (Japan)           → ja-JP

export const routes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full' },
    { path: ':lang', component: HomeComponent, pathMatch: 'full' },

    { path: ':lang/available-anytime-moving-services', component: AvailableAnytimeMovingServicesComponent, pathMatch: 'full' },
    { path: ':lang/house-removals', component: HouseRemovalsComponent, pathMatch: 'full' },
    { path: ':lang/last-minute-changes', component: LastMinuteChangesComponent, pathMatch: 'full' },
    { path: ':lang/local-changes', component: LocalChangesComponent, pathMatch: 'full' },
    { path: ':lang/long-distance', component: LongDistanceComponent, pathMatch: 'full' },
    { path: ':lang/low-cost-cheap-transport', component: LowCostCheapTransportComponent, pathMatch: 'full' },
    { path: ':lang/office-changes', component: OfficeChangesComponent, pathMatch: 'full' },
    { path: ':lang/small-changes', component: SmallChangesComponent, pathMatch: 'full' },



];
