import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { ApiService, DashboardStats } from '../../services/api';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatListModule, MatChipsModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  // Estatísticas
  stats: DashboardStats | null = null;
  
  // Loading state
  isLoading = true;

  // Dados dos gráficos
  appointmentsChartData: any = null;
  servicesChartData: any = null;

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    
    // Uma única chamada à API!
    this.apiService.getDashboardStatistics().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.updateCharts(stats);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar estatísticas:', err);
        this.isLoading = false;
      }
    });
  }

  updateCharts(stats: DashboardStats) {
    // Gráfico de marcações por dia da semana
    this.appointmentsChartData = {
      labels: stats.weekStats.map(s => s.day),
      datasets: [{
        label: 'Marcações',
        data: stats.weekStats.map(s => s.appointments),
        borderColor: '#C3FF5A',
        backgroundColor: 'rgba(195, 255, 90, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };

    // Gráfico de serviços mais populares
    if (stats.popularServices.length > 0) {
      this.servicesChartData = {
        labels: stats.popularServices.map(s => s.serviceName),
        datasets: [{
          data: stats.popularServices.map(s => s.count),
          backgroundColor: [
            '#C3FF5A', 
            '#4CAF50', 
            '#2196F3', 
            '#FF9800', 
            '#9C27B0', 
            '#F44336',
            '#00BCD4',
            '#FFC107'
          ]
        }]
      };
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'primary';
      case 'PENDING': return 'accent';
      case 'CANCELLED': return 'warn';
      case 'COMPLETED': return 'primary';
      default: return 'primary';
    }
  }

  getRecentAppointments() {
    return this.stats?.recentAppointments || [];
  }
  
  get todayAppointments(): number {
    return this.stats?.todayAppointments || 0;
  }
  
  get totalCustomers(): number {
    return this.stats?.totalClients || 0;
  }
  
  get monthlyRevenue(): number {
    return this.stats?.monthlyRevenue || 0;
  }
  
  get activeServices(): number {
    return this.stats?.activeServices || 0;
  }
}