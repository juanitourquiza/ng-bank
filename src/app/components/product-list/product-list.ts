import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
  styleUrl: './product-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
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

  // Modal de agregar/editar producto
  showAddProductModal = false;
  productForm: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  editingProductId: string | null = null;

  // Dropdown de acciones
  activeDropdownId: string | null = null;

  // Modal de confirmación de eliminación
  showDeleteModal = false;
  productToDelete: FinancialProduct | null = null;

  constructor(
    private financialProductsService: FinancialProductsService,
    private paginationService: PaginationService,
    private filterService: FilterService,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.productForm = this.createForm();
  }

  ngOnInit(): void {
    this.setupGlobalClickListener();
    this.loadFinancialProducts();
    this.initializeServices();
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
   * Carga la lista de productos financieros desde el servicio
   */
  loadFinancialProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.financialProductsService.getFinancialProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.products = products;
          this.filteredProducts = products; // Inicializar productos filtrados
          this.isLoading = false;
          
          // Inicializar paginación con todos los productos
          this.paginationService.updatePaginationConfig({
            totalItems: products.length,
            currentPage: 1
          });
          
          // Mostrar productos directamente sin filtros iniciales
          this.updateDisplayedProducts();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading financial products:', error);
          this.errorMessage = 'Error al cargar los productos financieros. Por favor, intente nuevamente.';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Aplica filtros de búsqueda y actualiza la paginación
   */
  applyFilters(): void {
    // Si no hay productos cargados, salir
    if (!this.products || this.products.length === 0) {
      this.filteredProducts = [];
      this.displayedProducts = [];
      return;
    }

    // Usar el servicio de filtros
    this.filteredProducts = this.filterService.applyFilters(this.products);

    // Actualizar la configuración de paginación
    this.paginationService.updatePaginationConfig({
      totalItems: this.filteredProducts.length,
      currentPage: 1 // Reset a la primera página
    });
    
    // Actualizar productos mostrados inmediatamente
    this.updateDisplayedProducts();
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
   * Formatea la fecha para input de tipo date
   */
  formatDateForInput(dateString: string | Date): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
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
    this.isEditMode = false;
    this.editingProductId = null;
    this.productForm.reset();
    this.showAddProductModal = true;
  }

  /**
   * Maneja el toggle del dropdown de acciones
   */
  toggleDropdown(productId: string, event: Event): void {
    event.stopPropagation();
    this.activeDropdownId = this.activeDropdownId === productId ? null : productId;
  }

  /**
   * Abre el modal de edición con los datos del producto
   */
  editProduct(product: FinancialProduct): void {
    this.isEditMode = true;
    this.editingProductId = product.id;
    
    // Precargar datos en el formulario
    this.productForm.patchValue({
      id: product.id,
      name: product.name,
      description: product.description,
      logo: product.logo,
      date_release: this.formatDateForInput(product.date_release),
      date_revision: this.formatDateForInput(product.date_revision)
    });
    
    this.showAddProductModal = true;
    this.activeDropdownId = null;
  }

  /**
   * Abre el modal de confirmación de eliminación
   */
  confirmDeleteProduct(product: FinancialProduct): void {
    this.productToDelete = product;
    this.showDeleteModal = true;
    this.activeDropdownId = null;
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
   * Resetea el formulario del producto
   */
  onResetProduct(): void {
    this.productForm.reset();
  }

  /**
   * Maneja el envío del formulario para crear o actualizar productos
   */
  onSubmitProduct(): void {
    if (this.productForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.productForm.value as FinancialProduct;
      
      if (this.isEditMode && this.editingProductId) {
        // Actualizar producto existente
        this.financialProductsService.updateProduct(this.editingProductId, formData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.isSubmitting = false;
              this.closeModal();
              this.loadFinancialProducts();
              this.cdr.markForCheck();
            },
            error: (error) => {
              console.error('Error updating product:', error);
              this.isSubmitting = false;
              this.cdr.markForCheck();
            }
          });
      } else {
        // Crear nuevo producto
        this.financialProductsService.createProduct(formData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.isSubmitting = false;
              this.closeModal();
              this.loadFinancialProducts();
              this.cdr.markForCheck();
            },
            error: (error) => {
              console.error('Error creating product:', error);
              this.isSubmitting = false;
              this.cdr.markForCheck();
            }
          });
      }
    }
  }

  /**
   * Cierra el modal
   */
  closeModal(): void {
    this.showAddProductModal = false;
    this.productForm.reset();
    this.isSubmitting = false;
    this.isEditMode = false;
    this.editingProductId = null;
  }

  /**
   * Cierra el modal de confirmación de eliminación
   */
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  /**
   * Confirma y ejecuta la eliminación del producto
   */
  deleteProduct(): void {
    if (this.productToDelete && !this.isSubmitting) {
      this.isSubmitting = true;
      
      this.financialProductsService.deleteProduct(this.productToDelete.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.closeDeleteModal();
            this.loadFinancialProducts();
            this.isSubmitting = false;
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            this.isSubmitting = false;
            this.cdr.markForCheck();
          }
        });
    }
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

  /**
   * Configura el listener global para cerrar dropdown al hacer clic fuera
   */
  private setupGlobalClickListener(): void {
    document.addEventListener('click', (event) => {
      if (this.activeDropdownId) {
        const target = event.target as HTMLElement;
        const dropdown = target.closest('.actions-menu');
        if (!dropdown) {
          this.activeDropdownId = null;
          this.cdr.markForCheck(); // Manual change detection
        }
      }
    });
  }

  /**
   * TrackBy function para optimizar renderizado de lista
   */
  trackByProductId(index: number, product: FinancialProduct): string | number {
    return product ? product.id : index;
  }

  /**
   * TrackBy function para opciones de paginación
   */
  trackByValue(index: number, value: any): any {
    return value !== null && value !== undefined ? value : index;
  }
}
