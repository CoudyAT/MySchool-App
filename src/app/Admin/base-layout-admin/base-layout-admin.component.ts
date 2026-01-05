import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from "@angular/router";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-base-layout-admin',
  templateUrl: './base-layout-admin.component.html',
  styleUrls: ['./base-layout-admin.component.scss'],
  standalone: true,
  imports: [RouterOutlet, CommonModule],
})
export class BaseLayoutAdminComponent {
  activePage = '';
  activeTab: string = 'dashboard';

  constructor(private router: Router) { }

  navigate(page: string) {
    // Map des pages vers les routes complètes
    const routeMap: { [key: string]: string } = {
      dashboard: '/admin-login/',
      users: '/admin-login/users',
      'list-cours': '/admin-login/list-cours',
      projects: '/admin-login/enrollments',
      faq: '/admin-login/faq',
      intructors: '/admin-login/instructors',
      chat: '/admin-login/chat',
    };

    this.activePage = page;


    const route = routeMap[page] || `/admin-login/${page}`;
    this.router.navigate([route]);
  }

  isActive(tab: string): boolean {
    return this.activeTab === tab;
  }
}
