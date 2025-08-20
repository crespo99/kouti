import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartCardComponent } from '../chart-card/chart-card.component';
import { FilterBarComponent, FilterData } from '../filter-bar/filter-bar.component';
import { DashboardService, ExternalExposureData, CollateralSettlementSummaryDto, InterestSummaryUpToTodayDto, ApprovalManagerCountsDto } from '../../services/dashboard.service';
import { Subscription } from 'rxjs';

export interface ChartData {
  label: string;
  value: number;
  color: string;
}

export interface AlertData {
  type: string;
  count: number;
  color: string;
}

export interface SummaryData {
  label: string;
  value: number;
  barColor: string;
}

export interface DashboardCard {
  title: string;
  data: ChartData[];
  type: 'donut' | 'bar' | 'status' | 'summary';
  alerts?: AlertData[];
  summary?: SummaryData[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ChartCardComponent, FilterBarComponent, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  lastUpdated: Date = new Date();
  autoRefresh: boolean = false;
  nextRefresh: Date | null = null;
  private refreshInterval: any;
  private dataSubscription: Subscription | null = null;

  callsRecallsData: DashboardCard = {
    title: 'Calls and Recalls',
    type: 'donut',
    data: [
      { label: 'Awaiting Action', value: 215, color: '#EF4444' },
      { label: 'Processing Call', value: 151, color: '#9CA3AF' },
      { label: 'Call Past Notification Time', value: 238, color: '#7C2D12' }
    ]
  };

  deliveriesReturnsData: DashboardCard = {
    title: 'Deliveries and Returns',
    type: 'donut',
    data: [
      { label: 'Awaiting Action', value: 358, color: '#EF4444' },
      { label: 'Processing Call', value: 34, color: '#9CA3AF' },
      { label: 'Call Past Notification Time', value: 393, color: '#7C2D12' }
    ]
  };

  substitutionsData: DashboardCard = {
    title: 'Substitutions',
    type: 'donut',
    data: [
      { label: 'Substitution Requests', value: 98, color: '#7C2D12' },
      { label: 'Substitution Confirmations', value: 54, color: '#9CA3AF' }
    ]
  };

  noCallsData: DashboardCard = {
    title: 'No Calls',
    type: 'donut',
    data: [
      { label: 'No Calls Required', value: 431, color: '#7C2D12' },
      { label: 'Completed', value: 12, color: '#EF4444' }
    ]
  };

  agreementAlertsData: DashboardCard = {
    title: 'Agreement Alerts',
    type: 'status',
    data: [],
    alerts: [
      { type: 'Concentration Limits Breached', count: 20, color: '#EF4444' },
      { type: 'IM Threshold Breaches', count: 2, color: '#EF4444' },
      { type: 'Ineligible Asset', count: 17, color: '#EF4444' },
      { type: 'Failed Statement', count: 11, color: '#EF4444' }
    ]
  };

  collateralSettlementData: DashboardCard = {
    title: 'Collateral Settlement Summary',
    type: 'summary',
    data: [],
    summary: [
      { label: 'System Draft', value: 0, barColor: '#F3F4F6' },
      { label: 'Pending', value: 0, barColor: '#FCA5A5' },
      { label: 'Query', value: 0, barColor: '#F3F4F6' },
      { label: 'Authorised', value: 0, barColor: '#F3F4F6' },
      { label: 'Pending Release', value: 0, barColor: '#F3F4F6' },
      { label: 'Pending Settlement', value: 0, barColor: '#DC2626' },
      { label: 'Outstanding Settlement', value: 0, barColor: '#F3F4F6' },
      { label: 'Failed', value: 0, barColor: '#374151' },
      { label: 'Reverse Failed', value: 0, barColor: '#F3F4F6' },
      { label: 'Mirrored Failed', value: 0, barColor: '#F3F4F6' }
    ]
  };

  internalReviewData: DashboardCard = {
    title: 'Internal Review',
    type: 'donut',
    data: [
      { label: 'Calls Recalls', value: 36, color: '#7C2D12' },
      { label: 'Deliveries Returns', value: 74, color: '#FCA5A5' },
      { label: 'No Calls', value: 115, color: '#9CA3AF' }
    ]
  };

  approvalsManagementData: DashboardCard = {
    title: 'Approvals Management',
    type: 'summary',
    data: [],
    summary: [
      { label: 'Organisation', value: 4, barColor: '#F3F4F6' },
      { label: 'Agreements', value: 22, barColor: '#F3F4F6' },
      { label: 'Statements', value: 31, barColor: '#F3F4F6' },
      { label: 'Workflow', value: 0, barColor: '#F3F4F6' },
      { label: 'Trades', value: 0, barColor: '#F3F4F6' },
      { label: 'Settlement Instructions', value: 5, barColor: '#F3F4F6' },
      { label: 'Securities Data', value: 38, barColor: '#F3F4F6' },
      { label: 'Eligibility Rules Template', value: 24, barColor: '#F3F4F6' }
    ]
  };

  todaysEventsData: DashboardCard = {
    title: "Today's Events",
    type: 'status',
    data: [
      { label: 'Actioned', value: 0, color: '#EF4444' },
      { label: 'Not Actioned', value: 0, color: '#7C2D12' }
    ]
  };

  // Sorting configuration for Interest Summary - up to today
  sortConfig: { by: 'pending' | 'total' | 'authorised' | 'query'; order: 'asc' | 'desc' } = {
    by: 'total',
    order: 'desc'
  };

  interestSummaryLastMonthData: DashboardCard = {
    title: 'Interest Summary - for last month',
    type: 'donut',
    data: [
      { label: 'Outstanding', value: 213, color: '#7C2D12' },
      { label: 'Applied', value: 16, color: '#FCA5A5' }
    ]
  };

  interestSummaryTodayData: DashboardCard = {
    title: 'Interest Summary - up to today',
    type: 'bar',
    data: [
      { label: 'Pay', value: 0, color: '#9CA3AF' },
      { label: 'Query', value: 0, color: '#D1D5DB' },
      { label: 'Authorised', value: 0, color: '#FCA5A5' },
      { label: 'Pending Release', value: 0, color: '#DC2626' },
      { label: 'Pending Settlement', value: 0, color: '#7C2D12' },
      { label: 'Receive', value: 0, color: '#9CA3AF' },
      { label: 'Capitalise Pay', value: 0, color: '#7C2D12' },
      { label: 'Capitalise Receive', value: 0, color: '#9CA3AF' }
    ]
  };

  // New: one donut card per movement section for Interest Summary - up to today
  interestSummaryTodayDonuts: DashboardCard[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private fetchApprovalManagerCounts(): void {
    console.log('📡 Fetching Approval Manager counts DTO...');
    this.dashboardService.getApprovalManagerCounts().subscribe({
      next: (dto: ApprovalManagerCountsDto) => {
        console.log('✅ Approval Manager counts DTO:', dto);
        this.approvalsManagementData = {
          ...this.approvalsManagementData,
          summary: this.mapApprovalManagerSummary(dto)
        };
      },
      error: (err) => {
        console.error('❌ Failed to fetch Approval Manager counts:', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  loadDashboardData(filters?: any): void {
    console.log('🔄 Loading dashboard data...');
    this.isLoading = true;
    
    console.log('📡 Making API call to external exposure endpoint...');
    this.dataSubscription = this.dashboardService.getExternalExposureData()
      .subscribe({
        next: (data: ExternalExposureData) => {
          console.log('✅ API Response:', data);
          
          if (!data) {
            console.warn('⚠️ Received empty or null data from API');
            return;
          }
          
          console.log('🔄 Updating dashboard with new data...');
          this.updateDashboardData(data);
          // Fetch Collateral Settlement Summary in parallel to populate that card
          this.fetchCollateralSettlementSummary();
          // Fetch Interest Summary - up to today
          this.fetchInterestSummaryUpToToday();
          // Fetch Approvals Management counts
          this.fetchApprovalManagerCounts();
          this.lastUpdated = new Date();
          this.isLoading = false;
          console.log('✅ Dashboard data updated successfully');
          
          // Start auto-refresh if enabled
          if (this.autoRefresh) {
            console.log('🔄 Auto-refresh is enabled, scheduling next update...');
            this.startAutoRefresh();
          }
        },
        error: (error) => {
          console.log('❌ Error loading dashboard data:', error);
          console.log('Error details:', {
            status: error.status,
            message: error.message,
            url: error.url,
            name: error.name
          });
          this.isLoading = false;
          // TODO: Show error message to user
        },
        complete: () => {
          console.log('🏁 API call completed');
        }
      });
  }

  updateDashboardData(apiData: ExternalExposureData): void {
    // Update the dashboard cards with data from the API
    if (apiData.callsRecalls) {
      this.callsRecallsData = {
        title: 'Calls and Recalls',
        type: 'donut',
        data: [
          { label: 'Awaiting Action', value: apiData.callsRecalls.awaitingAction || 0, color: '#EF4444' },
          { label: 'Processing Call', value: apiData.callsRecalls.processing || 0, color: '#9CA3AF' },
          { label: 'Call Past Notification Time', value: apiData.callsRecalls.pastNotification || 0, color: '#7C2D12' }
        ]
      };
    }

    // Update other dashboard cards similarly when you have the actual API response structure
    // Example for deliveriesReturns (uncomment and update when you have the actual structure):
    /*
    if (apiData.deliveriesReturns) {
      this.deliveriesReturnsData = {
        title: 'Deliveries and Returns',
        type: 'donut',
        data: [
          { label: 'Awaiting Action', value: apiData.deliveriesReturns.awaitingAction || 0, color: '#EF4444' },
          { label: 'Processing Call', value: apiData.deliveriesReturns.processing || 0, color: '#9CA3AF' },
          { label: 'Call Past Notification Time', value: apiData.deliveriesReturns.pastNotification || 0, color: '#7C2D12' }
        ]
      };
    }
    */
  }

  onFiltersApplied(filters: FilterData): void {
    this.loadDashboardData(filters);
  }

  onFiltersReset(): void {
    this.loadDashboardData();
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    if (this.autoRefresh) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  private startAutoRefresh(): void {
    // Refresh every 5 minutes (300000 ms)
    this.refreshInterval = setInterval(() => {
      this.loadDashboardData();
    }, 300000);
    this.updateNextRefreshTime();
  }

  private stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      this.nextRefresh = null;
    }
  }

  private updateNextRefreshTime(): void {
    const now = new Date();
    this.nextRefresh = new Date(now.getTime() + 300000); // 5 minutes from now
  }

  getNextRefreshTime(): string {
    if (!this.nextRefresh) return '';
    const seconds = Math.ceil((this.nextRefresh.getTime() - Date.now()) / 1000);
    return `${seconds}s`;
  }

  getTotalCalls(): number {
    return this.callsRecallsData.data.reduce((sum, item) => sum + item.value, 0);
  }

  getTotalDeliveries(): number {
    return this.deliveriesReturnsData.data.reduce((sum, item) => sum + item.value, 0);
  }

  getTotalAlerts(): number {
    return this.agreementAlertsData.alerts?.reduce((sum, alert) => sum + alert.count, 0) || 0;
  }

  getTotalSettlements(): number {
    return this.collateralSettlementData.summary?.reduce((sum, item) => sum + item.value, 0) || 0;
  }

  private fetchCollateralSettlementSummary(): void {
    console.log('📡 Fetching Collateral Settlement Summary DTO...');
    this.dashboardService.getCollateralSettlementSummary().subscribe({
      next: (dto: CollateralSettlementSummaryDto) => {
        console.log('✅ Collateral Settlement Summary DTO:', dto);
        this.collateralSettlementData = {
          ...this.collateralSettlementData,
          summary: this.mapCollateralSummary(dto)
        };
      },
      error: (err) => {
        console.error('❌ Failed to fetch Collateral Settlement Summary:', err);
      }
    });
  }

  private mapCollateralSummary(dto: CollateralSettlementSummaryDto): SummaryData[] {
    return [
      { label: 'System Draft', value: dto.sysDraft ?? 0, barColor: '#F3F4F6' },
      { label: 'Pending', value: dto.pending ?? 0, barColor: '#FCA5A5' },
      { label: 'Query', value: dto.query ?? 0, barColor: '#F3F4F6' },
      { label: 'Authorised', value: dto.authorised ?? 0, barColor: '#F3F4F6' },
      { label: 'Pending Release', value: dto.pendingRelease ?? 0, barColor: '#F3F4F6' },
      { label: 'Pending Settlement', value: dto.pendingSettlement ?? 0, barColor: '#DC2626' },
      { label: 'Outstanding Settlement', value: dto.outstandingSettlement ?? 0, barColor: '#F3F4F6' },
      { label: 'Failed', value: dto.failed ?? 0, barColor: '#374151' },
      { label: 'Reverse Failed', value: dto.reverseFailed ?? 0, barColor: '#F3F4F6' },
      { label: 'Mirrored Failed', value: dto.mirroredFailed ?? 0, barColor: '#F3F4F6' }
    ];
  }

  private mapApprovalManagerSummary(dto: ApprovalManagerCountsDto): SummaryData[] {
    const agreements = (dto.newAgreementsSize ?? 0)
      + (dto.amendedAgreementsSize ?? 0)
      + (dto.amendedUmbrellaAgreementsSize ?? 0);
    const eligiRules = (dto.amendedEligiRulesTempSize ?? 0)
      + (dto.deletedEligiRulesTempSize ?? 0);
    const statements = (dto.newStatementsSize ?? 0)
      + (dto.amendedStatementsSize ?? 0)
      + (dto.pendApprovalStatementsSize ?? 0)
      + (dto.progressStatementsSize ?? 0)
      + (dto.staleStatementsSize ?? 0);
    return [
      { label: 'Organisation', value: dto.amendedOrgDataSize ?? 0, barColor: '#F3F4F6' },
      { label: 'Agreements', value: agreements, barColor: '#F3F4F6' },
      { label: 'Statements', value: statements, barColor: '#F3F4F6' },
      { label: 'Workflow', value: dto.amendedWorkflowSize ?? 0, barColor: '#F3F4F6' },
      { label: 'Trades', value: dto.amendedTotalTrades ?? 0, barColor: '#F3F4F6' },
      { label: 'Settlement Instructions', value: dto.amendedSettInstrsSize ?? 0, barColor: '#F3F4F6' },
      { label: 'Securities Data', value: dto.amendedSecuritiesDataSize ?? 0, barColor: '#F3F4F6' },
      { label: 'Eligibility Rules Template', value: eligiRules, barColor: '#F3F4F6' }
    ];
  }

  private fetchInterestSummaryUpToToday(): void {
    console.log('📡 Fetching Interest Summary - up to today DTO...');
    this.dashboardService.getInterestSummaryUpToToday().subscribe({
      next: (dto: InterestSummaryUpToTodayDto) => {
        console.log('✅ Interest Summary - up to today DTO:', dto);
        // Build one donut per movement, with movement name in the center
        this.interestSummaryTodayDonuts = this.mapInterestSummaryToDonuts(dto);
      },
      error: (err) => {
        console.error('❌ Failed to fetch Interest Summary - up to today:', err);
      }
    });
  }

  private mapInterestSummaryToday(dto: InterestSummaryUpToTodayDto): ChartData[] {
    // Flatten each movement's metrics into separate bars so all fields are displayed
    const metricColors: Record<string, string> = {
      pending: '#7C2D12',
      query: '#D1D5DB',
      authorised: '#FCA5A5',
      pendingRelease: '#DC2626',
      pendingSettlement: '#7C2D12',
      outstandingSettlement: '#9CA3AF',
      sysDraft: '#F3F4F6'
    };

    const bars: ChartData[] = [];
    const entries = Object.entries(dto);

    // sort movements based on config
    const metricKeys = ['pending','query','authorised','pendingRelease','pendingSettlement','outstandingSettlement','sysDraft'] as const;
    const dir = this.sortConfig.order === 'desc' ? -1 : 1;
    const getVal = (x: any) => this.sortConfig.by === 'total'
      ? metricKeys.reduce((acc, k) => acc + Number(x?.[k] ?? 0), 0)
      : Number(x?.[this.sortConfig.by] ?? 0);

    entries.sort(([, a], [, b]) => {
      const va = getVal(a);
      const vb = getVal(b);
      return (va - vb) * dir;
    });

    entries.forEach(([sectionName, s]) => {
      if (!s) return;
      const metrics: Array<keyof typeof metricColors> = [
        'pending',
        'query',
        'authorised',
        'pendingRelease',
        'pendingSettlement',
        'outstandingSettlement',
        'sysDraft'
      ];
      metrics.forEach((m) => {
        const val = (s as any)[m] ?? 0;
        bars.push({
          label: `${sectionName} - ${m}`,
          value: typeof val === 'number' ? val : 0,
          color: metricColors[m]
        });
      });
    });
    return bars;
  }

  // Build donut cards per movement with center label
  private mapInterestSummaryToDonuts(dto: InterestSummaryUpToTodayDto): DashboardCard[] {
    const metricColors: Record<string, string> = {
      pending: '#7C2D12',
      query: '#D1D5DB',
      authorised: '#FCA5A5',
      pendingRelease: '#DC2626',
      pendingSettlement: '#7C2D12',
      outstandingSettlement: '#9CA3AF',
      sysDraft: '#F3F4F6'
    };

    const metricKeys = ['pending','query','authorised','pendingRelease','pendingSettlement','outstandingSettlement','sysDraft'] as const;
    const dir = this.sortConfig.order === 'desc' ? -1 : 1;
    const getVal = (x: any) => this.sortConfig.by === 'total'
      ? metricKeys.reduce((acc, k) => acc + Number(x?.[k] ?? 0), 0)
      : Number(x?.[this.sortConfig.by] ?? 0);

    const entries = Object.entries(dto).sort(([, a], [, b]) => {
      const va = getVal(a);
      const vb = getVal(b);
      return (va - vb) * dir;
    });

    return entries.map(([sectionName, s]) => {
      const data: ChartData[] = metricKeys.map((m) => ({
        label: m,
        value: Number((s as any)?.[m] ?? 0),
        color: metricColors[m]
      }));
      return {
        title: `Interest - ${sectionName}`,
        type: 'donut',
        centerLabel: sectionName,
        data
      } as DashboardCard;
    });
  }
}
