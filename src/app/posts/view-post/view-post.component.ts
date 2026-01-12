import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { PostsService } from '../posts.service';
import { AuthService } from 'src/app/auth/auth.service';
import { ToastService } from 'src/app/toast.service';
import { Post } from '../posts.model';

@Component({
  selector: 'app-view-post',
  templateUrl: './view-post.component.html',
  styleUrls: ['./view-post.component.scss']
})
export class ViewPostComponent implements OnInit {

  route = inject(ActivatedRoute);
  postSvc = inject(PostsService);
  authSvc = inject(AuthService);
  toastSvc = inject(ToastService);
  router = inject(Router);
  isUserAuthenticated: boolean;
  userId: string;
  post: any;

  ngOnInit(): void {
    this.authSvc.getAuthStatus().subscribe((status)=>{
      console.log(status);
      this.isUserAuthenticated = status;
    })
    this.userId = this.authSvc.getUserId();
    this.route.paramMap.subscribe((paramMap: ParamMap)=>{
      const postId = paramMap.get('postId');
      this.postSvc.getPost(postId).subscribe((post)=>{
        this.post = post;
        console.log(post)
      })
    })    
  }

  onDelete(postId: string){
    this.postSvc.deletePost(postId).subscribe(()=>{
        this.toastSvc.show("Post Successfulyy Deleted.");
        this.router.navigate(['']);
    });
}
}
