import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { PdfFile } from 'src/app/models/pdf.model';
import {
    IonContent,
    IonSearchbar,
    IonIcon,
    IonButton,
    IonItem,
    IonLabel,
    IonSpinner,
    IonAlert,
    IonList,
    IonThumbnail,
    IonToolbar,
    IonHeader,
    IonTitle,
    IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
    document as documentIcon,
    download,
    eye,
    time,
    documents,
    arrowBack,
    cardOutline,
    chevronBackOutline,
    checkmarkCircle,
    ellipseOutline,
    playCircle,
    checkmark,
} from 'ionicons/icons';
import { PdfService } from '../../services/pdf.service';

@Component({
    selector: 'app-pdf-list',
    templateUrl: './pdf-list.page.html',
    styleUrls: ['./pdf-list.page.scss'],
    standalone: true,
    imports: [
        IonTitle,
        IonHeader,
        IonToolbar,
        IonButtons,
        CommonModule,
        IonContent,
        IonSearchbar,
        IonIcon,
        IonButton,
        IonItem,
        IonLabel,
        IonSpinner,
        IonAlert,
        IonList,
        IonThumbnail,
    ],
})
export class PdfListPage implements OnInit {
    pdfs: PdfFile[] = [];
    filteredPdfs: PdfFile[] = [];
    private subscription = new Subscription();

    isLoading = true;
    showError = false;
    errorMessage = '';

    constructor(private pdfService: PdfService, private router: Router) {
        addIcons({
            chevronBackOutline,
            documents,
            time,
            eye,
            download,
            document: documentIcon,
            arrowBack,
            checkmark,
            playCircle,
            cardOutline,
            checkmarkCircle,
            ellipseOutline,
        });
    }

    ngOnInit() {
        this.loadPdfs();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    loadPdfs() {
        this.isLoading = true;
        this.showError = false;

        const sub = this.pdfService.getAllPdfs().subscribe({
            next: (pdfs) => {
                this.pdfs = pdfs;
                this.filteredPdfs = [...pdfs];
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Erreur lors du chargement des PDFs:', err);
                this.errorMessage = 'Impossible de charger les fichiers PDF';
                this.showError = true;
                this.isLoading = false;
            },
        });

        this.subscription.add(sub);
    }

    searchPdf(event: any) {
        const term = event?.detail?.value?.toLowerCase() ?? '';

        if (!term) {
            this.filteredPdfs = [...this.pdfs];
            return;
        }

        this.filteredPdfs = this.pdfs.filter((pdf) =>
            pdf.name.toLowerCase().includes(term)
        );
    }

    // Méthode pour retourner en arrière
    goBack() {
        this.router.navigate(['/courses']);
    }

    // Ouvrir le PDF dans un nouvel onglet
    viewPdf(pdf: PdfFile) {
        window.open(pdf.url, '_blank');
    }

    // Télécharger le PDF
    downloadPdf(pdf: PdfFile) {
        const link = document.createElement('a');
        link.href = pdf.url;
        link.download = pdf.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Formater la date
    formatDate(date: Date): string {
        return new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    }
}
