import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-register-success-driver',
    imports: [RouterModule],
    templateUrl: './register-success-driver.component.html',
    standalone: true
})
export class RegisterSuccessDriverComponent {
    // Language
    currentLanguage: any = 'pt-PT';

    constructor(
        public router: Router,
    ) { }

    ngOnInit(): void {
    }
}
