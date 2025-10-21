import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatSidenavModule, MatListModule, MatIconModule, RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Input() isCollapsed = false;
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() sidebarCollapse = new EventEmitter<void>();

  closeSidebar() {
    this.sidebarToggle.emit();
  }

  toggleCollapse() {
    this.sidebarCollapse.emit();
  }
}