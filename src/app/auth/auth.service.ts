import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: string = "";
  userId: string;
  private authStatus$ = new BehaviorSubject<boolean>(false);

  getToken() {
    return this.token;
  }

  getUserId() {
    return this.userId ?? localStorage.getItem('userId');
  }

  getAuthStatus() {
    return this.authStatus$.asObservable();
  }

  constructor() { }
  http = inject(HttpClient)
  router = inject(Router)
  tokenTimer: any;

  createUser(email: String, password: String) {
    const authData: AuthData = {
      email: email,
      password: password
    }
    this.http.post("http://localhost:3000/api/user/signup", authData).subscribe((response) => {
      this.router.navigate(['/']);
    },
      (error) => {
        this.authStatus$.next(false);
      })
  }

  login(email: String, password: String) {
    const authData: AuthData = {
      email: email,
      password: password
    }
    this.http.post<{ token: string, expireIn: number, userId: string }>("http://localhost:3000/api/user/login", authData).subscribe((response) => {
      const token = response.token;
      this.userId = response.userId;
      this.token = token;
      if (token) {
        const expireInDuration = response.expireIn; // in seconds
        this.setAuthTimer(expireInDuration);
        this.authStatus$.next(true);
        const now = new Date();
        const expirationDate = new Date(now.getTime() + expireInDuration * 1000);
        this.setAuthData(token, expirationDate, this.userId);
        this.router.navigate(['/'])
      }
    },
      (error) => {
        this.authStatus$.next(false);
      }
    )
  }

  autoAuth() {
    const authData = this.getAuthData();
    const now = new Date();
    const expiresIn = authData?.expiration.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authData.token;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatus$.next(true);
    }
  }

  logout() {
    this.authStatus$.next(false);
    this.clearAuthData();
    clearTimeout(this.tokenTimer);
    this.userId = null;
    this.router.navigate(['/']);
  }

  private setAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
    localStorage.setItem("userId", userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId')
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expiration) {
      return null;
    }
    return {
      token: token,
      expiration: new Date(expiration),
      userId: userId
    }
  }

  private setAuthTimer(expireInDuration) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, expireInDuration * 1000);
  }
}
