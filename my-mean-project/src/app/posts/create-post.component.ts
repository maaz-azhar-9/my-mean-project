import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { Post } from "./posts.model";
import { FormControl, FormGroup, NgForm } from "@angular/forms";
import { PostsService } from "./posts.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Validators } from "@angular/forms";
import { mimeType } from "./mime-type.validator";

@Component({
    selector:'app-create-post',
    templateUrl: './create-post.component.html',
    styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent implements OnInit{

    constructor(private postsService: PostsService,
        private route: ActivatedRoute
    ){}
    private mode = "create";
    private postId: string ="";
    isLoading = false;
    post : any;
    imagePreview : string = "";
    form: FormGroup = new FormGroup({
        'title': new FormControl(null,{validators : [Validators.required, Validators.minLength(3)]}),
        'content': new FormControl(null,{validators : [Validators.required]}),
        'image' : new FormControl(null,{validators : [Validators.required], asyncValidators: mimeType}),
    });
    
    ngOnInit() {
        this.route.paramMap.subscribe((paramMap: ParamMap)=>{
            if(paramMap.has('postId')){
                this.mode = "edit";
                this.postId = paramMap.get('postId') ?? "";
                // this.post = this.postsService.getPost(this.postId);
                this.isLoading = true;
                this.postsService.getPost(this.postId).subscribe((fetchedPost)=>{
                    this.post = {id: fetchedPost._id, title:fetchedPost.title, content: fetchedPost.content, imagePath:null}
                    this.isLoading = false;
                    this.form.setValue({'title':fetchedPost.title, 'content': fetchedPost.content})
                })
            }
            else{
                this.mode = "create";
            }
        })
    }
    // enteredTitle = '';
    // enteredContent = '';
    onImagePicked(event : Event){
        const file = (event.target as HTMLInputElement).files;
        if(file?.length) 
        {this.form.patchValue({image: file[0]});
        this.form.get("image")?.updateValueAndValidity();
        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreview = (reader.result as string);
        }
        reader.readAsDataURL(file[0]);
    }
    }

    onSavePost(){
        if(this.form.invalid){
            return;
        }
        if(this.mode=="create"){
            this.postsService.addPosts(this.form.value.title,this.form.value.content);
        }
        else{
            this.postsService.updatePost(this.postId, this.form.value.title, this.form.value.content);
        }
        
        this.form.reset();
    }
}