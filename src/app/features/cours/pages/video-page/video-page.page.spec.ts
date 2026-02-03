import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoPagePage } from './video-page.page';

describe('VideoPagePage', () => {
  let component: VideoPagePage;
  let fixture: ComponentFixture<VideoPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
