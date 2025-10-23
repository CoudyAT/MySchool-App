import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddCoursComponent } from './add-cours.component';

describe('AddCoursComponent', () => {
  let component: AddCoursComponent;
  let fixture: ComponentFixture<AddCoursComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AddCoursComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
