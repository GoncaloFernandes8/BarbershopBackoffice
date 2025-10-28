import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { ApiService, Service } from '../../services/api';

@Component({
  selector: 'app-services',
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
    MatCheckboxModule,
    ReactiveFormsModule
  ],
  templateUrl: './services.html',
  styleUrl: './services.css'
})
export class ServicesComponent implements OnInit {
  services: Service[] = [];
  displayedColumns: string[] = ['name', 'duration', 'price', 'active', 'actions'];

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.apiService.getServices().subscribe(services => {
      this.services = services;
    });
  }

  formatPrice(priceCents: number | null): string {
    if (!priceCents) return 'Preço sob consulta';
    return `€${(priceCents / 100).toFixed(2)}`;
  }

  formatDuration(durationMin: number): string {
    const hours = Math.floor(durationMin / 60);
    const minutes = durationMin % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    }
    return `${minutes}min`;
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateServiceDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadServices();
      }
    });
  }

  openEditDialog(service: Service) {
    const dialogRef = this.dialog.open(EditServiceDialogComponent, {
      width: '500px',
      data: service
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadServices();
      }
    });
  }

  toggleActiveService(service: Service) {
    const action = service.active ? 'desativar' : 'ativar';
    if (confirm(`Tem certeza que deseja ${action} o serviço "${service.name}"?`)) {
      if (service.active) {
        // Desativar (soft delete)
        this.apiService.deleteService(service.id).subscribe({
          next: () => {
            this.snackBar.open('Serviço desativado com sucesso', 'Fechar', { duration: 3000 });
            this.loadServices();
          },
          error: (error) => {
            console.error('Erro ao desativar serviço:', error);
            this.snackBar.open('Erro ao desativar serviço', 'Fechar', { duration: 3000 });
          }
        });
      } else {
        // Reativar (atualizar active = true)
        this.apiService.updateService(service.id, { 
          name: service.name,
          durationMin: service.durationMin,
          bufferAfterMin: service.bufferAfterMin,
          priceCents: service.priceCents,
          active: true 
        }).subscribe({
          next: () => {
            this.snackBar.open('Serviço reativado com sucesso', 'Fechar', { duration: 3000 });
            this.loadServices();
          },
          error: (error) => {
            console.error('Erro ao reativar serviço:', error);
            this.snackBar.open('Erro ao reativar serviço', 'Fechar', { duration: 3000 });
          }
        });
      }
    }
  }

  permanentlyDeleteService(service: Service) {
    if (confirm(`⚠️ ATENÇÃO: Tem certeza que deseja ELIMINAR PERMANENTEMENTE o serviço "${service.name}"?\n\nEsta ação NÃO pode ser desfeita!`)) {
      this.apiService.permanentlyDeleteService(service.id).subscribe({
        next: () => {
          this.snackBar.open('Serviço eliminado permanentemente', 'Fechar', { duration: 3000 });
          this.loadServices();
        },
        error: (error) => {
          console.error('Erro ao eliminar serviço:', error);
          this.snackBar.open('Erro ao eliminar serviço', 'Fechar', { duration: 3000 });
        }
      });
    }
  }
}

@Component({
  selector: 'app-create-service-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Novo Serviço</h2>
      <button mat-icon-button (click)="onCancel()">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="serviceForm" (ngSubmit)="onSubmit()">
      <div mat-dialog-content class="dialog-content">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome do Serviço</mat-label>
          <input matInput formControlName="name" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Duração (minutos)</mat-label>
          <input matInput type="number" formControlName="durationMin" required min="1">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Buffer após serviço (minutos)</mat-label>
          <input matInput type="number" formControlName="bufferAfterMin" min="0">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Preço (cêntimos)</mat-label>
          <input matInput type="number" formControlName="priceCents" min="0">
        </mat-form-field>

        <mat-checkbox formControlName="active">
          Ativo
        </mat-checkbox>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="serviceForm.invalid || loading">
          {{ loading ? 'Criando...' : 'Criar Serviço' }}
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
    .dialog-actions {
      padding: 16px 24px;
      justify-content: flex-end;
      gap: 8px;
    }
  `]
})
export class CreateServiceDialogComponent {
  serviceForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<CreateServiceDialogComponent>,
    private snackBar: MatSnackBar
  ) {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      durationMin: ['', [Validators.required, Validators.min(1)]],
      bufferAfterMin: [0, [Validators.min(0)]],
      priceCents: [null, [Validators.min(0)]],
      active: [true]
    });
  }

  onSubmit() {
    if (this.serviceForm.valid) {
      this.loading = true;
      
      const serviceData = this.serviceForm.value;

      this.apiService.createService(serviceData).subscribe({
        next: (service) => {
          this.loading = false;
          this.snackBar.open('Serviço criado com sucesso', 'Fechar', { duration: 3000 });
          this.dialogRef.close(service);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erro ao criar serviço:', error);
          this.snackBar.open('Erro ao criar serviço', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-edit-service-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Editar Serviço</h2>
      <button mat-icon-button (click)="onCancel()">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="serviceForm" (ngSubmit)="onSubmit()">
      <div mat-dialog-content class="dialog-content">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome do Serviço</mat-label>
          <input matInput formControlName="name" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Duração (minutos)</mat-label>
          <input matInput type="number" formControlName="durationMin" required min="1">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Buffer após serviço (minutos)</mat-label>
          <input matInput type="number" formControlName="bufferAfterMin" min="0">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Preço (cêntimos)</mat-label>
          <input matInput type="number" formControlName="priceCents" min="0">
        </mat-form-field>

        <mat-checkbox formControlName="active">
          Ativo
        </mat-checkbox>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="serviceForm.invalid || loading">
          {{ loading ? 'Salvando...' : 'Salvar' }}
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
    .dialog-actions {
      padding: 16px 24px;
      justify-content: flex-end;
      gap: 8px;
    }
  `]
})
export class EditServiceDialogComponent {
  serviceForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<EditServiceDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Service
  ) {
    this.serviceForm = this.fb.group({
      name: [data.name, Validators.required],
      durationMin: [data.durationMin, [Validators.required, Validators.min(1)]],
      bufferAfterMin: [data.bufferAfterMin, [Validators.min(0)]],
      priceCents: [data.priceCents, [Validators.min(0)]],
      active: [data.active]
    });
  }

  onSubmit() {
    if (this.serviceForm.valid) {
      this.loading = true;
      
      const serviceData = this.serviceForm.value;

      this.apiService.updateService(this.data.id, serviceData).subscribe({
        next: (service) => {
          this.loading = false;
          this.snackBar.open('Serviço atualizado com sucesso', 'Fechar', { duration: 3000 });
          this.dialogRef.close(service);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erro ao atualizar serviço:', error);
          this.snackBar.open('Erro ao atualizar serviço', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}