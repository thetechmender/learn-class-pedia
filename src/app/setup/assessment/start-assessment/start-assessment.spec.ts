import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartAssessment } from './start-assessment';

describe('StartAssessment', () => {
  let component: StartAssessment;
  let fixture: ComponentFixture<StartAssessment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartAssessment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartAssessment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
