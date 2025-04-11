import { Component } from '@angular/core';
import { ConfigSignal } from '../../../_signals/config';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-register-success-requester',
    imports: [RouterModule],
    templateUrl: './register-success-requester.component.html'
})
export class RegisterSuccessRequesterComponent {

    constructor(
      public router: Router, 
      public configSignal: ConfigSignal
    ) {} 

    ngOnInit(): void {
      this.setInitialPageConfig();
    }
  
  
    private setInitialPageConfig(): void {
      this.configSignal.setMode('top_nav_layout');
    }

}
