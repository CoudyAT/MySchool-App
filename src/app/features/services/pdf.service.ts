// services/pdf.service.ts
import { Injectable } from '@angular/core';
import {
  Storage,
  ref,
  listAll,
  getDownloadURL,
  getMetadata,
} from '@angular/fire/storage';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PdfFile } from 'src/app/models/pdf.model';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { NiveauScolaire } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  private storagePath = 'pdf'; // Chemin dans Firebase Storage

  constructor(
    private storage: Storage,
    private auth: Auth,
    private firestore: Firestore,
  ) {}

  // Récupérer tous les PDFs
  getAllExos(): Observable<PdfFile[]> {
    const storageRef = ref(this.storage, 'pdf/Exercices');
    return from(listAll(storageRef)).pipe(
      switchMap((result) =>
        from(
          Promise.all(
            result.items.map((item) =>
              Promise.all([getDownloadURL(item), getMetadata(item)])
                .then(([url, metadata]) => ({
                  name: item.name,
                  url,
                  size: this.formatFileSize(metadata.size || 0),
                  type: metadata.contentType || 'application/pdf',
                  lastModified: new Date(metadata.updated),
                  path: item.fullPath,
                }))
                .catch((error) => {
                  console.error('Erreur lors de la récupération du PDF:', error);
                  return null;
                })
            )
          ).then((pdfs) =>
            (pdfs.filter((p) => p !== null) as PdfFile[]).sort(
              (a, b) => b.lastModified.getTime() - a.lastModified.getTime()
            )
          )
        )
      )
    );
  }

  getAllPdfs(): Observable<PdfFile[]> {
    return authState(this.auth).pipe(
      switchMap(async (user) => {
      const localUser = JSON.parse(
              localStorage.getItem('currentUser') || 'null',
            );
        if (!localUser) {
          throw new Error('Utilisateur non connecté');
        }
        
        const niveau = localUser.niveauScolaire;

        if (!niveau) {
          throw new Error('Niveau utilisateur introuvable');
        }

        // 🔹 Construire le chemin dynamique
        const storageRef = ref(this.storage, `pdf/${niveau}`);

        const result = await listAll(storageRef);

        const pdfs = await Promise.all(
          result.items.map(async (item) => {
            const url = await getDownloadURL(item);
            const metadata = await getMetadata(item);

            return {
              name: item.name,
              url,
              size: this.formatFileSize(metadata.size || 0),
              type: metadata.contentType || 'application/pdf',
              lastModified: new Date(metadata.updated),
              path: item.fullPath,
            };
          }),
        );

        return pdfs.sort(
          (a, b) => b.lastModified.getTime() - a.lastModified.getTime(),
        );
      }),
    );
  }

  // Formater la taille du fichier
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
