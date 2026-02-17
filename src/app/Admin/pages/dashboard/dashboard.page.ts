import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { forkJoin } from 'rxjs';

import { UserService } from 'src/app/features/auth/services/user.service';
import { CourseService } from 'src/app/features/services/courseService';
import { InstructorService } from 'src/app/features/services/instructorService';
import { MatiereService } from 'src/app/features/services/matiere.service';

import { User } from 'src/app/models/user.model';
import { Course } from 'src/app/models/course.model';
import { Instructor } from 'src/app/models/instructor.model';
import { Matiere } from 'src/app/models/course.model';
import { Payment, PaymentData } from 'src/app/models/payment.model';
import { Enrollment } from 'src/app/models/payment.model';
import { PaymentService } from 'src/app/features/services/paymentService';
import { EnrollmentService } from 'src/app/features/services/enrollmentService';

interface RecentUser { name: string; role: string; date: string; }
interface RecentProfessor { name: string; specialty: string; date: string; }
interface RecentCourse { title: string; professor: string; date: string; }
interface RecentSubject { name: string; level: string; date: string; }

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class DashboardPage implements OnInit {

  // Statistiques principales
  totalUsers = 0;
  activeUsers = 0;
  monthlyRevenue = 0;     // sera calculé
  recentEnrollments = 0;     // sera calculé
  totalCourses = 0;
  totalInstructors = 0;
  totalSubjects = 0;

  recentUsers: RecentUser[] = [];
  recentProfessors: RecentProfessor[] = [];
  recentCourses: RecentCourse[] = [];
  recentSubjects: RecentSubject[] = [];

  isLoading = true;

  private readonly currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  constructor(
    private userService: UserService,
    private courseService: CourseService,
    private instructorService: InstructorService,
    private matiereService: MatiereService,
    private paymentService: PaymentService,
    private enrollmentService: EnrollmentService
  ) { }

  ngOnInit() {
    this.loadDashboard();
  }

  private loadDashboard() {
    forkJoin({
      users: this.userService.getAllUsers(),
      courses: this.courseService.getAllCourses(),
      instructors: this.instructorService.getInstructors(),
      subjects: this.matiereService.getAllMatieres(),
      payments: this.paymentService.getAllPayments(),
      enrollments: this.enrollmentService.getAllEnrollments()
    }).subscribe({
      next: (results) => {
        // ── Utilisateurs ────────────────────────────────
        const users = results.users?.data || [];
        this.totalUsers = users.length;
        this.activeUsers = users.filter(u => u.status === 'active').length;

        this.recentUsers = users
          .slice(0, 5)
          .map((u, i) => ({
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Utilisateur',
            role: this.mapRole(u.role),
            date: this.daysAgo(i)
          }));

        // ── Cours ───────────────────────────────────────
        const courses = results.courses || [];
        this.totalCourses = courses.length;

        this.recentCourses = courses
          .slice(0, 5)
          .map((c, i) => ({
            title: c.title || 'Cours sans titre',
            professor: c.instructorId || c.instructorName || '—',
            date: this.daysAgo(i)
          }));

        // ── Professeurs ─────────────────────────────────
        const instructors = results.instructors || [];
        this.totalInstructors = instructors.length;

        this.recentProfessors = instructors
          .slice(0, 4)
          .map((p, i) => ({
            name: p.name || 'Instructeur',
            specialty: p.title || (p.expertiseIds?.[0] || '—'),
            date: this.daysAgo(i + 1)
          }));

        // ── Matières ────────────────────────────────────
        const subjects = results.subjects || [];
        this.totalSubjects = subjects.length;

        this.recentSubjects = subjects
          .slice(0, 4)
          .map((s, i) => ({
            name: s.nom || 'Matière',
            level: s.classe || s.niveauScolaire || '—',
            date: this.daysAgo(i + 2)
          }));

        // ── Revenu mensuel & inscriptions récentes ──────
        const payments = results.payments?.data || [];
        const enrollments = results.enrollments || [];

        this.calculateFinancials(payments, enrollments);

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement dashboard', err);
        this.isLoading = false;
      }
    });
  }

  private calculateFinancials(payments: Payment[], enrollments: Enrollment[]) {
    const currentMonthStart = this.currentMonthStart;

    const monthEnrollments = enrollments.filter(e =>
      e.amount > 0 &&
      ['completed', 'active'].includes(e.status) &&
      e.enrolledAt &&
      new Date(e.enrolledAt) >= currentMonthStart
    );

    this.monthlyRevenue = monthEnrollments.reduce((sum, e) => sum + (e.amount || 0), 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEnr = enrollments.filter(e =>
      e.enrolledAt &&
      new Date(e.enrolledAt) >= thirtyDaysAgo
    );

    this.recentEnrollments = recentEnr.length;

    console.log(`Revenus mois courant : ${this.monthlyRevenue} FCFA (${monthEnrollments.length} inscriptions payantes)`);
    console.log(`Inscriptions récentes (30j) : ${this.recentEnrollments}`);
  }
  private mapRole(role: any): string {
    if (!role) return '—';
    const r = typeof role === 'string' ? role.toLowerCase() : role.libelle?.toLowerCase() || '';

    if (r.includes('student') || r === 'élève') return 'Élève';
    if (r.includes('parent')) return 'Parent';
    if (r.includes('teacher') || r.includes('instructor') || r.includes('prof')) return 'Professeur';
    if (r.includes('admin')) return 'Admin';
    return r || '—';
  }

  private daysAgo(index: number): string {
    const d = new Date();
    d.setDate(d.getDate() - index);
    return d.toISOString().split('T')[0];
  }

  getAvatarClass(role: string): string {
    const map: Record<string, string> = {
      'Élève': 'avatar-eleve',
      'Parent': 'avatar-parent',
      'Professeur': 'avatar-prof',
      'Admin': 'avatar-admin'
    };
    return map[role] || '';
  }
}