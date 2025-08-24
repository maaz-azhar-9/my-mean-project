import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { debounceTime, EMPTY, of, Subject, Subscription, switchMap } from 'rxjs';
import { Post } from '../posts.model';
import { LocalStorageEnum } from '../posts.model';
import { LikeService } from './like.service';
import { AudioService } from 'src/app/audio/audio.service';

enum LikeStatusEnum{
  Liked = "Liked",
  Unliked = "Unliked"
}

@Component({
  selector: 'app-like',
  templateUrl: './like.component.html',
  styleUrls: ['./like.component.scss'],
})
export class LikeComponent implements OnInit, OnDestroy {

  // @Input() liked: boolean = false;
  liked: boolean;
  @Input() post: Post;
  @Input() isUserAuthenticated = false;
  likeSub : Subscription;
  like$ = new Subject<void>();
  likeSvc = inject(LikeService);
  audioSvc = inject(AudioService);

  ngOnInit() {
    this.liked = this.post.isLiked;
    this.likeSub = this.like$.pipe(debounceTime(500), switchMap(()=>{
      const userId = localStorage.getItem(LocalStorageEnum.userId);
      const postId = this.post.id;
      if(this.liked !== this.post.isLiked){
        return this.liked ? this.likeSvc.likePost(postId,userId) : this.likeSvc.unlikePost(postId,userId);
      }
      return of({message:"API not called"});
    })).subscribe((res)=>{
      if(res?.message=== LikeStatusEnum.Liked){ this.post.isLiked = true}
      else if(res?.message=== LikeStatusEnum.Unliked){this.post.isLiked = false}
    })
  }

  updateLikeStatus(){
    this.audioSvc.playLikeSound();
    this.liked = !this.liked;
    if(this.liked){
      this.post.likeCount++;
    }
    else{
      this.post.likeCount--;
    }
    this.like$.next();
  }

  ngOnDestroy() {
    this.likeSub.unsubscribe();
  }
}
