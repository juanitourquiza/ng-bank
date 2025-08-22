import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { FinancialProductsService } from '../../services/financial-products.service';
import { PaginationService } from '../../services/pagination.service';
import { FilterService } from '../../services/filter.service';
import { FinancialProduct, PaginationConfig, SearchFilters } from '../../interfaces/financial-product.interface';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule],
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

  constructor(
    private financialProductsService: FinancialProductsService,
    private paginationService: PaginationService,
    private filterService: FilterService
  ) {}

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
}
