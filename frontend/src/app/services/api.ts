import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Barber {
  id: number;
  name: string;
  active: boolean;
  createdAt: string;
}

export interface Service {
  id: number;
  name: string;
  durationMin: number;
  bufferAfterMin: number;
  priceCents: number;
  active: boolean;
}

export interface Appointment {
  id: string;
  barberId: number;
  serviceId: number;
  clientId: number;
  startsAt: string;
  endsAt: string;
  status: string;
  notes?: string;
}

export interface Client {
  id: number;
  name: string;
  phone: string;
}

export interface WorkingHours {
  id: number;
  barberId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface CreateAppointmentRequest {
  barberId: number;
  serviceId: number;
  clientId: number;
  startsAt: string;
  endsAt: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://due-constancia-goncalo-6b7726ec.koyeb.app';

  constructor(private http: HttpClient) {}

  // Barbeiros
  getBarbers(): Observable<Barber[]> {
    return this.http.get<Barber[]>(`${this.baseUrl}/barbers`);
  }

  getBarber(id: number): Observable<Barber> {
    return this.http.get<Barber>(`${this.baseUrl}/barbers/${id}`);
  }

  // Serviços
  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}/services`);
  }

  getService(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.baseUrl}/services/${id}`);
  }

  // Marcações
  getAppointments(barberId: number, from: string, to: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments`, {
      params: {
        barberId: barberId.toString(),
        from: from,
        to: to
      }
    });
  }

  createAppointment(appointment: CreateAppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.baseUrl}/appointments`, appointment);
  }

  getAppointment(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.baseUrl}/appointments/${id}`);
  }

  cancelAppointment(id: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.baseUrl}/appointments/${id}/cancel`, {});
  }

  // Disponibilidade
  getAvailability(barberId: number, serviceId: number, date: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/availability`, {
      params: {
        barberId: barberId.toString(),
        serviceId: serviceId.toString(),
        date: date
      }
    });
  }

  // Clientes
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.baseUrl}/clients`);
  }

  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/clients/${id}`);
  }

  // Dados de teste
  getTestAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments/test`);
  }

  // CRUD Barbeiros
  createBarber(barber: { name: string }): Observable<Barber> {
    return this.http.post<Barber>(`${this.baseUrl}/barbers`, barber);
  }

  updateBarber(id: number, barber: { name: string; active?: boolean }): Observable<Barber> {
    return this.http.put<Barber>(`${this.baseUrl}/barbers/${id}`, barber);
  }

  deleteBarber(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/barbers/${id}`);
  }

  // CRUD Clientes
  createClient(client: { name: string; phone: string; email: string; password: string }): Observable<Client> {
    return this.http.post<Client>(`${this.baseUrl}/clients`, client);
  }

  updateClient(id: number, client: { name: string; phone: string }): Observable<Client> {
    return this.http.put<Client>(`${this.baseUrl}/clients/${id}`, client);
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/clients/${id}`);
  }

  // CRUD Serviços
  createService(service: { name: string; durationMin: number; bufferAfterMin: number; priceCents: number; active?: boolean }): Observable<Service> {
    return this.http.post<Service>(`${this.baseUrl}/services`, service);
  }

  updateService(id: number, service: { name: string; durationMin: number; bufferAfterMin: number; priceCents: number; active?: boolean }): Observable<Service> {
    return this.http.put<Service>(`${this.baseUrl}/services/${id}`, service);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/services/${id}`);
  }

  // Working Hours
  getWorkingHours(barberId: number): Observable<WorkingHours[]> {
    return this.http.get<WorkingHours[]>(`${this.baseUrl}/working-hours?barberId=${barberId}`);
  }
}
