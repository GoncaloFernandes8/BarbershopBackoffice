import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { ApiService, Appointment, Barber, Service, Client } from '../../services/api';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { forkJoin } from 'rxjs';

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
  todayAppointments = 0;
  totalCustomers = 0;
  monthlyRevenue = 0;
  pendingServices = 0;
  
  // Dados
  appointments: Appointment[] = [];
  barbers: Barber[] = [];
  services: Service[] = [];
  clients: Client[] = [];
  
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
    
    // Carregar todos os dados em paralelo
    forkJoin({
      barbers: this.apiService.getBarbers(),
      services: this.apiService.getServices(),
      clients: this.apiService.getClients()
    }).subscribe({
      next: (results) => {
        this.barbers = results.barbers.filter(b => b.active);
        this.services = results.services;
        this.clients = results.clients;
        
        // Calcular estatísticas básicas
        this.totalCustomers = this.clients.length;
        this.pendingServices = this.services.filter(s => !s.active).length;
        
        // Carregar marcações depois de ter os barbeiros
        this.loadAppointments();
      },
      error: (err) => {
        console.error('Erro ao carregar dados:', err);
        this.isLoading = false;
      }
    });
  }

  loadAppointments() {
    if (this.barbers.length === 0) {
      this.isLoading = false;
      return;
    }

    const today = new Date();
    const startOfMonthDate = startOfMonth(today);
    const endOfMonthDate = endOfMonth(today);
    
    // Carregar marcações do mês inteiro para todos os barbeiros
    const appointmentRequests = this.barbers.map(barber =>
      this.apiService.getAppointments(
        barber.id,
        startOfMonthDate.toISOString(),
        endOfMonthDate.toISOString()
      )
    );
    
    forkJoin(appointmentRequests).subscribe({
      next: (results) => {
        // Concatenar todas as marcações
        this.appointments = results.flat();
        this.updateDashboardData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar marcações:', err);
        this.isLoading = false;
      }
    });
  }

  updateDashboardData() {
    const today = new Date();
    
    // Marcações de hoje
    this.todayAppointments = this.appointments.filter(appointment => 
      isSameDay(new Date(appointment.startsAt), today) && 
      appointment.status !== 'CANCELLED'
    ).length;

    // Receita mensal (apenas marcações completadas ou confirmadas)
    this.monthlyRevenue = this.appointments
      .filter(appointment => 
        appointment.status === 'CONFIRMED' || appointment.status === 'COMPLETED'
      )
      .reduce((total, appointment) => {
        const service = this.services.find(s => s.id === appointment.serviceId);
        return total + (service?.priceCents || 0);
      }, 0) / 100; // Converter de cêntimos para euros

    this.updateCharts();
  }

  updateCharts() {
    // Gráfico de marcações por dia da semana
    const weekDays = eachDayOfInterval({
      start: startOfWeek(new Date(), { weekStartsOn: 1 }), // Segunda-feira
      end: endOfWeek(new Date(), { weekStartsOn: 1 })
    });

    const appointmentsByDay = weekDays.map(day => {
      return this.appointments.filter(appointment => 
        isSameDay(new Date(appointment.startsAt), day) &&
        appointment.status !== 'CANCELLED'
      ).length;
    });

    this.appointmentsChartData = {
      labels: weekDays.map(day => format(day, 'EEEEEE', { locale: ptBR })), // Seg, Ter, etc
      datasets: [{
        label: 'Marcações',
        data: appointmentsByDay,
        borderColor: '#C3FF5A',
        backgroundColor: 'rgba(195, 255, 90, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };

    // Gráfico de serviços mais populares
    const serviceCounts = this.services
      .filter(s => s.active)
      .map(service => ({
        name: service.name,
        count: this.appointments.filter(appointment => 
          appointment.serviceId === service.id &&
          appointment.status !== 'CANCELLED'
        ).length
      }))
      .filter(s => s.count > 0) // Apenas serviços com marcações
      .sort((a, b) => b.count - a.count); // Ordenar por popularidade

    this.servicesChartData = {
      labels: serviceCounts.map(s => s.name),
      datasets: [{
        data: serviceCounts.map(s => s.count),
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
    if (this.isLoading || this.appointments.length === 0) {
      return [];
    }

    const today = new Date();
    return this.appointments
      .filter(appointment => 
        isSameDay(new Date(appointment.startsAt), today) &&
        appointment.status !== 'CANCELLED'
      )
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
      .slice(0, 5) // Aumentar para 5 marcações
      .map(appointment => {
        const client = this.clients.find(c => c.id === appointment.clientId);
        const service = this.services.find(s => s.id === appointment.serviceId);
        return {
          customerName: client?.name || `Cliente #${appointment.clientId}`,
          serviceName: service?.name || 'Serviço',
          time: format(new Date(appointment.startsAt), 'HH:mm'),
          status: appointment.status
        };
      });
  }
}