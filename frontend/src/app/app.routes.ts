import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { CalendarComponent } from './pages/calendar/calendar';
import { CustomersComponent } from './pages/customers/customers';
import { AppointmentsComponent } from './pages/appointments/appointments';
import { ServicesComponent } from './pages/services/services';
import { BarbersComponent } from './pages/barbers/barbers';
import { ScheduleComponent } from './pages/schedule/schedule';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'customers', component: CustomersComponent },
  { path: 'appointments', component: AppointmentsComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'barbers', component: BarbersComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: '**', redirectTo: '/dashboard' }
];