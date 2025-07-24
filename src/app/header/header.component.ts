import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "../auth/auth.service";
import { Subscription } from "rxjs";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy{

    isUserAuthenticated = false;

    authSvc = inject(AuthService);
    private authStatusSubs: Subscription;

    ngOnInit() {
        this.authStatusSubs = this.authSvc.getAuthStatus().subscribe(isAuthenticated =>{
            console.log(isAuthenticated,"Hello")
            this.isUserAuthenticated = isAuthenticated;
        });
    }

    ngOnDestroy(): void {
        this.authStatusSubs.unsubscribe()
    }

    logout(){
        this.authSvc.logout();
    }
}