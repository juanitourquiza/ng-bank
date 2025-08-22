import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FinancialProduct, SearchFilters } from '../interfaces/financial-product.interface';

/**
 * Servicio encargado de manejar la lógica de filtrado de productos
 * Aplica el principio de Single Responsibility
 */
@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private searchFiltersSubject = new BehaviorSubject<SearchFilters>({
    searchTerm: ''
  });

  public searchFilters$: Observable<SearchFilters> = this.searchFiltersSubject.asObservable();

  /**
   * Actualiza los filtros de búsqueda
   */
  updateSearchFilters(filters: Partial<SearchFilters>): void {
    const currentFilters = this.searchFiltersSubject.value;
    const newFilters = { ...currentFilters, ...filters };
    this.searchFiltersSubject.next(newFilters);
  }

  /**
   * Obtiene los filtros actuales
   */
  getCurrentFilters(): SearchFilters {
    return this.searchFiltersSubject.value;
  }

  /**
   * Aplica filtros a una lista de productos financieros
   */
  applyFilters(products: FinancialProduct[], filters?: SearchFilters): FinancialProduct[] {
    const currentFilters = filters || this.getCurrentFilters();
    
    return products.filter(product => this.matchesSearchCriteria(product, currentFilters));
  }

  /**
   * Verifica si un producto coincide con los criterios de búsqueda
   */
  private matchesSearchCriteria(product: FinancialProduct, filters: SearchFilters): boolean {
    return this.matchesSearchTerm(product, filters.searchTerm);
  }

  /**
   * Verifica si un producto coincide con el término de búsqueda
   */
  private matchesSearchTerm(product: FinancialProduct, searchTerm: string): boolean {
    if (!searchTerm?.trim()) {
      return true;
    }

    const term = searchTerm.toLowerCase().trim();
    
    // Busca en nombre, descripción e ID
    return this.containsSearchTerm(product.name, term) ||
           this.containsSearchTerm(product.description, term) ||
           this.containsSearchTerm(product.id, term);
  }

  /**
   * Verifica si un texto contiene el término de búsqueda (case insensitive)
   */
  private containsSearchTerm(text: string, searchTerm: string): boolean {
    return text?.toLowerCase().includes(searchTerm) ?? false;
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.searchFiltersSubject.next({
      searchTerm: ''
    });
  }

  /**
   * Actualiza solo el término de búsqueda
   */
  updateSearchTerm(searchTerm: string): void {
    this.updateSearchFilters({ searchTerm });
  }

  /**
   * Verifica si hay filtros aplicados
   */
  hasActiveFilters(): boolean {
    const filters = this.getCurrentFilters();
    return Boolean(filters.searchTerm?.trim());
  }

  /**
   * Obtiene estadísticas de filtrado
   */
  getFilterStats(originalCount: number, filteredCount: number): {
    originalCount: number;
    filteredCount: number;
    isFiltered: boolean;
  } {
    return {
      originalCount,
      filteredCount,
      isFiltered: originalCount !== filteredCount
    };
  }
}
