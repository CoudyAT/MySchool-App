import { Course } from "./course.model";

export interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  backgroundColor: string;
  rating: number;
  totalStudents: number;
  totalCourses: number;
  totalHours: number;
  expertiseIds: string[];
  coursesIds: string[];
  courses?: any[];
  expertise: string[];
  active: boolean;
}
