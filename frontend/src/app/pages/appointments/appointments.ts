import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { ApiService, Appointment, Barber, Service, Client } from '../../services/api';
import { format, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatMenuModule,
    MatSnackBarModule,
    FormsModule
  ],
  templateUrl: './appointments.html',
  styleUrl: './appointments.css'
})
export class AppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  barbers: Barber[] = [];
  services: Service[] = [];
  clients: Client[] = [];
  
  selectedBarber: number | null = null;
  selectedDate: Date = new Date();
  
  displayedColumns: string[] = ['date', 'time', 'client', 'service', 'barber', 'status', 'actions'];

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.apiService.getBarbers().subscribe(barbers => {
      this.barbers = barbers;
      if (barbers.length > 0) {
        this.selectedBarber = barbers[0].id;
        this.loadAppointments();
      }
    });

    this.apiService.getServices().subscribe(services => {
      this.services = services;
    });

    this.apiService.getClients().subscribe(clients => {
      this.clients = clients;
    });
  }

  loadAppointments() {
    if (!this.selectedBarber) return;

    const startOfDayDate = startOfDay(this.selectedDate);
    const endOfDayDate = endOfDay(this.selectedDate);
    
    this.apiService.getAppointments(
      this.selectedBarber,
      startOfDayDate.toISOString(),
      endOfDayDate.toISOString()
    ).subscribe(appointments => {
      this.appointments = appointments;
    });
  }

  onBarberChange() {
    this.loadAppointments();
  }

  onDateChange() {
    this.loadAppointments();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'primary';
      case 'PENDING': return 'accent';
      case 'CANCELLED': return 'warn';
      default: return 'primary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'Confirmado';
      case 'PENDING': return 'Pendente';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  }

  formatDate(dateString: string): string {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  }

  formatTime(dateString: string): string {
    return format(new Date(dateString), 'HH:mm');
  }

  getServiceName(serviceId: number): string {
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.name : 'Serviço não encontrado';
  }

  getClientName(clientId: number): string {
    const client = this.clients.find(c => c.id === clientId);
    return client ? client.name : `Cliente #${clientId}`;
  }

  getBarberName(barberId: number): string {
    const barber = this.barbers.find(b => b.id === barberId);
    return barber ? barber.name : 'Barbeiro não encontrado';
  }

  cancelAppointment(appointment: Appointment) {
    if (confirm('Tem certeza que deseja cancelar esta marcação?')) {
      this.apiService.cancelAppointment(appointment.id).subscribe({
        next: () => {
          this.snackBar.open('Marcação cancelada com sucesso', 'Fechar', { duration: 3000 });
          this.loadAppointments();
        },
        error: (error) => {
          console.error('Erro ao cancelar marcação:', error);
          this.snackBar.open('Erro ao cancelar marcação', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  editAppointment(appointment: Appointment) {
    // TODO: Implementar edição de marcação
    this.snackBar.open('Funcionalidade de edição em desenvolvimento', 'Fechar', { duration: 3000 });
  }
}