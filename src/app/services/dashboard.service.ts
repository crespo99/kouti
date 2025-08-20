import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface ExternalExposureData {
  // TODO: Update this interface to match your API response structure
  // These are example fields - replace with your actual data structure
  callsRecalls?: {
    awaitingAction: number;
    processing: number;
    pastNotification: number;
  };
  deliveriesReturns?: {
    awaitingAction: number;
    processing: number;
    pastNotification: number;
  };
  // Add other data properties as needed
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly DASHBOARD_ENDPOINT = '/services/dashboard/settlementsummarycounts';

  constructor(private apiService: ApiService) {}

  /**
   * Fetches external exposure data from the backend
   */
  getExternalExposureData(): Observable<ExternalExposureData> {
    console.log(' [DashboardService] Making API call to:', this.DASHBOARD_ENDPOINT);
    
    return this.apiService.get<ExternalExposureData>(this.DASHBOARD_ENDPOINT).pipe(
      tap({
        next: (data) => {
          console.log(' [DashboardService] API call successful');
          console.debug('[DashboardService] Response data:', data);
        },
        error: (error) => {
          console.log(' [DashboardService] API call failed:', error);
          console.log('[DashboardService] Error details:', {
            status: error.status,
            message: error.message,
            url: error.url,
            name: error.name
          });
        },
        finalize: () => {
          console.log(' [DashboardService] API call completed');
        }
      }),
      catchError(error => {
        console.log('[DashboardService] Error in API call:', error);
        return throwError(() => new Error('Failed to load dashboard data'));
      })
    );
  }

  /**
   * Fetches filtered external exposure data
   * @param params Filter parameters
   */
  getFilteredExternalExposureData(params: any): Observable<ExternalExposureData> {
    return this.apiService.get<ExternalExposureData>(this.DASHBOARD_ENDPOINT, params);
  }
}
