import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register-success-requester',
  imports: [RouterModule],
  templateUrl: './register-success-requester.component.html',
  standalone: true,
})
export class RegisterSuccessRequesterComponent {
    // Language
    currentLanguage: any = 'pt-PT';

  constructor(
    public router: Router,
  ) { }

  ngOnInit(): void {
  }
}
