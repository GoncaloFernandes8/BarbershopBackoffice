import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './components/layout/sidebar/sidebar';
import { HeaderComponent } from './components/layout/header/header';
import { CommonModule } from '@angular/common';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Barbershop Backoffice';
  isSidebarOpen = false;
  isSidebarCollapsed = false;
  currentPageTitle = 'Dashboard';
  private destroy$ = new Subject<void>();

  // Mapeamento de rotas para títulos
  private pageTitles: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/calendar': 'Calendário',
    '/appointments': 'Marcações',
    '/customers': 'Clientes',
    '/services': 'Serviços',
    '/barbers': 'Barbeiros'
  };

  // Rota padrão
  private defaultRoute = '/dashboard';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Inicializar título com a rota atual
    this.updatePageTitle(this.router.url);
    
    // Detectar mudanças de rota e atualizar título
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updatePageTitle(event.url);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updatePageTitle(url: string) {
    // Remover query parameters e fragmentos
    const cleanUrl = url.split('?')[0].split('#')[0];
    
    // Se a URL for vazia ou apenas '/', usar rota padrão
    const routeToCheck = cleanUrl === '' || cleanUrl === '/' ? this.defaultRoute : cleanUrl;
    
    // Encontrar o título correspondente ou usar 'Dashboard' como padrão
    const newTitle = this.pageTitles[routeToCheck] || 'Dashboard';
    
    // Atualizar título apenas se for diferente
    if (this.currentPageTitle !== newTitle) {
      this.currentPageTitle = newTitle;
      this.cdr.detectChanges();
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  toggleSidebarCollapse() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.cdr.detectChanges();
  }
}