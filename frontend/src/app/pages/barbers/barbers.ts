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
import { ApiService, Barber } from '../../services/api';

@Component({
  selector: 'app-barbers',
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
  templateUrl: './barbers.html',
  styleUrl: './barbers.css'
})
export class BarbersComponent implements OnInit {
  barbers: Barber[] = [];
  displayedColumns: string[] = ['name', 'active', 'createdAt', 'actions'];

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.loadBarbers();
  }

  loadBarbers() {
    this.apiService.getBarbers().subscribe(barbers => {
      this.barbers = barbers;
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateBarberDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBarbers();
      }
    });
  }

  openEditDialog(barber: Barber) {
    const dialogRef = this.dialog.open(EditBarberDialogComponent, {
      width: '400px',
      data: barber
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBarbers();
      }
    });
  }

  deleteBarber(barber: Barber) {
    if (confirm(`Tem certeza que deseja desativar o barbeiro "${barber.name}"?`)) {
      this.apiService.deleteBarber(barber.id).subscribe({
        next: () => {
          this.snackBar.open('Barbeiro desativado com sucesso', 'Fechar', { duration: 3000 });
          this.loadBarbers();
        },
        error: (error) => {
          console.error('Erro ao desativar barbeiro:', error);
          this.snackBar.open('Erro ao desativar barbeiro', 'Fechar', { duration: 3000 });
        }
      });
    }
  }
}

@Component({
  selector: 'app-create-barber-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Novo Barbeiro</h2>
      <button mat-icon-button (click)="onCancel()">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="barberForm" (ngSubmit)="onSubmit()">
      <div mat-dialog-content class="dialog-content">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="name" required>
        </mat-form-field>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="barberForm.invalid || loading">
          {{ loading ? 'Criando...' : 'Criar Barbeiro' }}
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
export class CreateBarberDialogComponent {
  barberForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<CreateBarberDialogComponent>,
    private snackBar: MatSnackBar
  ) {
    this.barberForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.barberForm.valid) {
      this.loading = true;
      
      const barberData = {
        name: this.barberForm.value.name
      };

      this.apiService.createBarber(barberData).subscribe({
        next: (barber) => {
          this.loading = false;
          this.snackBar.open('Barbeiro criado com sucesso', 'Fechar', { duration: 3000 });
          this.dialogRef.close(barber);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erro ao criar barbeiro:', error);
          this.snackBar.open('Erro ao criar barbeiro', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-edit-barber-dialog',
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
      <h2 mat-dialog-title>Editar Barbeiro</h2>
      <button mat-icon-button (click)="onCancel()">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="barberForm" (ngSubmit)="onSubmit()">
      <div mat-dialog-content class="dialog-content">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="name" required>
        </mat-form-field>

        <mat-checkbox formControlName="active">
          Ativo
        </mat-checkbox>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="barberForm.invalid || loading">
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
export class EditBarberDialogComponent {
  barberForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<EditBarberDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Barber
  ) {
    this.barberForm = this.fb.group({
      name: [data.name, Validators.required],
      active: [data.active]
    });
  }

  onSubmit() {
    if (this.barberForm.valid) {
      this.loading = true;
      
      const barberData = {
        name: this.barberForm.value.name,
        active: this.barberForm.value.active
      };

      this.apiService.updateBarber(this.data.id, barberData).subscribe({
        next: (barber) => {
          this.loading = false;
          this.snackBar.open('Barbeiro atualizado com sucesso', 'Fechar', { duration: 3000 });
          this.dialogRef.close(barber);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erro ao atualizar barbeiro:', error);
          this.snackBar.open('Erro ao atualizar barbeiro', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}