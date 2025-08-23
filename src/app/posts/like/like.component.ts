import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, of, Subject, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-like',
  templateUrl: './like.component.html',
  styleUrls: ['./like.component.scss'],
})
export class LikeComponent implements OnInit, OnDestroy {

  @Input() liked: boolean = false;
  @Input() likesCount: number = 0;
  @Input() isUserAuthenticated = false;
  likeSub : Subscription;
  like$ = new Subject<void>();

  ngOnInit() {
    this.likeSub = this.like$.pipe(debounceTime(1000), switchMap(()=>{
      //TBD like api will be called here
      return of("Dummy API call");
    })).subscribe((value)=>{
      console.log(value);
    })
  }

  updateLikeStatus(){
    this.liked= !this.liked;
    if(this.liked){
      this.likesCount++;
    }
    else{
      this.likesCount--;
    }
    this.like$.next();
  }

  ngOnDestroy() {
    this.likeSub.unsubscribe();
  }
}
