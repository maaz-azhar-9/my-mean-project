import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading = false;

  authService = inject(AuthService);
  router = inject(Router);
  authStatusSub : Subscription;
  client: google.accounts.oauth2.TokenClient;
  GOOGLE_SSO_KEY = "518336938659-n2mntbdl5jinr7iodhr2njj4gehbjcp7";
  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatus().subscribe((isAuthenticated)=>{
      if(isAuthenticated) this.router.navigate(['']);
      this.isLoading = false;
    });

    this.client = window.google.accounts.oauth2.initTokenClient({
      client_id: `${environment.GOOGLE_SSO_KEY ?? this.GOOGLE_SSO_KEY}.apps.googleusercontent.com`,
      scope: 'openid profile email',
      callback: (tokenResponse: any) => {
        this.authService.loginWithGoogle(tokenResponse.access_token);
      }
    });
  }

  onLogin(form: NgForm) {
    if(form.valid){
    this.isLoading = true;
    this.authService.login(form.value.email,form.value.password);
    }
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

  signIn(event): void {
    event.preventDefault();
    this.client.requestAccessToken();
  }
}