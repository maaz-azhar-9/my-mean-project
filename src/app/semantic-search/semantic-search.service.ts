import { Injectable, inject } from '@angular/core';
import { SearchResult } from './semantic-search';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl + "/posts/semanticSearch"

@Injectable({
  providedIn: 'root'
})
export class SemanticSearchService {

  http = inject(HttpClient)

  constructor() { }

  semanticSearch(searchQuery: string): Observable<{result: SearchResult[]}>{
    const payload = {
      searchText: searchQuery
    }
    return this.http.post<{result: SearchResult[]}>(BACKEND_URL, payload);
  }

}
