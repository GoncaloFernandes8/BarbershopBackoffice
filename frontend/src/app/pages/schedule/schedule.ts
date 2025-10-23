import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ApiService, Barber, WorkingHours, TimeOff } from '../../services/api';
import { format, startOfMonth, endOfMonth } from 'date-fns';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatDialogModule,
    MatMenuModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './schedule.html',
  styleUrl: './schedule.css'
})
export class ScheduleComponent implements OnInit {
  barbers: Barber[] = [];
  selectedBarber: number | null = null;
  
  // Working Hours
  workingHours: WorkingHours[] = [];
  workingHoursColumns: string[] = ['dayOfWeek', 'startTime', 'endTime', 'actions'];
  
  // Time-off
  timeOffs: TimeOff[] = [];
  timeOffColumns: string[] = ['startsAt', 'endsAt', 'reason', 'actions'];
  selectedDate: Date = new Date();

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadBarbers();
  }

  loadBarbers() {
    this.apiService.getBarbers().subscribe(barbers => {
      this.barbers = barbers.filter(b => b.active);
      if (barbers.length > 0) {
        this.selectedBarber = barbers[0].id;
        this.loadWorkingHours();
        this.loadTimeOffs();
      }
    });
  }

  onBarberChange() {
    this.loadWorkingHours();
    this.loadTimeOffs();
  }

  loadWorkingHours() {
    if (!this.selectedBarber) return;
    
    this.apiService.getWorkingHours(this.selectedBarber).subscribe(hours => {
      this.workingHours = hours;
    });
  }

  loadTimeOffs() {
    if (!this.selectedBarber) return;
    
    const from = startOfMonth(this.selectedDate);
    const to = endOfMonth(this.selectedDate);
    
    this.apiService.getTimeOff(
      this.selectedBarber,
      from.toISOString(),
      to.toISOString()
    ).subscribe(timeOffs => {
      this.timeOffs = timeOffs;
    });
  }

  getDayName(dayOfWeek: number): string {
    // ISO-8601: Monday=1, Sunday=7 (same as Java DayOfWeek)
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    return days[dayOfWeek - 1] || 'N/A';
  }

  formatDateTime(dateString: string): string {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  }

  openCreateWorkingHoursDialog() {
    if (!this.selectedBarber) {
      this.snackBar.open('Selecione um barbeiro primeiro', 'Fechar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(CreateWorkingHoursDialogComponent, {
      width: '500px',
      data: { barberId: this.selectedBarber }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadWorkingHours();
      }
    });
  }

  openCreateTimeOffDialog() {
    if (!this.selectedBarber) {
      this.snackBar.open('Selecione um barbeiro primeiro', 'Fechar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(CreateTimeOffDialogComponent, {
      width: '500px',
      data: { barberId: this.selectedBarber }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTimeOffs();
      }
    });
  }

  deleteWorkingHours(id: number) {
    if (confirm('Tem certeza que deseja deletar este horário de trabalho?')) {
      this.apiService.deleteWorkingHours(id).subscribe({
        next: () => {
          this.snackBar.open('Horário deletado com sucesso', 'Fechar', { duration: 3000 });
          this.loadWorkingHours();
        },
        error: (error: any) => {
          console.error('Erro ao deletar horário:', error);
          this.snackBar.open('Erro ao deletar horário', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  deleteTimeOff(id: number) {
    if (confirm('Tem certeza que deseja deletar esta folga?')) {
      this.apiService.deleteTimeOff(id).subscribe({
        next: () => {
          this.snackBar.open('Folga deletada com sucesso', 'Fechar', { duration: 3000 });
          this.loadTimeOffs();
        },
        error: (error: any) => {
          console.error('Erro ao deletar folga:', error);
          this.snackBar.open('Erro ao deletar folga', 'Fechar', { duration: 3000 });
        }
      });
    }
  }
}

@Component({
  selector: 'app-create-working-hours-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Novo Horário de Trabalho</h2>
      <button mat-icon-button (click)="onCancel()">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="workingHoursForm" (ngSubmit)="onSubmit()">
      <div mat-dialog-content class="dialog-content">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Dia da Semana</mat-label>
          <mat-select formControlName="dayOfWeek" required>
            <mat-option [value]="1">Segunda-feira</mat-option>
            <mat-option [value]="2">Terça-feira</mat-option>
            <mat-option [value]="3">Quarta-feira</mat-option>
            <mat-option [value]="4">Quinta-feira</mat-option>
            <mat-option [value]="5">Sexta-feira</mat-option>
            <mat-option [value]="6">Sábado</mat-option>
            <mat-option [value]="7">Domingo</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Hora de Início</mat-label>
          <input matInput type="time" formControlName="startTime" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Hora de Fim</mat-label>
          <input matInput type="time" formControlName="endTime" required>
        </mat-form-field>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="workingHoursForm.invalid || loading">
          {{ loading ? 'Criando...' : 'Criar' }}
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
    .dialog-actions {
      padding: 16px 24px;
      justify-content: flex-end;
      gap: 8px;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class CreateWorkingHoursDialogComponent {
  workingHoursForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<CreateWorkingHoursDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { barberId: number }
  ) {
    this.workingHoursForm = this.fb.group({
      dayOfWeek: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.workingHoursForm.valid) {
      this.loading = true;
      const formValue = this.workingHoursForm.value;
      
      this.apiService.createWorkingHours({
        barberId: this.data.barberId,
        dayOfWeek: formValue.dayOfWeek,
        startTime: formValue.startTime,
        endTime: formValue.endTime
      }).subscribe({
        next: () => {
          this.snackBar.open('Horário criado com sucesso', 'Fechar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          this.loading = false;
          console.error('Erro ao criar horário:', error);
          this.snackBar.open('Erro ao criar horário', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-create-time-off-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Nova Folga</h2>
      <button mat-icon-button (click)="onCancel()">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="timeOffForm" (ngSubmit)="onSubmit()">
      <div mat-dialog-content class="dialog-content">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Data/Hora de Início</mat-label>
          <input matInput type="datetime-local" formControlName="startsAt" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Data/Hora de Fim</mat-label>
          <input matInput type="datetime-local" formControlName="endsAt" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Motivo</mat-label>
          <textarea matInput formControlName="reason" rows="3"></textarea>
        </mat-form-field>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="timeOffForm.invalid || loading">
          {{ loading ? 'Criando...' : 'Criar' }}
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
    .dialog-actions {
      padding: 16px 24px;
      justify-content: flex-end;
      gap: 8px;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class CreateTimeOffDialogComponent {
  timeOffForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<CreateTimeOffDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { barberId: number }
  ) {
    this.timeOffForm = this.fb.group({
      startsAt: ['', Validators.required],
      endsAt: ['', Validators.required],
      reason: ['']
    });
  }

  onSubmit() {
    if (this.timeOffForm.valid) {
      this.loading = true;
      const formValue = this.timeOffForm.value;
      
      this.apiService.createTimeOff({
        barberId: this.data.barberId,
        startsAt: new Date(formValue.startsAt).toISOString(),
        endsAt: new Date(formValue.endsAt).toISOString(),
        reason: formValue.reason || ''
      }).subscribe({
        next: () => {
          this.snackBar.open('Folga criada com sucesso', 'Fechar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          this.loading = false;
          console.error('Erro ao criar folga:', error);
          this.snackBar.open('Erro ao criar folga', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

