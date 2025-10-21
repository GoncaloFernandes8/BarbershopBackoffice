import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { ApiService, Appointment, Barber, Service, Client } from '../../services/api';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  // Dados reais
  todayAppointments = 0;
  totalCustomers = 0;
  monthlyRevenue = 0;
  pendingServices = 0;
  
  appointments: Appointment[] = [];
  barbers: Barber[] = [];
  services: Service[] = [];
  clients: Client[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadBarbers();
    this.loadServices();
    this.loadClients();
    this.loadAppointments();
  }

  loadBarbers() {
    this.apiService.getBarbers().subscribe(barbers => {
      this.barbers = barbers;
    });
  }

  loadServices() {
    this.apiService.getServices().subscribe(services => {
      this.services = services;
      this.pendingServices = services.filter(s => !s.active).length;
    });
  }

  loadClients() {
    this.apiService.getClients().subscribe(clients => {
      this.clients = clients;
      this.totalCustomers = clients.length;
    });
  }

  loadAppointments() {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    
    // Carregar marcações de todos os barbeiros para hoje
    this.barbers.forEach(barber => {
      this.apiService.getAppointments(
        barber.id,
        startOfToday.toISOString(),
        endOfToday.toISOString()
      ).subscribe(appointments => {
        this.appointments = [...this.appointments, ...appointments];
        this.updateDashboardData();
      });
    });
  }

  updateDashboardData() {
    const today = new Date();
    this.todayAppointments = this.appointments.filter(appointment => 
      isSameDay(new Date(appointment.startsAt), today)
    ).length;

    // Calcular receita mensal (assumindo que cada serviço tem preço)
    this.monthlyRevenue = this.appointments.reduce((total, appointment) => {
      const service = this.services.find(s => s.id === appointment.serviceId);
      return total + (service?.priceCents || 0);
    }, 0) / 100; // Converter de cêntimos para euros

    this.updateCharts();
  }

  updateCharts() {
    // Atualizar dados dos gráficos com dados reais
    const weekDays = eachDayOfInterval({
      start: startOfWeek(new Date()),
      end: endOfWeek(new Date())
    });

    const appointmentsByDay = weekDays.map(day => {
      return this.appointments.filter(appointment => 
        isSameDay(new Date(appointment.startsAt), day)
      ).length;
    });

    this.appointmentsChartData = {
      labels: weekDays.map(day => format(day, 'EEE', { locale: ptBR })),
      datasets: [{
        label: 'Marcações',
        data: appointmentsByDay,
        borderColor: '#C3FF5A',
        backgroundColor: 'rgba(195, 255, 90, 0.1)',
        tension: 0.4
      }]
    };

    // Atualizar gráfico de serviços
    const serviceCounts = this.services.map(service => {
      return this.appointments.filter(appointment => 
        appointment.serviceId === service.id
      ).length;
    });

    this.servicesChartData = {
      labels: this.services.map(s => s.name),
      datasets: [{
        data: serviceCounts,
        backgroundColor: ['#C3FF5A', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336']
      }]
    };
  }

  appointmentsChartData = {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [{
      label: 'Marcações',
      data: [12, 19, 3, 5, 2, 3, 8],
      borderColor: '#C3FF5A',
      backgroundColor: 'rgba(195, 255, 90, 0.1)',
      tension: 0.4
    }]
  };

  servicesChartData = {
    labels: ['Corte', 'Barba', 'Corte + Barba', 'Criança'],
    datasets: [{
      data: [40, 30, 20, 10],
      backgroundColor: ['#C3FF5A', '#4CAF50', '#2196F3', '#FF9800']
    }]
  };

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  recentAppointments = [
    {
      customerName: 'João Silva',
      serviceName: 'Corte + Barba',
      time: '14:30',
      status: 'CONFIRMED'
    },
    {
      customerName: 'Maria Santos',
      serviceName: 'Corte',
      time: '15:00',
      status: 'PENDING'
    },
    {
      customerName: 'Pedro Costa',
      serviceName: 'Barba',
      time: '16:00',
      status: 'CONFIRMED'
    }
  ];

  getStatusColor(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'primary';
      case 'PENDING': return 'accent';
      case 'CANCELLED': return 'warn';
      default: return 'primary';
    }
  }

  getRecentAppointments() {
    const today = new Date();
    return this.appointments
      .filter(appointment => isSameDay(new Date(appointment.startsAt), today))
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
      .slice(0, 3)
      .map(appointment => {
        const client = this.clients.find(c => c.id === appointment.clientId);
        const service = this.services.find(s => s.id === appointment.serviceId);
        return {
          customerName: client?.name || `Cliente #${appointment.clientId}`,
          serviceName: service?.name || 'Serviço não encontrado',
          time: format(new Date(appointment.startsAt), 'HH:mm'),
          status: appointment.status
        };
      });
  }
}