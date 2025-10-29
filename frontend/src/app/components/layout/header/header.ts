import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Notification } from '../../../services/api';
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

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadNotifications() {
    this.subscriptions.push(
      this.apiService.getNotifications().subscribe({
        next: (notifications) => {
          this.notifications = notifications;
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
        }
      })
    );
  }

  loadUnreadCount() {
    this.subscriptions.push(
      this.apiService.getUnreadCount().subscribe({
        next: (count) => {
          this.notificationCount = count;
        },
        error: (error) => {
          console.error('Error loading unread count:', error);
        }
      })
    );
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
    
    this.subscriptions.push(
      this.apiService.markAllNotificationsAsRead().subscribe({
        next: (updatedCount) => {
          this.notificationCount = 0;
          this.isMarkingAsRead = false;
          this.markReadSuccess = true;
          
          // Update notifications to mark them as read
          this.notifications = this.notifications.map(n => ({ ...n, readStatus: true }));
          
          // Reset success state after animation
          setTimeout(() => {
            this.markReadSuccess = false;
          }, 2000);
        },
        error: (error) => {
          console.error('Error marking all as read:', error);
          this.isMarkingAsRead = false;
        }
      })
    );
  }

  markNotificationAsRead(notificationId: number) {
    this.subscriptions.push(
      this.apiService.markNotificationAsRead(notificationId).subscribe({
        next: () => {
          // Update local state
          this.notifications = this.notifications.map(n => 
            n.id === notificationId ? { ...n, readStatus: true } : n
          );
          this.notificationCount = Math.max(0, this.notificationCount - 1);
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      })
    );
  }

  deleteNotification(notificationId: number) {
    this.subscriptions.push(
      this.apiService.deleteNotification(notificationId).subscribe({
        next: () => {
          // Update local state
          const notification = this.notifications.find(n => n.id === notificationId);
          if (notification && !notification.readStatus) {
            this.notificationCount = Math.max(0, this.notificationCount - 1);
          }
          this.notifications = this.notifications.filter(n => n.id !== notificationId);
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
        }
      })
    );
  }

  getRelativeTime(timestamp: string): string {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `Há ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Há ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Há ${diffInDays} dias`;
    
    return date.toLocaleDateString('pt-PT');
  }

  trackByNotificationId(index: number, notification: Notification): number {
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

  addCustomer() {
    if (this.isAddingCustomer) return;
    
    this.isAddingCustomer = true;
    
    this.apiService.createClient(this.newCustomer).subscribe({
      next: (client) => {
        this.isAddingCustomer = false;
        this.closeAddCustomerModal();
        alert(`Cliente ${client.name} adicionado com sucesso! Um email foi enviado para ${this.newCustomer.email} para definir a senha.`);
        
        // Recarregar notificações para mostrar a nova notificação
        this.loadNotifications();
      },
      error: (error) => {
        this.isAddingCustomer = false;
        console.error('Erro ao adicionar cliente:', error);
        alert('Erro ao adicionar cliente. Tente novamente.');
      }
    });
  }
}