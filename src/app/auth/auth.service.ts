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
  private authStatus$ = new BehaviorSubject<boolean>(false);

  getToken(){
    return this.token;
  }

  getAuthStatus(){
    return this.authStatus$.asObservable();
  }

  constructor() { }
  http = inject(HttpClient)
  router = inject(Router)
  createUser(email: String, password: String){
    const authData: AuthData = {
      email: email,
      password: password
    }
    this.http.post("http://localhost:3000/api/user/signup", authData).subscribe((response) => {
      console.log(response);
    })
  }

  login(email: String, password: String){
    const authData: AuthData = {
      email: email,
      password: password
    }
    this.http.post<{token:string}>("http://localhost:3000/api/user/login",authData).subscribe((response) => {
      const token = response.token;
      this.token = token;
      if(token){
      this.authStatus$.next(true);
      this.router.navigate(['/'])
      }
    })
  }
  logout(){
    this.authStatus$.next(false);
    this.router.navigate(['/'])
  }
}
