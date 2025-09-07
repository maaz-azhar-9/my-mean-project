import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {

  isLoading = false;

  authService = inject(AuthService);
  router = inject(Router)
  authStatusSub : Subscription;

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatus().subscribe((isAuthenticated)=>{
      if(isAuthenticated) this.router.navigate(['']);
      this.isLoading = false;
    });
  }

  onSignup(form: NgForm) {
    if(form.invalid){
      return
    }
    this.isLoading = true;
    this.authService.createUser(form.value.email, form.value.password);
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

}
