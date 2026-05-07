import { Component, Output, EventEmitter, inject, signal, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { AssessmentService } from '../../../services/assessment.service';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-update-phone-number',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-phone-number.html',
  styleUrl: './update-phone-number.sass',
})
export class UpdatePhoneNumber implements AfterViewInit {
  @ViewChild('phoneInput') phoneInput!: ElementRef;
  @Output() close = new EventEmitter<void>();
  @Output() phoneUpdated = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private assessmentService = inject(AssessmentService);
  private toastr = inject(ToastrService);
  phoneForm: FormGroup;
  isSubmitting = signal(false);
  private iti: any;

  constructor() {
    this.phoneForm = this.fb.group({
      phoneNumber: ['', [Validators.required]],
      phoneCountryCode: ['', Validators.required]
    });
  }

  ngAfterViewInit() {
    // Dynamically import intl-tel-input
    import('intl-tel-input').then((module) => {
      const intlTelInput = module.default;
      const input = this.phoneInput.nativeElement;

      this.iti = intlTelInput(input, {
        initialCountry: 'pk',
        separateDialCode: true
      } as any);

      // Update form when country changes
      input.addEventListener('countrychange', () => {
        const countryData = this.iti.getSelectedCountryData();
        this.phoneForm.patchValue({
          phoneCountryCode: '+' + countryData.dialCode
        });
      });

      // Set initial country code
      const initialCountryData = this.iti.getSelectedCountryData();
      this.phoneForm.patchValue({
        phoneCountryCode: '+' + initialCountryData.dialCode
      });
    });
  }

  onClose() {
    this.close.emit();
  }

  onCancel() {
    this.close.emit();
  }

  onSubmit() {
    if (this.phoneForm.invalid) {
      Object.keys(this.phoneForm.controls).forEach(key => {
        this.phoneForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting.set(true);

    // Get phone number from form value (intl-tel-input handles the country code separately)
    const phoneNumber = this.phoneForm.value.phoneNumber;

    const payload = {
      phoneCountryCode: this.phoneForm.value.phoneCountryCode,
      phoneNumber: phoneNumber.trim()
    };


    this.http.post(`${environment.API_URL}/CustomerProfile/UpdatePhoneNumber`, payload, { withCredentials: true })
      .subscribe({
        next: (response: any) => {
          this.isSubmitting.set(false);
          if (response?.isSuccess) {
            // Update hasPhone signal in assessment service
            this.assessmentService.hasPhone.set(true);
            this.phoneUpdated.emit();
            this.close.emit();
          }
          else {
            this.toastr.warning(response?.errorMessage);
          }
        },
        error: (error) => {
          console.error('[UpdatePhoneNumber] Error:', error);
          this.isSubmitting.set(false);
        }
      });
  }

  get phoneNumber() {
    return this.phoneForm.get('phoneNumber');
  }
}
