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
    ReactiveFormsModule,
    MatChipsModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>✂️ Adicionar Horário de Trabalho</h2>
      <button mat-icon-button (click)="onCancel()">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="workingHoursForm" (ngSubmit)="onSubmit()">
      <div mat-dialog-content class="dialog-content">
        <!-- Dia da Semana -->
        <div class="form-section">
          <label class="section-label">📅 Dia da Semana</label>
          <mat-form-field appearance="outline" class="full-width">
            <mat-select formControlName="dayOfWeek" required placeholder="Escolher dia">
              <mat-option [value]="1">Segunda-feira</mat-option>
              <mat-option [value]="2">Terça-feira</mat-option>
              <mat-option [value]="3">Quarta-feira</mat-option>
              <mat-option [value]="4">Quinta-feira</mat-option>
              <mat-option [value]="5">Sexta-feira</mat-option>
              <mat-option [value]="6">Sábado</mat-option>
              <mat-option [value]="7">Domingo</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Horários Sugeridos -->
        <div class="form-section">
          <label class="section-label">⚡ Horários Comuns (Clica para preencher)</label>
          <div class="quick-hours">
            <mat-chip-option (click)="setQuickHours('09:00', '18:00')">
              09:00 - 18:00
            </mat-chip-option>
            <mat-chip-option (click)="setQuickHours('10:00', '19:00')">
              10:00 - 19:00
            </mat-chip-option>
            <mat-chip-option (click)="setQuickHours('09:00', '13:00')">
              09:00 - 13:00
            </mat-chip-option>
            <mat-chip-option (click)="setQuickHours('14:00', '20:00')">
              14:00 - 20:00
            </mat-chip-option>
          </div>
        </div>

        <!-- Horário Manual -->
        <div class="form-section">
          <label class="section-label">🕐 Ou Defina Manualmente (Formato 24h)</label>
          <div class="time-inputs">
            <mat-form-field appearance="outline" class="time-field">
              <mat-label>Início</mat-label>
              <input matInput 
                     type="time" 
                     formControlName="startTime" 
                     required
                     placeholder="09:00">
              <mat-hint>Ex: 09:00</mat-hint>
            </mat-form-field>

            <span class="time-separator">até</span>

            <mat-form-field appearance="outline" class="time-field">
              <mat-label>Fim</mat-label>
              <input matInput 
                     type="time" 
                     formControlName="endTime" 
                     required
                     placeholder="18:00">
              <mat-hint>Ex: 18:00</mat-hint>
            </mat-form-field>
          </div>
        </div>

        <!-- Preview -->
        <div class="preview-section" *ngIf="workingHoursForm.valid">
          <div class="preview-card">
            <mat-icon>info</mat-icon>
            <div class="preview-text">
              <strong>{{ getDayPreview() }}</strong> das <strong>{{ workingHoursForm.value.startTime }}</strong> às <strong>{{ workingHoursForm.value.endTime }}</strong>
            </div>
          </div>
        </div>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button type="button" (click)="onCancel()">Cancelar</button>
        <button mat-raised-button 
                color="primary" 
                type="submit" 
                [disabled]="workingHoursForm.invalid || loading">
          <mat-icon>{{ loading ? 'hourglass_empty' : 'check' }}</mat-icon>
          {{ loading ? 'A guardar...' : 'Guardar Horário' }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .dialog-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .dialog-content {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      min-width: 500px;
    }
    
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .section-label {
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--color-text);
      margin-bottom: 4px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .quick-hours {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    mat-chip-option {
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    mat-chip-option:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    
    .time-inputs {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 16px;
      align-items: center;
    }
    
    .time-field {
      width: 100%;
    }
    
    .time-separator {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      font-weight: 500;
      text-align: center;
      padding-top: 8px;
    }
    
    .preview-section {
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 12px;
      padding: 16px;
      animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .preview-card {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .preview-card mat-icon {
      color: var(--color-primary);
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    .preview-text {
      color: var(--color-text);
      font-size: 0.95rem;
      line-height: 1.5;
    }
    
    .preview-text strong {
      color: var(--color-primary);
    }
    
    .dialog-actions {
      padding: 16px 24px;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .dialog-actions button {
      min-width: 120px;
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

  setQuickHours(start: string, end: string) {
    this.workingHoursForm.patchValue({
      startTime: start,
      endTime: end
    });
  }

  getDayPreview(): string {
    const dayOfWeek = this.workingHoursForm.value.dayOfWeek;
    const days = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
    return days[dayOfWeek - 1] || '';
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
    ReactiveFormsModule,
    MatChipsModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>🏖️ Registar Folga ou Férias</h2>
      <button mat-icon-button (click)="onCancel()">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="timeOffForm" (ngSubmit)="onSubmit()">
      <div mat-dialog-content class="dialog-content">
        <!-- Tipo de Folga Rápida -->
        <div class="form-section">
          <label class="section-label">⚡ Períodos Comuns</label>
          <div class="quick-periods">
            <mat-chip-option (click)="setToday()">
              Hoje (dia inteiro)
            </mat-chip-option>
            <mat-chip-option (click)="setTomorrow()">
              Amanhã
            </mat-chip-option>
            <mat-chip-option (click)="setWeekend()">
              Fim de semana
            </mat-chip-option>
            <mat-chip-option (click)="setNextWeek()">
              Próxima semana
            </mat-chip-option>
          </div>
        </div>

        <!-- Datas Manuais -->
        <div class="form-section">
          <label class="section-label">📅 Ou Defina Manualmente (Formato 24h)</label>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Data e Hora de Início</mat-label>
            <input matInput 
                   type="datetime-local" 
                   formControlName="startsAt" 
                   required>
            <mat-hint>Ex: 2025-10-25 09:00</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Data e Hora de Fim</mat-label>
            <input matInput 
                   type="datetime-local" 
                   formControlName="endsAt" 
                   required>
            <mat-hint>Ex: 2025-10-25 18:00</mat-hint>
          </mat-form-field>
        </div>

        <!-- Motivo -->
        <div class="form-section">
          <label class="section-label">📝 Motivo (Opcional)</label>
          <mat-form-field appearance="outline" class="full-width">
            <textarea matInput 
                      formControlName="reason" 
                      rows="3"
                      placeholder="Ex: Férias, médico, assunto pessoal..."></textarea>
          </mat-form-field>
        </div>

        <!-- Preview -->
        <div class="preview-section" *ngIf="timeOffForm.valid">
          <div class="preview-card">
            <mat-icon>info</mat-icon>
            <div class="preview-text">
              De <strong>{{ formatPreviewDate(timeOffForm.value.startsAt) }}</strong><br>
              Até <strong>{{ formatPreviewDate(timeOffForm.value.endsAt) }}</strong>
              <span *ngIf="timeOffForm.value.reason"><br>Motivo: <strong>{{ timeOffForm.value.reason }}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button type="button" (click)="onCancel()">Cancelar</button>
        <button mat-raised-button 
                color="primary" 
                type="submit" 
                [disabled]="timeOffForm.invalid || loading">
          <mat-icon>{{ loading ? 'hourglass_empty' : 'check' }}</mat-icon>
          {{ loading ? 'A guardar...' : 'Guardar Folga' }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .dialog-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .dialog-content {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      min-width: 500px;
    }
    
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .section-label {
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--color-text);
      margin-bottom: 4px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .quick-periods {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    mat-chip-option {
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    mat-chip-option:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    
    .preview-section {
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 12px;
      padding: 16px;
      animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .preview-card {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    
    .preview-card mat-icon {
      color: var(--color-primary);
      font-size: 24px;
      width: 24px;
      height: 24px;
      margin-top: 2px;
    }
    
    .preview-text {
      color: var(--color-text);
      font-size: 0.95rem;
      line-height: 1.6;
    }
    
    .preview-text strong {
      color: var(--color-primary);
    }
    
    .dialog-actions {
      padding: 16px 24px;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .dialog-actions button {
      min-width: 120px;
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

  // Formato: YYYY-MM-DDTHH:mm (para datetime-local input)
  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  setToday() {
    const start = new Date();
    start.setHours(9, 0, 0, 0);
    const end = new Date();
    end.setHours(18, 0, 0, 0);
    
    this.timeOffForm.patchValue({
      startsAt: this.formatDateTimeLocal(start),
      endsAt: this.formatDateTimeLocal(end)
    });
  }

  setTomorrow() {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(9, 0, 0, 0);
    const end = new Date();
    end.setDate(end.getDate() + 1);
    end.setHours(18, 0, 0, 0);
    
    this.timeOffForm.patchValue({
      startsAt: this.formatDateTimeLocal(start),
      endsAt: this.formatDateTimeLocal(end)
    });
  }

  setWeekend() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Domingo, 6=Sábado
    
    // Próximo Sábado
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    const start = new Date(today);
    start.setDate(today.getDate() + daysUntilSaturday);
    start.setHours(9, 0, 0, 0);
    
    // Domingo
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    end.setHours(18, 0, 0, 0);
    
    this.timeOffForm.patchValue({
      startsAt: this.formatDateTimeLocal(start),
      endsAt: this.formatDateTimeLocal(end)
    });
  }

  setNextWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Próxima Segunda-feira
    const daysUntilMonday = (1 - dayOfWeek + 7) % 7 || 7;
    const start = new Date(today);
    start.setDate(today.getDate() + daysUntilMonday);
    start.setHours(9, 0, 0, 0);
    
    // Sexta-feira da mesma semana
    const end = new Date(start);
    end.setDate(start.getDate() + 4);
    end.setHours(18, 0, 0, 0);
    
    this.timeOffForm.patchValue({
      startsAt: this.formatDateTimeLocal(start),
      endsAt: this.formatDateTimeLocal(end)
    });
  }

  formatPreviewDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
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

