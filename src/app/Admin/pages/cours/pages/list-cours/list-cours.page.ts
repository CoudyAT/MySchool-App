import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddCoursComponent } from 'src/app/Admin/component/add-cours/add-cours.component';
import { Router } from '@angular/router';
//import { Course } from '../../model/cours.interface';

export interface Course {
  id: number;
  title: string;
  category: string;
  sessions: number;
  exercises: number;
  language: string;
  instructor: string;
  rating: number;
  maxRating: number;
  image: string;
  certificateAvailable: boolean;
  description: string;
  levels: Array<{ icon: string; completed: boolean }>;
}


@Component({
  selector: 'app-list-cours',
  templateUrl: './list-cours.page.html',
  styleUrls: ['./list-cours.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, AddCoursComponent],
})
export class ListCoursPage implements OnInit {
  searchText: string = '';
  selectedCategory: string = 'all';
  currentPage: number = 1;
  itemsPerPage: number = 6;
  showAddCourseModal = false;


  constructor(private router: Router) {}

  allCourses: Course[] = [
    {
      id: 1,
      title: 'Introduction au Développement Web',
      category: 'Développement',
      sessions: 24,
      exercises: 45,
      language: 'Français',
      instructor: 'Marie Dupont',
      rating: 4.8,
      maxRating: 5,
      image:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop',
      certificateAvailable: true,
      description:
        'Apprenez les bases du développement web avec HTML, CSS et JavaScript',
      levels: [
        { icon: '📚', completed: true },
        { icon: '💻', completed: true },
        { icon: '🎯', completed: false },
      ],
    },
    {
      id: 2,
      title: 'Design UI/UX Moderne',
      category: 'Design',
      sessions: 18,
      exercises: 32,
      language: 'Français',
      instructor: 'Jean Martin',
      rating: 4.9,
      maxRating: 5,
      image:
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
      certificateAvailable: true,
      description: "Maîtrisez les principes du design d'interface utilisateur",
      levels: [
        { icon: '📚', completed: true },
        { icon: '💻', completed: false },
        { icon: '🎯', completed: false },
      ],
    },
    {
      id: 3,
      title: 'Python pour Débutants',
      category: 'Programmation',
      sessions: 30,
      exercises: 60,
      language: 'Français',
      instructor: 'Sophie Bernard',
      rating: 4.7,
      maxRating: 5,
      image:
        'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop',
      certificateAvailable: true,
      description: 'Découvrez la programmation avec Python de A à Z',
      levels: [
        { icon: '📚', completed: true },
        { icon: '💻', completed: true },
        { icon: '🎯', completed: true },
      ],
    },
    {
      id: 4,
      title: 'Marketing Digital',
      category: 'Marketing',
      sessions: 22,
      exercises: 38,
      language: 'Français',
      instructor: 'Pierre Dubois',
      rating: 4.6,
      maxRating: 5,
      image:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
      certificateAvailable: true,
      description: 'Stratégies et outils pour réussir en marketing digital',
      levels: [
        { icon: '📚', completed: true },
        { icon: '💻', completed: false },
        { icon: '🎯', completed: false },
      ],
    },
    {
      id: 5,
      title: 'Data Science avec R',
      category: 'Data Science',
      sessions: 28,
      exercises: 52,
      language: 'Français',
      instructor: 'Claire Rousseau',
      rating: 4.8,
      maxRating: 5,
      image:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
      certificateAvailable: true,
      description: 'Analysez et visualisez vos données avec R',
      levels: [
        { icon: '📚', completed: true },
        { icon: '💻', completed: true },
        { icon: '🎯', completed: false },
      ],
    },
    {
      id: 6,
      title: 'Cybersécurité Avancée',
      category: 'Sécurité',
      sessions: 26,
      exercises: 48,
      language: 'Français',
      instructor: 'Marc Lefevre',
      rating: 4.9,
      maxRating: 5,
      image:
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop',
      certificateAvailable: true,
      description: 'Protégez vos systèmes contre les menaces numériques',
      levels: [
        { icon: '📚', completed: false },
        { icon: '💻', completed: false },
        { icon: '🎯', completed: false },
      ],
    },
    {
      id: 7,
      title: 'React et Redux',
      category: 'Développement',
      sessions: 32,
      exercises: 55,
      language: 'Français',
      instructor: 'Alice Moreau',
      rating: 4.7,
      maxRating: 5,
      image:
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
      certificateAvailable: true,
      description: 'Créez des applications web modernes avec React et Redux',
      levels: [
        { icon: '📚', completed: true },
        { icon: '💻', completed: false },
        { icon: '🎯', completed: false },
      ],
    },
    {
      id: 8,
      title: 'Intelligence Artificielle',
      category: 'Data Science',
      sessions: 35,
      exercises: 70,
      language: 'Français',
      instructor: 'Thomas Laurent',
      rating: 4.9,
      maxRating: 5,
      image:
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop',
      certificateAvailable: true,
      description: "Introduction aux concepts et applications de l'IA",
      levels: [
        { icon: '📚', completed: false },
        { icon: '💻', completed: false },
        { icon: '🎯', completed: false },
      ],
    },
  ];

  categories: string[] = [
    'all',
    'Développement',
    'Design',
    'Programmation',
    'Marketing',
    'Data Science',
    'Sécurité',
  ];

  goToDetail(course: Course) {
    this.router.navigate(['/admin-login/cours', course.id]);
  }

  filteredCourses: Course[] = [];
  paginatedCourses: Course[] = [];

  stats = {
    total: 0,
    completed: 0,
    inProgress: 0,
  };

  totalPages: number = 0;
  Math = Math;

  ngOnInit(): void {
    //this.calculateStats();
    this.applyFilters();
  }

  onCourseFormSubmit(courseData: any) {
    console.log('Nouveau cours à créer:', courseData);
    this.createCourse(courseData);
  }

  submitForm() {
    // Cette méthode sera appelée par le bouton du modal
    // Vous pouvez récupérer les données du formulaire via le formSubmit
  }

  createCourse(courseData: any) {
    // Générer un ID unique
    const newCourse: Course = {
      id: Math.max(...this.allCourses.map((c) => c.id)) + 1,
      title: courseData.title,
      category: courseData.category,
      sessions: courseData.sessions || 0,
      exercises: courseData.exercises || 0,
      language: 'Français',
      instructor: courseData.instructor,
      rating: 4.5,
      maxRating: 5,
      image:
        courseData.image ||
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop',
      certificateAvailable: courseData.certificateAvailable || false,
      description: courseData.description || '',
      levels: [
        { icon: '📚', completed: false },
        { icon: '💻', completed: false },
        { icon: '🎯', completed: false },
      ],
    };

    // Ajouter le nouveau cours
    this.allCourses.unshift(newCourse);

    // Mettre à jour les filtres
    this.applyFilters();

    // Fermer le modal
    this.closeAddCourseModal();

    console.log('Cours ajouté avec succès:', newCourse);
  }

  applyFilters(): void {
    this.filteredCourses = this.allCourses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        course.instructor
          .toLowerCase()
          .includes(this.searchText.toLowerCase()) ||
        course.category.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesCategory =
        this.selectedCategory === 'all' ||
        course.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });

    this.totalPages = Math.ceil(
      this.filteredCourses.length / this.itemsPerPage
    );
    this.updatePagination();
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCourses = this.filteredCourses.slice(startIndex, endIndex);
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onCategoryChange(event: Event): void {
    this.selectedCategory = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchText = '';
    this.onSearchChange();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(-1); // ellipsis
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = this.totalPages - 3; i <= this.totalPages; i++)
          pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++)
          pages.push(i);
        pages.push(-1);
        pages.push(this.totalPages);
      }
    }

    return pages;
  }

  getInstructorInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  trackByCourseId(index: number, course: Course): number {
    return course.id;
  }

  openAddCourseModal() {
    this.showAddCourseModal = true;
  }

  closeAddCourseModal() {
    this.showAddCourseModal = false;
  }
}