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
     private updatePost$ = new Subject<Post[]>();

     constructor(private http: HttpClient, private router: Router){}

     getPosts(){
        this.http.get<{message: string, posts: any[]}>("http://localhost:3000/api/posts")
        .pipe(map((postsData)=>{
          return postsData.posts.map((post)=>{
            return {
               title: post.title,
               content: post.content,
               id: post._id,
               imagePath: post.imagePath
            }
         })
        }))
        .subscribe((transformedPosts)=>{
         this.posts = transformedPosts
         this.updatePost$.next([...this.posts]);
        })
     }

     getUpdatedPosts(){
        return this.updatePost$.asObservable();
     }

     addPosts(title: string, content:string){
        const post = {id:"", title: title, content: content};
        this.http.post<{message: string, post: Post}>('http://localhost:3000/api/posts',post).subscribe((response)=>{
         // console.log(response.message);
         // post.id = response.post.id
         const post:Post={
            id: response.post.id,
            title: title,
            content:content,
            imagePath:response.post.imagePath
         }
         this.posts.push(post)
         this.updatePost$.next([...this.posts])
         this.router.navigate(['/']);
        })
     }

     deletePost(postId: string){
      this.http.delete(`http://localhost:3000/api/posts/${postId}`).subscribe(
         ()=>{
            this.getPosts();
            console.log("Deleted Successfully");
         }
      )
     }

     getPost(postId: string | undefined | null){
      // return {...this.posts.find((post)=> post.id===postId)};
      return this.http.get<{_id: string, title:string, content:string}>(`http://localhost:3000/api/posts/${postId}`);
     }

     updatePost(id: string, title: string, content: string){
      let post: Post = {id:id, title: title, content: content, imagePath: null} 
      this.http.put(`http://localhost:3000/api/posts/${id}`,post).subscribe((res)=>{
         console.log(res);
         this.router.navigate(['/']);
      })
     }
}