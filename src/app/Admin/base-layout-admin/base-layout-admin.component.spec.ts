import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BaseLayoutAdminComponent } from './base-layout-admin.component';

describe('BaseLayoutAdminComponent', () => {
  let component: BaseLayoutAdminComponent;
  let fixture: ComponentFixture<BaseLayoutAdminComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BaseLayoutAdminComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseLayoutAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
