import { Injectable } from '@angular/core';
import  imageCompression from 'browser-image-compression'

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor() { }
  compressImage(file: File, maxSize:number = 0.8){
    const options = {
      maxSizeMB: maxSize,
      useWebWorker: true,
    }
    return imageCompression(file, options);
  }

}
