import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostListComponent } from './post-list/post-list.component';
import { CreatePostComponent } from './posts/create-post.component';
import { authGuard } from './auth/auth.guard';

const routes: Routes = [
  {path:'', component:PostListComponent},
  {path:'create', component:CreatePostComponent, canActivate:[authGuard]},
  {path:'edit/:postId', component:CreatePostComponent, canActivate:[authGuard]},
  {path:"auth", loadChildren: () => import("./auth/auth-routing.module").then(m => m.AuthRoutingModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
