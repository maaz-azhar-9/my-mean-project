import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { Post } from "../posts/posts.model";
import { PostsService } from "../posts/posts.service";
import { Subscription } from "rxjs";
import { PageEvent } from "@angular/material/paginator";
import { AuthService } from "../auth/auth.service";
@Component({
    selector:'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit,OnDestroy{
    posts: Post[] = [];
    postSub = new Subscription;
    authSub = new Subscription;
    isUserAuthenticated = false;
    authSvc = inject(AuthService)
    isLoading = false;
    totalPosts = 0;
    postsPerPage = 2;
    pageSizeOptions = [5, 10, 25, 100];
    currentPage = 1;
    userId: string
    constructor(private postsService: PostsService){}
    
    ngOnInit() {
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
        this.isLoading = true;
        this.userId = this.authSvc.getUserId();
        this.postSub = this.postsService.getUpdatedPosts().subscribe((postsData)=>{
            this.posts = postsData.posts
            this.totalPosts = postsData.maxPosts
            this.isLoading = false;
        })
        this.authSub = this.authSvc.getAuthStatus().subscribe((isAuthenticated) => {
            this.isUserAuthenticated = isAuthenticated;
            this.userId = this.authSvc.getUserId();
        })
    }

    onDelete(postId: string){
        this.isLoading = true;
        this.postsService.deletePost(postId).subscribe(()=>{
            this.postsService.getPosts(this.postsPerPage, this.currentPage);
        }, ()=>{
            this.isLoading = false;
        });
    }

    ngOnDestroy() {
        this.postSub.unsubscribe();
        this.authSub.unsubscribe();
    }

    onChangedPage(pageData: PageEvent){
        this.isLoading = true;
        this.currentPage = pageData.pageIndex + 1;
        this.postsPerPage = pageData.pageSize;
        this.postsService.getPosts(this.postsPerPage, this.currentPage)
    }

}