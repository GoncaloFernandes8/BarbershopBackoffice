import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'appointment' | 'client' | 'service' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon: string;
  actionUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    // Carregar notificações do localStorage na inicialização
    this.loadNotificationsFromStorage();
  }

  private loadNotificationsFromStorage() {
    const stored = localStorage.getItem('barbershop-notifications');
    if (stored) {
      try {
        const notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount();
      } catch (error) {
        console.error('Error loading notifications from storage:', error);
      }
    }
  }

  private saveNotificationsToStorage() {
    const notifications = this.notificationsSubject.value;
    localStorage.setItem('barbershop-notifications', JSON.stringify(notifications));
  }

  private updateUnreadCount() {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };

    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [newNotification, ...currentNotifications].slice(0, 50); // Manter apenas as últimas 50
    
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
    this.saveNotificationsToStorage();
  }

  markAsRead(notificationId: string) {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
    this.saveNotificationsToStorage();
  }

  markAllAsRead() {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(n => ({ ...n, read: true }));
    
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
    this.saveNotificationsToStorage();
  }

  deleteNotification(notificationId: string) {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== notificationId);
    
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
    this.saveNotificationsToStorage();
  }

  clearAllNotifications() {
    this.notificationsSubject.next([]);
    this.updateUnreadCount();
    this.saveNotificationsToStorage();
  }

  getNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  getUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  // Métodos de conveniência para criar notificações específicas
  notifyNewAppointment(appointment: { clientName: string; barberName: string; time: string }) {
    this.addNotification({
      type: 'appointment',
      title: 'Nova Marcação',
      message: `${appointment.clientName} agendou uma marcação com ${appointment.barberName} às ${appointment.time}`,
      icon: 'event'
    });
  }

  notifyNewClient(clientName: string) {
    this.addNotification({
      type: 'client',
      title: 'Novo Cliente',
      message: `${clientName} foi cadastrado no sistema`,
      icon: 'person_add'
    });
  }

  notifyAppointmentCancelled(appointment: { clientName: string; time: string }) {
    this.addNotification({
      type: 'appointment',
      title: 'Marcação Cancelada',
      message: `A marcação de ${appointment.clientName} às ${appointment.time} foi cancelada`,
      icon: 'event_busy'
    });
  }

  notifyAppointmentConfirmed(appointment: { clientName: string; time: string }) {
    this.addNotification({
      type: 'appointment',
      title: 'Marcação Confirmada',
      message: `${appointment.clientName} confirmou a marcação às ${appointment.time}`,
      icon: 'event_available'
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
