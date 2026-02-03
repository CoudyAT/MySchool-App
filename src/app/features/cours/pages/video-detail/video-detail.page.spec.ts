import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoDetailPage } from './video-detail.page';

describe('VideoDetailPage', () => {
  let component: VideoDetailPage;
  let fixture: ComponentFixture<VideoDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
