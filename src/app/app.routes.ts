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
import { RegisterComponent } from './_pages/auth/register/register.component';
import { LoginComponent } from './_pages/auth/login/login.component';
import { RequesterHomeComponent } from './_pages/requester/requester-home/requester-home.component';
import { LandingChooseVanComponent } from './_pages/landing/landing-choose-van/landing-choose-van.component';
import { RequesterChooseVanComponent } from './_pages/requester/requester-choose-van/requester-choose-van.component';
import { RequesterMapComponent } from './_pages/requester/requester-map/requester-map.component';
import { RegisterSuccessRequesterComponent } from './_pages/auth/register-success-requester/register-success-requester.component';
import { RequesterMyTransportsComponent } from './_pages/requester/requester-my-transports/requester-my-transports.component';
import { RequesterMyTransportDetailComponent } from './_pages/requester/requester-my-transport-detail/requester-my-transport-detail.component';
import { RegisterDriverComponent } from './_pages/auth/register-driver/register-driver.component';
import { RegisterSuccessDriverComponent } from './_pages/auth/register-success-driver/register-success-driver.component';
import { DriversHomeComponent } from './_pages/driver/drivers-home/drivers-home.component';
import { DriversTransportsComponent } from './_pages/driver/drivers-transports/drivers-transports.component';
import { DriverDeliveringComponent } from './_pages/driver/driver-delivering/driver-delivering.component';
import { DriversPaymentsComponent } from './_pages/driver/drivers-payments/drivers-payments.component';
import { langGuard } from './_shared/guards/lang.guard';
import { NotFoundComponent } from './_pages/landing/not-found/not-found.component';

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
    { path: ':lang', component: HomeComponent, pathMatch: 'full', canActivate: [langGuard] },

    // landing
    { path: ':lang/available-anytime-moving-services', component: AvailableAnytimeMovingServicesComponent, pathMatch: 'full', canActivate: [langGuard] },
    { path: ':lang/house-removals', component: HouseRemovalsComponent, pathMatch: 'full', canActivate: [langGuard] },
    { path: ':lang/last-minute-changes', component: LastMinuteChangesComponent, pathMatch: 'full', canActivate: [langGuard] },
    { path: ':lang/local-changes', component: LocalChangesComponent, pathMatch: 'full', canActivate: [langGuard] },
    { path: ':lang/long-distance', component: LongDistanceComponent, pathMatch: 'full', canActivate: [langGuard] },
    { path: ':lang/low-cost-cheap-transport', component: LowCostCheapTransportComponent, pathMatch: 'full', canActivate: [langGuard] },
    { path: ':lang/office-changes', component: OfficeChangesComponent, pathMatch: 'full', canActivate: [langGuard] },
    { path: ':lang/small-changes', component: SmallChangesComponent, pathMatch: 'full', canActivate: [langGuard] },
    { path: ':lang/choose-van', component: LandingChooseVanComponent, pathMatch: 'full', canActivate: [langGuard] },

    // Auth
    { path: ':lang/register', component: RegisterComponent, pathMatch: 'full', canActivate: [langGuard] },
    { path: ':lang/register-requester-success', component: RegisterSuccessRequesterComponent, pathMatch: 'full', canActivate: [langGuard] },
    { path: ':lang/login', component: LoginComponent, pathMatch: 'full', canActivate: [langGuard] },
    { path: ':lang/register-driver', component: RegisterDriverComponent, canActivate: [langGuard] },
    { path: ':lang/driver-registration-success', component: RegisterSuccessDriverComponent, canActivate: [langGuard] },

    // User
    { path: ':lang/requester-home', component: RequesterHomeComponent, pathMatch: 'full', canActivate: [langGuard] },
    { path: ':lang/requester-map', component: RequesterMapComponent, pathMatch: 'full', canActivate: [langGuard] },
    { path: ':lang/requester-choose-van', component: RequesterChooseVanComponent, pathMatch: 'full', canActivate: [langGuard] },
    { path: ':lang/requester-my-transports', component: RequesterMyTransportsComponent, canActivate: [langGuard] },
    { path: ':lang/requester-my-transport-detail/:transportId', component: RequesterMyTransportDetailComponent, canActivate: [langGuard] },

    // 🔹 Driver Pages
    { path: ':lang/drivers-home', component: DriversHomeComponent },
    { path: ':lang/drivers-transports', component: DriversTransportsComponent },
    { path: 'driver-delivering/:transportId', component: DriverDeliveringComponent },
    { path: ':lang/drivers-payments', component: DriversPaymentsComponent },

    { path: ':lang/404', component: NotFoundComponent },


    //   { path: 'drivers-profile', component: DriversProfileComponent },
    //   { path: 'drivers-profile-update-successful', component: DriversProfileUpdateSuccessfulComponent },
    //   { path: 'drivers-configurations', component: DriversConfigurationsComponent },
    //   { path: 'drivers-statistics', component: DriversStatisticsComponent },
    //   { path: 'driver-delivering-finished', component: DriversDeliveringFinishedComponent },
    //   { path: 'drivers-cash-out', component: DriversCashOutComponent },
    //   { path: 'driver-delivering-detail/:transportId', component: DriverDeliveringDetailComponent },
    //   { path: 'drivers-support', component: DriversSupportComponent },


    // { path: '404', component: NotFoundComponent },
    // { path: '**', redirectTo: '404', pathMatch: 'full' }


];
