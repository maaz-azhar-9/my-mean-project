import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostListComponent } from './post-list/post-list.component';
import { CreatePostComponent } from './posts/create-post.component';
import { LoginComponent } from './auth/login/login.component';

const routes: Routes = [
  {path:'', component:PostListComponent},
  {path:'create', component:CreatePostComponent},
  {path:'edit/:postId', component:CreatePostComponent},
  {path:'login', component:LoginComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
