import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdfListPage } from './pdf-list.page';

describe('PdfListPage', () => {
    let component: PdfListPage;
    let fixture: ComponentFixture<PdfListPage>;

    beforeEach(() => {
        fixture = TestBed.createComponent(PdfListPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});