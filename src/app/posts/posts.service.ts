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

     addPosts(title: string, content:string, image: File){
        let postData = new FormData();
        postData.append("title",title);
        postData.append("content",content);
        postData.append("image", image, title)
        this.http.post<{message: string, post: Post}>('http://localhost:3000/api/posts',postData).subscribe((response)=>{
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
         console.log(res);
         // const post = {id:id, title: title, content: content, imagePath: res.imagePath}
         this.router.navigate(['/']);
      })
     }
}