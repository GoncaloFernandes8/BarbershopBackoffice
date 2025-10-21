import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService, CreateAppointmentRequest, Client, Service, WorkingHours } from '../../../services/api';
import { format, addHours } from 'date-fns';

export interface CreateAppointmentDialogData {
  date: Date;
  barberId: number;
  services: Service[];
}

@Component({
  selector: 'app-create-appointment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Nova Marcação</h2>
      <button mat-icon-button (click)="onCancel()">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="appointmentForm" (ngSubmit)="onSubmit()">
      <div mat-dialog-content class="dialog-content">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Cliente</mat-label>
          <mat-select formControlName="clientId" required>
            <mat-option *ngFor="let client of clients" [value]="client.id">
              {{ client.name }} ({{ client.phone }})
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Serviço</mat-label>
          <mat-select formControlName="serviceId" required>
            <mat-option *ngFor="let service of data.services" [value]="service.id">
              {{ service.name }} - {{ formatPrice(service.priceCents) }} ({{ service.durationMin }}min)
            </mat-option>
          </mat-select>
        </mat-form-field>

        <div class="datetime-container">
          <mat-form-field appearance="outline" class="date-field">
            <mat-label>Data</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="date" required>
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="time-field">
            <mat-label>Hora</mat-label>
            <input matInput type="time" formControlName="time" required>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observações</mat-label>
          <textarea matInput formControlName="notes" rows="3"></textarea>
        </mat-form-field>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="appointmentForm.invalid || loading">
          <mat-icon *ngIf="loading">refresh</mat-icon>
          {{ loading ? 'Criando...' : 'Criar Marcação' }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px 0;
    }

    .dialog-content {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .datetime-container {
      display: flex;
      gap: 16px;
    }

    .date-field {
      flex: 2;
    }

    .time-field {
      flex: 1;
    }

    @media (max-width: 480px) {
      .datetime-container {
        flex-direction: column;
        gap: 8px;
      }
      
      .date-field,
      .time-field {
        flex: 1;
      }
    }

    .dialog-actions {
      padding: 16px 24px;
      justify-content: flex-end;
      gap: 8px;
    }

    mat-icon[matSuffix] {
      cursor: pointer;
    }
  `]
})
export class CreateAppointmentDialogComponent implements OnInit {
  appointmentForm: FormGroup;
  clients: Client[] = [];
  workingHours: WorkingHours[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<CreateAppointmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreateAppointmentDialogData
  ) {
    // Verificar se a data é válida
    const isValidDate = data.date && !isNaN(data.date.getTime());
    
    // Formatar a data para o formato esperado pelo input date
    const dateStr = isValidDate ? format(data.date, 'yyyy-MM-dd') : '';
    const timeStr = isValidDate ? format(data.date, 'HH:mm') : '09:00';
    
    this.appointmentForm = this.fb.group({
      clientId: ['', Validators.required],
      serviceId: ['', Validators.required],
      date: [dateStr, Validators.required],
      time: [timeStr, Validators.required],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadClients();
    this.loadWorkingHours();
  }

  loadClients() {
    this.apiService.getClients().subscribe(clients => {
      this.clients = clients;
    });
  }

  loadWorkingHours() {
    this.apiService.getWorkingHours(this.data.barberId).subscribe(workingHours => {
      this.workingHours = workingHours;
    });
  }

  onSubmit() {
    if (this.appointmentForm.valid) {
      this.loading = true;
      
      const formValue = this.appointmentForm.value;
      const selectedService = this.data.services.find(s => s.id === formValue.serviceId);
      
      if (!selectedService) {
        this.loading = false;
        return;
      }

      // Combinar data e hora
      const dateTimeStr = `${formValue.date}T${formValue.time}:00`;
      const startsAt = new Date(dateTimeStr);
      
      // Verificar se a data é válida
      if (isNaN(startsAt.getTime())) {
        alert('Data ou hora inválida. Verifique os valores inseridos.');
        this.loading = false;
        return;
      }
      
      const endsAt = addHours(startsAt, selectedService.durationMin / 60);

      // Validar se está dentro do horário de funcionamento
      if (!this.isWithinWorkingHours(startsAt)) {
        alert('A marcação deve ser feita dentro do horário de funcionamento do barbeiro.');
        this.loading = false;
        return;
      }

      const appointmentData: CreateAppointmentRequest = {
        barberId: this.data.barberId,
        serviceId: formValue.serviceId,
        clientId: formValue.clientId,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        notes: formValue.notes
      };

      this.apiService.createAppointment(appointmentData).subscribe({
        next: (appointment) => {
          this.loading = false;
          this.dialogRef.close(appointment);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erro ao criar marcação:', error);
          alert('Erro ao criar marcação. Tente novamente.');
        }
      });
    }
  }

  isWithinWorkingHours(date: Date): boolean {
    // Verificar se a data é válida
    if (!date || isNaN(date.getTime())) {
      return false;
    }

    const dayOfWeek = date.getDay();
    const timeStr = format(date, 'HH:mm');
    
    // Encontrar as working hours para o dia da semana
    const dayWorkingHours = this.workingHours.find(wh => wh.dayOfWeek === dayOfWeek);
    
    if (!dayWorkingHours) {
      return false; // Não há horário de funcionamento para este dia
    }
    
    // Verificar se o horário está dentro do intervalo
    return timeStr >= dayWorkingHours.startTime && timeStr <= dayWorkingHours.endTime;
  }

  onCancel() {
    this.dialogRef.close();
  }

  formatPrice(priceCents: number | null): string {
    if (!priceCents) return 'Preço sob consulta';
    return `€${(priceCents / 100).toFixed(2)}`;
  }
}
