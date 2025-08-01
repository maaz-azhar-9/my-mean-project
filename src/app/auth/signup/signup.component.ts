import { Component, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {

  isLoading = false;

  authService = inject(AuthService);

  onSignup(form: NgForm){
    if(form.invalid){
      return
    }
    this.isLoading = true;
    this.authService.createUser(form.value.email, form.value.password);

  }

}
