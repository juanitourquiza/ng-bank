import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FinancialProductsService } from '../../services/financial-products.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.html',
  styleUrls: ['./add-product.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class AddProductComponent {
  productForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private financialProductsService: FinancialProductsService
  ) {
    this.productForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      logo: ['', Validators.required],
      date_release: ['', Validators.required],
      date_revision: ['', Validators.required]
    });
  }

  onDateReleaseChange(): void {
    const releaseDate = this.productForm.get('date_release')?.value;
    if (releaseDate) {
      const revisionDate = new Date(releaseDate);
      revisionDate.setFullYear(revisionDate.getFullYear() + 1);
      this.productForm.patchValue({
        date_revision: revisionDate.toISOString().split('T')[0]
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.productForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      try {
        const formData = {
          ...this.productForm.value,
          date_release: new Date(this.productForm.value.date_release),
          date_revision: new Date(this.productForm.value.date_revision)
        };

        await this.financialProductsService.createProduct(formData).toPromise();
        this.router.navigate(['/']);
      } catch (error) {
        console.error('Error creating product:', error);
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  onReset(): void {
    this.productForm.reset();
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `${fieldName} debe tener máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }
}
