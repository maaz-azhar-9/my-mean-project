import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Post } from "../posts/posts.model";
import { PostsService } from "../posts/posts.service";
import { Subscription } from "rxjs";
@Component({
    selector:'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit,OnDestroy{
    // posts = [
    //     {title:"First Post", content:"This My First Post's content"},
    //     {title:"Second Post", content:"This My Second Post's content"},
    //     {title:"Third Post", content:"This My Third Post's content"}
    // ]
    posts: Post[] = [];
    postSub = new Subscription;
    isLoading = false;
    constructor(private postsService: PostsService){}
    
    ngOnInit() {
        this.postsService.getPosts();
        this.isLoading = true;
        this.postSub = this.postsService.getUpdatedPosts().subscribe((posts)=>{
            this.posts = posts
            this.isLoading = false;
        })
    }

    onDelete(postId: string){
        this.postsService.deletePost(postId);
    }

    ngOnDestroy() {
        this.postSub.unsubscribe();
    }



}