import { Component } from '@angular/core';
import { Post } from './posts/posts.model';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'my-mean-project';
  enteredPosts: Post[] = [];

  onAddedPost(post: Post)
  {
    this.enteredPosts.push(post)
  }
}
