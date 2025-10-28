import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService, Notification } from '../../../services/notifications';
import { Subscription } from 'rxjs';

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
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() pageTitle = 'Dashboard';
  @Input() userName = 'Admin';
  @Output() sidebarToggle = new EventEmitter<void>();

  // Notification properties
  notifications: Notification[] = [];
  notificationCount = 0;
  isMarkingAsRead = false;
  markReadSuccess = false;
  
  private subscriptions: Subscription[] = [];

  // Add Customer Modal properties
  isAddCustomerModalOpen = false;
  isAddingCustomer = false;
  newCustomer = {
    name: '',
    phone: '',
    email: ''
  };

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    // Subscrever às notificações
    this.subscriptions.push(
      this.notificationService.notifications$.subscribe((notifications: Notification[]) => {
        this.notifications = notifications;
      })
    );

    this.subscriptions.push(
      this.notificationService.unreadCount$.subscribe((count: number) => {
        this.notificationCount = count;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

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
    
    this.notificationService.markAllAsRead();
    this.isMarkingAsRead = false;
    this.markReadSuccess = true;
    
    // Reset success state after animation
    setTimeout(() => {
      this.markReadSuccess = false;
    }, 2000);
  }

  markNotificationAsRead(notificationId: string) {
    this.notificationService.markAsRead(notificationId);
  }

  deleteNotification(notificationId: string) {
    this.notificationService.deleteNotification(notificationId);
  }

  getRelativeTime(timestamp: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `Há ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Há ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Há ${diffInDays} dias`;
    
    return timestamp.toLocaleDateString('pt-PT');
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
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
      
      // Criar notificação de novo cliente
      this.notificationService.notifyNewClient(this.newCustomer.name);
      
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