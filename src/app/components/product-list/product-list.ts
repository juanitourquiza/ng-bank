import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { FinancialProductsService } from '../../services/financial-products.service';
import { PaginationService } from '../../services/pagination.service';
import { FilterService } from '../../services/filter.service';
import { FinancialProduct, PaginationConfig, SearchFilters } from '../../interfaces/financial-product.interface';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Estados principales
  products: FinancialProduct[] = [];
  filteredProducts: FinancialProduct[] = [];
  displayedProducts: FinancialProduct[] = [];
  isLoading = false;
  errorMessage = '';

  // Configuración de búsqueda - ahora reactiva
  searchFilters: SearchFilters = { searchTerm: '' };

  // Configuración de paginación - ahora reactiva
  paginationConfig: PaginationConfig = {
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 0
  };

  // Opciones para el selector de cantidad de registros
  recordsPerPageOptions = [5, 10, 20];

  // Modal de agregar producto
  showAddProductModal = false;
  productForm: FormGroup;
  isSubmitting = false;

  constructor(
    private financialProductsService: FinancialProductsService,
    private paginationService: PaginationService,
    private filterService: FilterService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.productForm = this.createForm();
  }

  ngOnInit(): void {
    this.initializeServices();
    this.loadFinancialProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa las suscripciones a los servicios reactivos
   */
  private initializeServices(): void {
    // Suscribirse a cambios en filtros y paginación
    combineLatest([
      this.filterService.searchFilters$,
      this.paginationService.paginationConfig$
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([filters, pagination]) => {
        this.searchFilters = filters;
        this.paginationConfig = pagination;
        this.updateDisplayedProducts();
      });
  }

  /**
   * Carga los productos financieros desde la API
   */
  loadFinancialProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.financialProductsService.getFinancialProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.products = products;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Error al cargar los productos financieros. Por favor, intente nuevamente.';
          this.isLoading = false;
          console.error('Error loading products:', error);
        }
      });
  }

  /**
   * Aplica filtros de búsqueda y actualiza la paginación
   */
  applyFilters(): void {
    // Usar el servicio de filtros
    this.filteredProducts = this.filterService.applyFilters(this.products);

    // Actualizar la configuración de paginación
    this.paginationService.updatePaginationConfig({
      totalItems: this.filteredProducts.length,
      currentPage: 1 // Reset a la primera página
    });
  }

  /**
   * Actualiza los productos que se muestran en la página actual
   */
  updateDisplayedProducts(): void {
    // Usar el servicio de paginación
    this.displayedProducts = this.paginationService.getPageItems(
      this.filteredProducts,
      this.paginationConfig.currentPage,
      this.paginationConfig.itemsPerPage
    );
  }

  /**
   * Maneja el cambio en el campo de búsqueda
   */
  onSearchChange(): void {
    // Usar el servicio de filtros
    this.filterService.updateSearchTerm(this.searchFilters.searchTerm);
    this.applyFilters();
  }

  /**
   * Maneja el cambio en la cantidad de registros por página
   */
  onRecordsPerPageChange(): void {
    // Usar el servicio de paginación
    this.paginationService.changeItemsPerPage(this.paginationConfig.itemsPerPage);
  }

  /**
   * Calcula el número total de páginas
   */
  getTotalPages(): number {
    return this.paginationService.calculateTotalPages(
      this.paginationConfig.totalItems,
      this.paginationConfig.itemsPerPage
    );
  }

  /**
   * Obtiene el texto descriptivo de la cantidad de resultados
   */
  getResultsText(): string {
    return this.paginationService.getResultsText(this.displayedProducts.length);
  }

  /**
   * Formatea la fecha para mostrar en la tabla
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Reinicia los filtros y recarga los datos
   */
  clearFilters(): void {
    // Usar el servicio de filtros
    this.filterService.clearFilters();
    this.applyFilters();
  }

  /**
   * Navega a la página siguiente
   */
  goToNextPage(): void {
    this.paginationService.goToNextPage();
  }

  /**
   * Navega a la página anterior
   */
  goToPreviousPage(): void {
    this.paginationService.goToPreviousPage();
  }

  /**
   * Muestra el modal de agregar producto
   */
  navigateToAddProduct(): void {
    this.showAddProductModal = true;
  }

  /**
   * Crea el formulario reactivo para agregar productos
   */
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

  /**
   * Actualiza la fecha de revisión cuando cambia la fecha de liberación
   */
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

  /**
   * Envía el formulario para crear un nuevo producto
   */
  async onSubmitProduct(): Promise<void> {
    if (this.productForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      try {
        const formData = {
          ...this.productForm.value,
          date_release: new Date(this.productForm.value.date_release),
          date_revision: new Date(this.productForm.value.date_revision)
        };

        await this.financialProductsService.createProduct(formData).toPromise();
        this.closeModal();
        this.loadFinancialProducts(); // Recargar la lista
      } catch (error) {
        console.error('Error creating product:', error);
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  /**
   * Reinicia el formulario
   */
  onResetProduct(): void {
    this.productForm.reset();
  }

  /**
   * Cierra el modal
   */
  closeModal(): void {
    this.showAddProductModal = false;
    this.productForm.reset();
    this.isSubmitting = false;
  }

  /**
   * Maneja el clic en el backdrop del modal
   */
  onModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  /**
   * Obtiene mensaje de error para un campo específico
   */
  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `${fieldName} debe tener máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }

  /**
   * Verifica si un campo es inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }
}
