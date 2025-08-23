import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl + "/like"

@Injectable({
  providedIn: 'root'
})
export class LikeService {

  constructor() { }
  http = inject(HttpClient)

  likePost(postId: string, userId: string){
    return this.http.post<{message: string}>(BACKEND_URL+`/${postId}/${userId}`,{})
  }

  unlikePost(postId: string, userId: string){
    return this.http.delete<{message: string}>(BACKEND_URL+`/${postId}/${userId}`)
  }
}
