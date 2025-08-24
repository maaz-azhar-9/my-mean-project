import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  constructor() { }
  private likeAudio = new Audio('assets/audio.dat');

  playLikeSound(){
    this.likeAudio.currentTime = 0;
    this.likeAudio.play();
  }
}
