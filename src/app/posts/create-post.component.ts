import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { FormControl, FormGroup, NgForm } from "@angular/forms";
import { PostsService } from "./posts.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Validators } from "@angular/forms";
import { mimeType } from "./mime-type.validator";
import { Subscription } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { ImageService } from "../image.service";
import { ToastService } from "../toast.service";

@Component({
    selector:'app-create-post',
    templateUrl: './create-post.component.html',
    styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent implements OnInit, OnDestroy {

    constructor(private postsService: PostsService,
        private route: ActivatedRoute,
        private imgSvc: ImageService,
        private toastSvc: ToastService
    ){}
    mode = "create";
    private postId: string ="";
    isLoading = false;
    isImageLoading = false;
    post : any;
    imagePreview : string = "";
    showExistingImage = true;
    authSvc = inject(AuthService)
    authStatusSub: Subscription;
    form: FormGroup = new FormGroup({
        'title': new FormControl(null,{validators : [Validators.required, Validators.minLength(3)]}),
        'content': new FormControl(null,{validators : [Validators.required]}),
        'image' : new FormControl(null,{validators : [Validators.required], asyncValidators: mimeType}),
    });
    
    ngOnInit() {
        this.authStatusSub = this.authSvc.getAuthStatus().subscribe((authStatus)=>{
            this.isLoading = false;
        });
        this.route.paramMap.subscribe((paramMap: ParamMap)=>{
            if(paramMap.has('postId')){
                this.mode = "edit";
                this.postId = paramMap.get('postId') ?? "";
                // this.post = this.postsService.getPost(this.postId);
                this.isLoading = true;
                this.postsService.getPost(this.postId).subscribe((fetchedPost)=>{
                    this.post = {id: fetchedPost._id, title:fetchedPost.title, content: fetchedPost.content, imagePath:fetchedPost.imagePath}
                    this.isLoading = false;
                    this.form.setValue({'title':fetchedPost.title, 'content': fetchedPost.content,'image':fetchedPost.imagePath})
                })
            }
            else{
                this.mode = "create";
            }
        })
    }
    // enteredTitle = '';
    // enteredContent = '';
    onImagePicked(event: Event) {
        this.showExistingImage = false;
        this.isImageLoading = true;
        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreview = (reader.result as string);
        }
        let file = (event.target as HTMLInputElement).files[0];
        if (file.size > 972800) {
            this.imgSvc.compressImage(file).then((compressedFile) => {
                file = compressedFile;
                this.toastSvc.show("Your image quality is down graded");
                this.setImage(file);
            }).catch(()=>{
                this.toastSvc.show("Something went wrong try to add another picture");
                this.isImageLoading = false;
            })
        }
        else {
            this.setImage(file);
        }
    }

    setImage(file: File) {
        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreview = (reader.result as string);
        }
        this.form.patchValue({ image: file });
        this.form.get("image")?.updateValueAndValidity();
        reader.readAsDataURL(file);
        this.isImageLoading = false;
    }

    onSavePost(){
        if(this.form.invalid){
            return;
        }
        if(this.mode=="create"){
            this.postsService.addPosts(this.form.value.title,this.form.value.content, this.form.value.image);
        }
        else{
            this.postsService.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image);
        }
        
        this.form.reset();
    }

    ngOnDestroy() {
        this.authStatusSub.unsubscribe();
    }
}