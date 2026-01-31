import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchResult } from '../../semantic-search';
import { SemanticSearchService } from '../../semantic-search.service';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-semantic-search-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './semantic-search-dialog.component.html',
  styleUrls: ['./semantic-search-dialog.component.scss']
})
export class SemanticSearchDialogComponent {
  searchQuery: string = '';
  isSearching: boolean = false;
  results: SearchResult[] = []; // This will be populated api response
  semanticSearchSvc = inject(SemanticSearchService)
  dialogRef = inject(MatDialogRef)
  router = inject(Router)

  performSearch() {
    this.isSearching = true;
    this.semanticSearchSvc.semanticSearch(this.searchQuery).pipe(take(1)).subscribe((response)=>{
      this.results = response.result;
      this.isSearching = false;
    })
  }

  closeDialog(){
    this.dialogRef.close();
  }

  openPost(postId: string){
    this.router.navigate([`/post/${postId}`]);
    this.dialogRef.close();
  }

}
