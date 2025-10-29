import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { ApiService, Client } from '../../services/api';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatMenuModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './customers.html',
  styleUrl: './customers.css'
})
export class CustomersComponent implements OnInit {
  clients: Client[] = [];
  displayedColumns: string[] = ['name', 'phone', 'createdAt', 'actions'];

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.apiService.getClients().subscribe(clients => {
      this.clients = clients;
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateClientDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadClients();
      }
    });
  }

  openEditDialog(client: Client) {
    const dialogRef = this.dialog.open(EditClientDialogComponent, {
      width: '500px',
      data: client
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadClients();
      }
    });
  }

  deleteClient(client: Client) {
    if (confirm(`Tem certeza que deseja excluir o cliente "${client.name}"?`)) {
      this.apiService.deleteClient(client.id).subscribe({
        next: () => {
          this.snackBar.open('Cliente excluído com sucesso', 'Fechar', { duration: 3000 });
          this.loadClients();
        },
        error: (error) => {
          console.error('Erro ao excluir cliente:', error);
          this.snackBar.open('Erro ao excluir cliente', 'Fechar', { duration: 3000 });
        }
      });
    }
  }
}

@Component({
  selector: 'app-create-client-dialog',
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
      <h2 mat-dialog-title>Novo Cliente</h2>
      <button mat-icon-button (click)="onCancel()">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="clientForm" (ngSubmit)="onSubmit()">
      <div mat-dialog-content class="dialog-content">
        <div class="info-message">
          <mat-icon>info</mat-icon>
          <p>O cliente receberá um email para definir a sua senha.</p>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="name" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Telefone</mat-label>
          <input matInput formControlName="phone" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" required>
        </mat-form-field>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="clientForm.invalid || loading">
          {{ loading ? 'Criando...' : 'Criar Cliente' }}
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
    .info-message {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: rgba(195, 255, 90, 0.1);
      border: 1px solid rgba(195, 255, 90, 0.3);
      border-radius: 8px;
      color: #C3FF5A;
    }
    .info-message mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .info-message p {
      margin: 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
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
export class CreateClientDialogComponent {
  clientForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<CreateClientDialogComponent>,
    private snackBar: MatSnackBar
  ) {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.clientForm.valid) {
      this.loading = true;
      
      const clientData = this.clientForm.value;

      this.apiService.createClient(clientData).subscribe({
        next: (client) => {
          this.loading = false;
          this.snackBar.open('Cliente criado! Email de definição de senha enviado.', 'Fechar', { duration: 5000 });
          this.dialogRef.close(client);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erro ao criar cliente:', error);
          this.snackBar.open('Erro ao criar cliente', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-edit-client-dialog',
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
      <h2 mat-dialog-title>Editar Cliente</h2>
      <button mat-icon-button (click)="onCancel()">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <form [formGroup]="clientForm" (ngSubmit)="onSubmit()">
      <div mat-dialog-content class="dialog-content">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="name" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Telefone</mat-label>
          <input matInput formControlName="phone" required>
        </mat-form-field>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="clientForm.invalid || loading">
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
export class EditClientDialogComponent {
  clientForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<EditClientDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Client
  ) {
    this.clientForm = this.fb.group({
      name: [data.name, Validators.required],
      phone: [data.phone, Validators.required]
    });
  }

  onSubmit() {
    if (this.clientForm.valid) {
      this.loading = true;
      
      const clientData = this.clientForm.value;

      this.apiService.updateClient(this.data.id, clientData).subscribe({
        next: (client) => {
          this.loading = false;
          this.snackBar.open('Cliente atualizado com sucesso', 'Fechar', { duration: 3000 });
          this.dialogRef.close(client);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erro ao atualizar cliente:', error);
          this.snackBar.open('Erro ao atualizar cliente', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}