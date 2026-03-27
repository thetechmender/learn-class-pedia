import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalAssessment } from './final-assessment';

describe('FinalAssessment', () => {
  let component: FinalAssessment;
  let fixture: ComponentFixture<FinalAssessment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalAssessment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinalAssessment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
