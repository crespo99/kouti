import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

const API_BASE_URL = '/colline-rest-api';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = 'eyJraWQiOiI5YTViZTMwNi1jNzk1LTQ4NjktOTE4Yi0xZGY3NGYwODg3ZWMiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzYSIsImlzcyI6IkNvbGxpbmUiLCJpYXQiOjE3NTU3MDkzMDgsImV4cCI6MTc1NTcxMTEwOCwicm9sZXMiOlsiYWRtaW4iLCJ1c2VyIl0sInByZWZlcnJlZF91c2VybmFtZSI6InNhIiwidXNlcm5hbWUiOiJzYSJ9.d9stiVwb7qu3j8R37rRUF7ezR-V4YYVbqNMdIHyKBssqQE6B59QoysWfGYBFnzPC6vc1xBesqUOQXofHp5GK-Q';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.log('API Error:', error);
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      
      if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check your connection.';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to access this resource.';
      } else if (error.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.status >= 500) {
        errorMessage = 'A server error occurred. Please try again later.';
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  get<T>(endpoint: string, params?: any): Observable<T> {
    // Construct the full URL before making the request
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    const options = {
      headers: this.getHeaders(),
      params: new HttpParams({ fromObject: params }),
      withCredentials: true,
      observe: 'response' as const  // Get the full response including status and headers
    };

    console.log('\n=== API Request ===');
    console.log(`[${new Date().toISOString()}] GET ${fullUrl}`);
    console.log('Full request URL (before proxy):', fullUrl);
    console.log('Request Headers:', JSON.stringify(Array.from(options.headers.keys()).map(k => [k, options.headers.get(k)]), null, 2));
    if (params) console.log('Request Params:', JSON.stringify(params, null, 2));

    return this.http.get<T>(fullUrl, options).pipe(
      tap({
        next: (response) => {
          console.log('\n=== API Response ===');
          console.log(`[${new Date().toISOString()}] Success`);
          console.log('Status:', response.status, response.statusText);
          console.log('Response Headers:', response.headers.keys().map(k => `${k}: ${response.headers.get(k)}`).join('\n  '));
          console.log('Response Body:', response.body);
        },
        error: (error: HttpErrorResponse) => {
          console.log('\n=== API Error ===');
          console.log(`[${new Date().toISOString()}] Error ${error.status}: ${error.statusText}`);
          console.log('Requested URL (before proxy):', fullUrl);
          console.log('Actual URL (after proxy):', error.url);
          console.log('Error Headers:', error.headers.keys().map(k => `${k}: ${error.headers.get(k)}`).join('\n  '));
          console.log('Error Details:', error.error);
          
          // Log more details about the error
          if (error.status === 0) {
            console.error('Client-side or network error occurred.');
            console.error('Error:', error.error);
          } else {
            console.error(`Backend returned code ${error.status}, body was:`, error.error);
          }
        }
      }),
      map(response => response.body as T),  // Extract the body from the response
      catchError(this.handleError)
    );
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${API_BASE_URL}${endpoint}`, data, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Generic POST request
   * @param endpoint - API endpoint
   * @param data - Request body
   */
  // Add other HTTP methods (PUT, DELETE) as needed with similar error handling
}
