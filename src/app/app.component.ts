import { Component, OnInit, inject } from '@angular/core';
import { Post } from './posts/posts.model';
import { AuthService } from './auth/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'my-mean-project';
  enteredPosts: Post[] = [];
  authSvc = inject(AuthService)
  ngOnInit(){
    this.authSvc.autoAuth();
  }

  onAddedPost(post: Post)
  {
    this.enteredPosts.push(post)
  }
}
