import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading = false;

  authService = inject(AuthService);
  authStatusSub : Subscription;

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatus().subscribe(()=>{
      this.isLoading = false;
    });
  }

  onLogin(form: NgForm) {
    this.isLoading = true;
    this.authService.login(form.value.email,form.value.password);
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}