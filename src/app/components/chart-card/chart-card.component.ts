import { Component, Input, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  centerLabel?: string; // Optional text to render at the center (for donuts)
}

interface DonutSegment {
  color: string;
  dashArray: string;
  dashOffset: number;
}

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart-card.component.html',
  styleUrls: ['./chart-card.component.css']
})
export class ChartCardComponent implements OnInit {
  @Input() cardData!: DashboardCard;

  donutSegments: DonutSegment[] = [];
  private circumference = 2 * Math.PI * 70; // radius = 70

  // Constantes pour éviter les problèmes d'échappement
  readonly TODAYS_EVENTS_TITLE = "Today's Events";

  ngOnInit(): void {
    if (this.cardData.type === 'donut') {
      this.calculateDonutSegments();
    }
  }

  // Méthode helper pour vérifier si c'est la carte "Today's Events"
  isTodaysEventsCard(): boolean {
    return this.cardData.title === this.TODAYS_EVENTS_TITLE;
  }

  // Méthode helper pour vérifier si la carte a des alertes
  hasAlerts(): boolean {
    return !!(this.cardData.alerts && this.cardData.alerts.length > 0);
  }

  // Méthode helper pour vérifier si c'est une carte de type summary
  isSummaryCard(): boolean {
    return this.cardData.type === 'summary' && !!this.cardData.summary;
  }

  // Méthode helper pour vérifier si c'est une carte de type donut
  isDonutCard(): boolean {
    return this.cardData.type === 'donut';
  }

  // Méthode helper pour vérifier si c'est une carte de type bar
  isBarCard(): boolean {
    return this.cardData.type === 'bar';
  }

  // Méthode helper pour vérifier si c'est une carte de type status
  isStatusCard(): boolean {
    return this.cardData.type === 'status';
  }

  private calculateDonutSegments(): void {
    const total = this.getTotalValue();
    let cumulativePercentage = 0;

    this.donutSegments = this.cardData.data.map(item => {
      const percentage = (item.value / total) * 100;
      const dashArray = `${(percentage / 100) * this.circumference} ${this.circumference}`;
      const dashOffset = -cumulativePercentage * this.circumference / 100;

      cumulativePercentage += percentage;

      return {
        color: item.color,
        dashArray,
        dashOffset
      };
    });
  }

  getTotalValue(): number {
    return this.cardData.data.reduce((sum, item) => sum + item.value, 0);
  }

  getBarHeight(value: number): number {
    if (this.cardData.type !== 'bar') return 0;
    const maxValue = Math.max(...this.cardData.data.map(d => d.value));
    return maxValue > 0 ? (value / maxValue) * 120 : 0; // 120px max height
  }

  getMaxSummaryValue(): number {
    if (!this.cardData.summary) return 0;
    return Math.max(...this.cardData.summary.map(s => s.value));
  }

  getSummaryBarWidth(value: number): number {
    const maxValue = this.getMaxSummaryValue();
    return maxValue > 0 ? (value / maxValue) * 100 : 0;
  }
}
