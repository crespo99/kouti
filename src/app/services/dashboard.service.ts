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

// DTO for Collateral Settlement Summary
export interface CollateralSettlementSummaryDto {
  assetName: string;
  sysDraft: number;
  pending: number;
  query: number;
  authorised: number;
  pendingRelease: number;
  pendingSettlement: number;
  outstandingSettlement: number;
  corpActionDue: number;
  assetCategory: number;
  category: number;
  isTSA: number;          // API uses 0/1; UI can coerce to boolean when needed
  reverseFailed: number;
  mirroredFailed: number;
  failed: number;
}

// DTO for Interest Summary - up to today (per movement section)
export interface InterestMovementSummaryDto {
  movementName: string;
  pending: number;
  query: number;
  authorised: number;
  pendingRelease: number;
  pendingSettlement: number;
  outstandingSettlement: number;
  sysDraft: number;
  movementId: number;
}

// Map of section name to its summary
export type InterestSummaryUpToTodayDto = Record<string, InterestMovementSummaryDto>;

// DTO for Approvals Management counts
export interface ApprovalManagerCountsDto {
  newAgreementsSize: number;
  amendedAgreementsSize: number;
  amendedUmbrellaAgreementsSize: number;
  amendedEligiRulesTempSize: number;
  deletedEligiRulesTempSize: number;
  newStatementsSize: number;
  amendedStatementsSize: number;
  pendApprovalStatementsSize: number;
  progressStatementsSize: number;
  staleStatementsSize: number;
  amendedSettInstrsSize: number;
  amendedSecuritiesDataSize: number;
  amendedTotalTrades: number;
  amendedOrgDataSize: number;
  amendedWorkflowSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly DASHBOARD_ENDPOINT = '/services/dashboard/settlementsummarycounts';
  private readonly INTEREST_TODAY_ENDPOINT = '/services/dashboard/interestsummaryuptotodaycounts';
  private readonly APPROVAL_MANAGER_ENDPOINT = '/services/dashboard/approvalmanagercounts';

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
   * Fetches Collateral Settlement Summary DTO
   */
  getCollateralSettlementSummary(): Observable<CollateralSettlementSummaryDto> {
    console.log(' [DashboardService] Fetching Collateral Settlement Summary:', this.DASHBOARD_ENDPOINT);
    return this.apiService.get<CollateralSettlementSummaryDto>(this.DASHBOARD_ENDPOINT).pipe(
      tap({
        next: (data) => console.debug('[DashboardService] Collateral Summary data:', data),
        error: (error) => console.error('[DashboardService] Collateral Summary error:', error),
        finalize: () => console.log(' [DashboardService] Collateral Summary call completed')
      }),
      catchError(error => {
        return throwError(() => new Error('Failed to load collateral settlement summary'));
      })
    );
  }

  /**
   * Fetches Interest Summary - up to today DTO
   */
  getInterestSummaryUpToToday(): Observable<InterestSummaryUpToTodayDto> {
    console.log(' [DashboardService] Fetching Interest Summary up to today:', this.INTEREST_TODAY_ENDPOINT);
    return this.apiService.get<InterestSummaryUpToTodayDto>(this.INTEREST_TODAY_ENDPOINT).pipe(
      tap({
        next: (data) => console.debug('[DashboardService] Interest Summary Today data:', data),
        error: (error) => console.error('[DashboardService] Interest Summary Today error:', error),
        finalize: () => console.log(' [DashboardService] Interest Summary Today call completed')
      }),
      catchError(error => {
        return throwError(() => new Error('Failed to load interest summary up to today'));
      })
    );
  }

  /**
   * Fetches Approval Manager counts DTO
   */
  getApprovalManagerCounts(): Observable<ApprovalManagerCountsDto> {
    console.log(' [DashboardService] Fetching Approval Manager counts:', this.APPROVAL_MANAGER_ENDPOINT);
    return this.apiService.get<ApprovalManagerCountsDto>(this.APPROVAL_MANAGER_ENDPOINT).pipe(
      tap({
        next: (data) => console.debug('[DashboardService] Approval Manager counts data:', data),
        error: (error) => console.error('[DashboardService] Approval Manager counts error:', error),
        finalize: () => console.log(' [DashboardService] Approval Manager counts call completed')
      }),
      catchError(error => {
        return throwError(() => new Error('Failed to load approval manager counts'));
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
