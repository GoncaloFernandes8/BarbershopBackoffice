import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ApiService, Appointment, Barber, Service } from '../../services/api';
import { CreateAppointmentDialogComponent } from './create-appointment-dialog/create-appointment-dialog.component';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatDialogModule
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  selectedDate: Date | null = null;
  selectedBarber: number | null | string = null;
  
  barbers: Barber[] = [];
  services: Service[] = [];
  appointments: Appointment[] = [];
  
  calendarDays: Date[] = [];
  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadData();
    this.generateCalendar();
  }

  loadData() {
    this.apiService.getBarbers().subscribe(barbers => {
      this.barbers = barbers;
      // Definir "Todos os barbeiros" como padrão
      this.selectedBarber = 'all';
      this.loadAppointments();
    });

    this.apiService.getServices().subscribe(services => {
      this.services = services;
    });
  }

  loadAppointments() {
    console.log('loadAppointments called with selectedBarber:', this.selectedBarber);
    
    if (!this.selectedBarber || this.selectedBarber === '') {
      console.log('No barber selected, returning');
      return;
    }

    const startOfMonthDate = startOfMonth(this.currentDate);
    const endOfMonthDate = endOfMonth(this.currentDate);
    
    console.log('Date range:', startOfMonthDate.toISOString(), 'to', endOfMonthDate.toISOString());
    
    // Se "Todos os barbeiros" está selecionado, carregar appointments de todos os barbeiros
    if (this.selectedBarber === 'all') {
      console.log('Loading appointments for all barbers');
      this.loadAllBarbersAppointments(startOfMonthDate, endOfMonthDate);
    } else {
      console.log('Loading appointments for specific barber:', this.selectedBarber);
      this.apiService.getAppointments(
        this.selectedBarber as number,
        startOfMonthDate.toISOString(),
        endOfMonthDate.toISOString()
      ).subscribe({
        next: (appointments) => {
          console.log('Appointments loaded for specific barber:', appointments.length);
          this.appointments = appointments;
        },
        error: (error) => {
          console.error('Error loading appointments for specific barber:', error);
        }
      });
    }
  }

  loadAllBarbersAppointments(startDate: Date, endDate: Date) {
    // Carregar appointments de todos os barbeiros
    const allAppointments: Appointment[] = [];
    let completedRequests = 0;
    
    console.log('Loading appointments for all barbers:', this.barbers.length, 'barbers');
    
    if (this.barbers.length === 0) {
      console.log('No barbers available');
      this.appointments = [];
      return;
    }

    this.barbers.forEach(barber => {
      console.log('Loading appointments for barber:', barber.name, barber.id);
      this.apiService.getAppointments(
        barber.id,
        startDate.toISOString(),
        endDate.toISOString()
      ).subscribe({
        next: (appointments) => {
          console.log(`Appointments for ${barber.name}:`, appointments.length);
          allAppointments.push(...appointments);
          completedRequests++;
          
          // Quando todas as requisições terminarem, atualizar a lista
          if (completedRequests === this.barbers.length) {
            console.log('All appointments loaded:', allAppointments.length);
            this.appointments = allAppointments;
          }
        },
        error: (error) => {
          console.error(`Error loading appointments for ${barber.name}:`, error);
          completedRequests++;
          
          // Mesmo com erro, continuar o processo
          if (completedRequests === this.barbers.length) {
            console.log('All requests completed (with some errors):', allAppointments.length);
            this.appointments = allAppointments;
          }
        }
      });
    });
  }

  generateCalendar() {
    const startOfMonthDate = startOfMonth(this.currentDate);
    const endOfMonthDate = endOfMonth(this.currentDate);
    
    // Encontrar o primeiro domingo da semana que contém o primeiro dia do mês
    const firstDayOfWeek = startOfMonthDate.getDay(); // 0 = domingo, 1 = segunda, etc.
    const startOfCalendar = new Date(startOfMonthDate);
    startOfCalendar.setDate(startOfMonthDate.getDate() - firstDayOfWeek);
    
    // Encontrar o último sábado da semana que contém o último dia do mês
    const lastDayOfWeek = endOfMonthDate.getDay(); // 0 = domingo, 1 = segunda, etc.
    const endOfCalendar = new Date(endOfMonthDate);
    endOfCalendar.setDate(endOfMonthDate.getDate() + (6 - lastDayOfWeek));
    
    this.calendarDays = eachDayOfInterval({
      start: startOfCalendar,
      end: endOfCalendar
    });
  }

  onBarberChange() {
    this.loadAppointments();
  }

  onDateClick(date: Date) {
    this.selectedDate = date;
  }

  onPreviousMonth() {
    this.currentDate = subMonths(this.currentDate, 1);
    this.generateCalendar();
    this.loadAppointments();
  }

  onNextMonth() {
    this.currentDate = addMonths(this.currentDate, 1);
    this.generateCalendar();
    this.loadAppointments();
  }

  onCreateAppointment() {
    if (!this.selectedDate) {
      alert('Selecione uma data primeiro');
      return;
    }

    const dialogRef = this.dialog.open(CreateAppointmentDialogComponent, {
      width: '500px',
      data: {
        date: this.selectedDate,
        barberId: this.selectedBarber,
        services: this.services
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAppointments();
      }
    });
  }

  getAppointmentsForDate(date: Date): Appointment[] {
    return this.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.startsAt);
      return isSameDay(appointmentDate, date);
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'primary';
      case 'PENDING': return 'accent';
      case 'CANCELLED': return 'warn';
      default: return 'primary';
    }
  }

  formatTime(dateString: string): string {
    return format(new Date(dateString), 'HH:mm');
  }

  getMonthYear(): string {
    return format(this.currentDate, 'MMMM yyyy', { locale: ptBR });
  }

  isToday(date: Date): boolean {
    return isSameDay(date, new Date());
  }

  isSelected(date: Date): boolean {
    return this.selectedDate ? isSameDay(date, this.selectedDate) : false;
  }

  getServiceName(serviceId: number): string {
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.name : 'Serviço não encontrado';
  }

  getClientName(clientId: number): string {
    // Como não temos uma lista de clientes carregada, vamos usar um placeholder
    return `Cliente #${clientId}`;
  }

  getBarberName(barberId: number): string {
    const barber = this.barbers.find(b => b.id === barberId);
    return barber ? barber.name : 'Barbeiro não encontrado';
  }

  isSameMonth(date1: Date, date2: Date): boolean {
    return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  }

  format(date: Date, formatStr: string): string {
    return format(date, formatStr);
  }
}
