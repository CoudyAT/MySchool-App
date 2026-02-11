import { Injectable } from '@angular/core';
import { User, NiveauScolaire, Classe } from 'src/app/models/user.model';
import { Matiere, Course } from 'src/app/models/course.model';

/**
 * Service pour filtrer les matières et cours selon le profil utilisateur
 */
@Injectable({
  providedIn: 'root'
})
export class FiltreNiveauService {

  /**
   * Filtrer les matières selon le niveau scolaire de l'utilisateur
   */
  filtrerMatieresParNiveau(
    matieres: Matiere[],
    niveauScolaire?: NiveauScolaire,
    classe?: Classe
  ): Matiere[] {
    if (!niveauScolaire) {
      return matieres;
    }

    return matieres.filter(matiere => {
      // Vérifier le niveau scolaire
      const niveauMatch = matiere.niveauScolaire === niveauScolaire;

      // Si une classe est spécifiée, vérifier aussi la classe
      if (classe && matiere.classe) {
        return niveauMatch && matiere.classe === classe;
      }

      // Sinon, juste le niveau suffit
      return niveauMatch;
    });
  }

  /**
   * Filtrer les cours selon le niveau scolaire de l'utilisateur
   */
  filtrerCoursParNiveau(
    cours: Course[],
    niveauScolaire?: NiveauScolaire,
    classe?: Classe
  ): Course[] {
    if (!niveauScolaire) {
      return cours;
    }

    return cours.filter(course => {
      // Si le cours n'a pas de niveau défini, l'afficher (cours générique)
      if (!course.level || course.level.trim() === '') {
        console.log('📚 Cours sans niveau spécifique:', course.title);
        return true;
      }

      const match = this.niveauMatchCours(course.level, niveauScolaire, classe);

      if (!match) {
        console.log('❌ Cours filtré:', course.title, '- Level:', course.level, '- User niveau:', niveauScolaire);
      } else {
        console.log('✅ Cours affiché:', course.title, '- Level:', course.level);
      }

      return match;
    });
  }

  /**
   * Vérifier si un niveau de cours correspond au profil utilisateur
   */
  private niveauMatchCours(
    coursLevel: string,
    niveauScolaire: NiveauScolaire,
    classe?: Classe
  ): boolean {
    const levelLower = coursLevel.toLowerCase();
    const niveauLower = niveauScolaire.toLowerCase();

    // Correspondances directes
    if (levelLower.includes(niveauLower)) {
      return true;
    }

    // Correspondances par mot-clé
    const keywords: Record<NiveauScolaire, string[]> = {
      ELEMENTAIRE: [
        'primaire', 'élémentaire', 'elementaire', 'elementary', 'primary',
        'ci', 'cp', 'ce1', 'ce2', 'cm1', 'cm2', 'ce', 'cm',
        'beginner', 'débutant', 'debutant', 'DEBUTANT', 'basic', 'base'
      ],
      MOYEN: [
        'collège', 'college', 'moyen', 'middle school',
        '6ème', '5ème', '4ème', '3ème', '6eme', '5eme', '4eme', '3eme',
        'intermediate', 'intermédiaire', 'intermediaire', 'INTERMEDIAIRE'
      ],
      SECONDAIRE: [
        'lycée', 'lycee', 'secondaire', 'high school', 'secondary',
        'seconde', 'première', 'premiere', 'terminale', 'bac',
        'advanced', 'avancé', 'avance', 'AVANCE'
      ],
      UNIVERSITAIRE: [
        'universitaire', 'université', 'universite', 'university',
        'licence', 'master', 'supérieur', 'superieur', 'higher education',
        'expert', 'professional', 'professionnel'
      ]
    };

    const niveauKeywords = keywords[niveauScolaire] || [];
    return niveauKeywords.some(keyword => levelLower.includes(keyword));
  }

