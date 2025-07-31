import { Post } from "./posts.model";
import { Injectable } from "@angular/core";
import { map, Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class PostsService {
     private posts: Post[] = [];
     private updatePost$ = new Subject<{posts:Post[], maxPosts: number}>();

     constructor(private http: HttpClient, private router: Router){}

     getPosts(postsPerPage: number, currentPage:number){
      const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`
        this.http.get<{message: string, posts: any[], maxPosts: number}>("http://localhost:3000/api/posts"+queryParams)
        .pipe(map((postsData)=>{
          return {posts: postsData.posts.map((post)=>{
            return {
               title: post.title,
               content: post.content,
               id: post._id,
               imagePath: post.imagePath,
               creator: post.creator
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
        this.http.post<{message: string, post: Post}>('http://localhost:3000/api/posts',postData).subscribe((response)=>{
         // console.log(response.message);
         // post.id = response.post.id
         this.router.navigate(['/']);
        })
     }

     deletePost(postId: string){
      return this.http.delete(`http://localhost:3000/api/posts/${postId}`)
     }

     getPost(postId: string | undefined | null){
      // return {...this.posts.find((post)=> post.id===postId)};
      return this.http.get<{_id: string, title:string, content:string, imagePath: string}>(`http://localhost:3000/api/posts/${postId}`);
     }

     updatePost(id: string, title: string, content: string, image: File | string){
      let postData;
      if(typeof(image) === "object"){
         postData = new FormData();
         postData.append("id",id)
         postData.append("title",title);
         postData.append("content",content);
         postData.append("image", image, title)
      }
      else{
         postData = {id:id, title: title, content: content, imagePath: image}
      } 
      this.http.put(`http://localhost:3000/api/posts/${id}`,postData).subscribe((res)=>{
         // console.log(res);
         // const post = {id:id, title: title, content: content, imagePath: res.imagePath}
         this.router.navigate(['/']);
      })
     }
}