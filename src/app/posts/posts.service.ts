import { Post } from "./posts.model";
import { Injectable } from "@angular/core";
import { map, Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { ToastService } from "../toast.service";
import { environment } from "src/environments/environment";
import { LocalStorageEnum } from "./posts.model";

const BACKEND_URL = environment.apiUrl + "/posts"

@Injectable({
    providedIn: 'root'
})
export class PostsService {
     private posts: Post[] = [];
     private updatePost$ = new Subject<{posts:Post[], maxPosts: number}>();

     constructor(private http: HttpClient, private router: Router, private toastSvc: ToastService){}

     getPosts(postsPerPage: number, currentPage:number, searchText: string = ""){
      const encodeSearchText = encodeURIComponent(searchText);
      const queryParams = {
         pageSize: postsPerPage,
         page:currentPage,
         search: encodeSearchText,
         userId: localStorage.getItem(LocalStorageEnum.userId)
      }
        this.http.get<{message: string, posts: any[], maxPosts: number}>(BACKEND_URL,{
         params: queryParams
        })
        .pipe(map((postsData)=>{
          return {posts: postsData.posts.map((post)=>{
            return {
               title: post.title,
               content: post.content,
               id: post._id,
               imagePath: post.imagePath,
               creator: post.creator,
               likeCount: post.likeCount,
               isLiked: post.isLiked
            }
         }),
         maxPosts: postsData.maxPosts
      }
        }))
        .subscribe((transformedPostData)=>{
         this.posts = transformedPostData.posts
         this.updatePost$.next({posts:[...this.posts], maxPosts: transformedPostData.maxPosts});
        })
     }

     getUpdatedPosts(){
        return this.updatePost$.asObservable();
     }

     addPosts(title: string, content:string, image: File){
        let postData = new FormData();
        postData.append("title",title);
        postData.append("content",content);
        postData.append("image", image, title)
        return this.http.post<{message: string, post: Post}>(BACKEND_URL,postData)
     }

     deletePost(postId: string){
      return this.http.delete(`${BACKEND_URL}/${postId}`)
     }

     getPost(postId: string | undefined | null){
      return this.http.get<{_id: string, title:string, content:string, imagePath: string, likeCount: number}>(`${BACKEND_URL}/${postId}`);
     }

     updatePost(id: string, title: string, content: string, image: File | string){
      let postData;
      if(typeof(image) === "object"){
         postData = new FormData();
         postData.append("id", id);
         postData.append("title", title);
         postData.append("content", content);
         postData.append("image", image, title);
      }
      else{
         postData = {id:id, title: title, content: content, imagePath: image}
      } 
      return this.http.put(`${BACKEND_URL}/${id}`,postData)
     }
}