  /**
   * Obtenir les matières disponibles pour un utilisateur
   * en fonction de son abonnement
   */
  getMatieresAccessibles(
    user: User,
    toutesLesMatieres: Matiere[],
    matiereIdsAbonnement?: string[]
  ): Matiere[] {
    // Filtrer d'abord par niveau
    let matieres = this.filtrerMatieresParNiveau(
      toutesLesMatieres,
      user.niveauScolaire,
      user.classe
    );

    // Si l'utilisateur a un abonnement avec matières spécifiques
    if (matiereIdsAbonnement && matiereIdsAbonnement.length > 0) {
      matieres = matieres.filter(m => matiereIdsAbonnement.includes(m.id));
    }

    return matieres;
  }

  /**
   * Vérifier si une matière est accessible pour un utilisateur
   */
  isMatiereAccessible(
    matiere: Matiere,
    user: User,
    matiereIdsAbonnement?: string[]
  ): boolean {
    // Vérifier le niveau
    if (matiere.niveauScolaire !== user.niveauScolaire) {
      return false;
    }

    // Vérifier la classe si spécifiée
    if (matiere.classe && user.classe && matiere.classe !== user.classe) {
      return false;
    }

    // Si abonnement avec matières spécifiques, vérifier l'ID
    if (matiereIdsAbonnement && matiereIdsAbonnement.length > 0) {
      return matiereIdsAbonnement.includes(matiere.id);
    }

    return true;
  }

  /**
   * Grouper les matières par niveau scolaire
   */
  grouperMatieresParNiveau(matieres: Matiere[]): Record<NiveauScolaire, Matiere[]> {
    const groupes: Record<NiveauScolaire, Matiere[]> = {
      ELEMENTAIRE: [],
      MOYEN: [],
      SECONDAIRE: [],
      UNIVERSITAIRE: []
    };

    matieres.forEach(matiere => {
      if (matiere.niveauScolaire in groupes) {
        groupes[matiere.niveauScolaire].push(matiere);
      }
    });

    return groupes;
  }

  /**
   * Obtenir un message expliquant pourquoi une matière n'est pas accessible
   */
  getMessageNonAccessible(
    matiere: Matiere,
    user: User
  ): string {
    if (!user.niveauScolaire) {
      return 'Veuillez configurer votre niveau scolaire dans votre profil';
    }

    if (matiere.niveauScolaire !== user.niveauScolaire) {
      return `Cette matière est pour le niveau ${matiere.niveauScolaire}`;
    }

    if (matiere.classe && user.classe && matiere.classe !== user.classe) {
      return `Cette matière est pour la classe de ${matiere.classe}`;
    }

    return 'Cette matière n\'est pas incluse dans votre abonnement';
  }

  /**
   * Obtenir le libellé complet d'un niveau
   */
  getLibelleNiveau(niveau: NiveauScolaire): string {
    const libelles: Record<NiveauScolaire, string> = {
      ELEMENTAIRE: 'Élémentaire',
      MOYEN: 'Collège',
      SECONDAIRE: 'Lycée',
      UNIVERSITAIRE: 'Universitaire'
    };

    return libelles[niveau] || niveau;
  }

  /**
   * Obtenir la description d'une classe
   */
  getDescriptionClasse(classe: Classe): string {
    const descriptions: Record<string, string> = {
      'CI': 'Cours d\'Initiation',
      'CP': 'Cours Préparatoire',
      'CE1': 'Cours Élémentaire 1',
      'CE2': 'Cours Élémentaire 2',
      'CM1': 'Cours Moyen 1',
      'CM2': 'Cours Moyen 2',
      '6ème': 'Sixième',
      '5ème': 'Cinquième',
      '4ème': 'Quatrième',
      '3ème': 'Troisième',
      'Seconde': 'Seconde',
      'Première': 'Première',
      'Terminale': 'Terminale',
      'Licence1': 'Licence 1ère année',
      'Licence2': 'Licence 2ème année',
      'Licence3': 'Licence 3ème année',
      'Master1': 'Master 1ère année',
      'Master2': 'Master 2ème année'
    };

    return descriptions[classe] || classe;
  }
}
