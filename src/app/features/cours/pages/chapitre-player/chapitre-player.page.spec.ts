import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChapitrePlayerPage } from './chapitre-player.page';

describe('ChapitrePlayerPage', () => {
  let component: ChapitrePlayerPage;
  let fixture: ComponentFixture<ChapitrePlayerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChapitrePlayerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
