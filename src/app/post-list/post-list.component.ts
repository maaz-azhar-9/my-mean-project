import { Component, OnDestroy, OnInit, inject, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { Post } from "../posts/posts.model";
import { PostsService } from "../posts/posts.service";
import { debounceTime, fromEvent, Subscription } from "rxjs";
import { PageEvent } from "@angular/material/paginator";
import { AuthService } from "../auth/auth.service";
import { ToastService } from "../toast.service";
@Component({
    selector:'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit, OnDestroy, AfterViewInit{
    @ViewChild('searchInput') searchInput : ElementRef;
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
    userId: string;
    searchText: string = "";
    constructor(private postsService: PostsService, private toastSvc: ToastService){}
    
    ngOnInit() {
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
        this.isLoading = true;
        this.userId = this.authSvc.getUserId();
        this.postSub = this.postsService.getUpdatedPosts().subscribe((postsData)=>{
            this.posts = postsData.posts;
            this.totalPosts = postsData.maxPosts;
            this.isLoading = false;
        })
        this.authSub = this.authSvc.getAuthStatus().subscribe((isAuthenticated) => {
            this.isUserAuthenticated = isAuthenticated;
            this.userId = this.authSvc.getUserId();
        })
    }

    ngAfterViewInit() {
        fromEvent(this.searchInput.nativeElement,'input').pipe(debounceTime(1000)).subscribe(()=>{
            this.postsService.getPosts(this.postsPerPage, this.currentPage, this.searchText);
        })
    }

    onDelete(postId: string){
        this.isLoading = true;
        this.postsService.deletePost(postId).subscribe(()=>{
            this.toastSvc.show("Post Successfulyy Deleted.")
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
        this.postsService.getPosts(this.postsPerPage, this.currentPage, this.searchText);
    }

}