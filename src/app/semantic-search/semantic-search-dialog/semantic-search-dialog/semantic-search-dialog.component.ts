import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { searchResult } from '../../semantic-search';

@Component({
  selector: 'app-semantic-search-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './semantic-search-dialog.component.html',
  styleUrls: ['./semantic-search-dialog.component.scss']
})
export class SemanticSearchDialogComponent {
  searchQuery: string = '';
  isSearching: boolean = false;
  results: searchResult[] = []; // This will be populated api response

  performSearch() {
    this.isSearching = true;
    
    // Simulate API Call to your Node.js backend
    setTimeout(() => {
      // Dummy data representing vector search results
      this.results = [
        { title: 'Finding balance in life is more about mental peace than physical rest.', id:"456" },
        { title: 'Consistency in coding builds resilience against complex bugs.', id:"123" }
      ];
      this.isSearching = false;
    }, 1500);
  }
}
