import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatToolbarModule, 
    MatIconModule, 
    MatButtonModule, 
    MatMenuModule, 
    MatDividerModule,
    MatTooltipModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  @Input() pageTitle = 'Dashboard';
  @Input() userName = 'Admin';
  @Output() sidebarToggle = new EventEmitter<void>();

  // Notification properties
  notificationCount = 2;
  isMarkingAsRead = false;
  markReadSuccess = false;

  // Add Customer Modal properties
  isAddCustomerModalOpen = false;
  isAddingCustomer = false;
  newCustomer = {
    name: '',
    phone: '',
    email: ''
  };

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  logout() {
    // Implementar logout
    console.log('Logout');
  }

  async markAllAsRead() {
    if (this.isMarkingAsRead) return;
    
    this.isMarkingAsRead = true;
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.notificationCount = 0;
    this.isMarkingAsRead = false;
    this.markReadSuccess = true;
    
    // Reset success state after animation
    setTimeout(() => {
      this.markReadSuccess = false;
    }, 2000);
  }

  // Add Customer Modal methods
  openAddCustomerModal() {
    this.isAddCustomerModalOpen = true;
    this.resetCustomerForm();
  }

  closeAddCustomerModal() {
    this.isAddCustomerModalOpen = false;
    this.resetCustomerForm();
  }

  resetCustomerForm() {
    this.newCustomer = {
      name: '',
      phone: '',
      email: ''
    };
    this.isAddingCustomer = false;
  }

  async addCustomer() {
    if (this.isAddingCustomer) return;
    
    this.isAddingCustomer = true;
    
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aqui seria a chamada real para a API
      console.log('Adicionando cliente:', this.newCustomer);
      
      // Simular envio de email
      console.log('Enviando email para definir password para:', this.newCustomer.email);
      
      // Fechar modal e mostrar sucesso
      this.closeAddCustomerModal();
      
      // Aqui poderia mostrar uma notificação de sucesso
      alert(`Cliente ${this.newCustomer.name} adicionado com sucesso! Um email foi enviado para ${this.newCustomer.email} para definir a password.`);
      
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      alert('Erro ao adicionar cliente. Tente novamente.');
    } finally {
      this.isAddingCustomer = false;
    }
  }
}