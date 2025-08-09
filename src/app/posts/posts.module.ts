import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostListComponent } from '../post-list/post-list.component';
import { CreatePostComponent } from './create-post.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material.module';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    PostListComponent,
    CreatePostComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    RouterModule,
    FormsModule
  ]
})
export class PostsModule { }
