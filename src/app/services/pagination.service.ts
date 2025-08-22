import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PaginationConfig } from '../interfaces/financial-product.interface';

/**
 * Servicio encargado de manejar la lógica de paginación
 * Aplica el principio de Single Responsibility
 */
@Injectable({
  providedIn: 'root'
})
export class PaginationService {
  private paginationConfigSubject = new BehaviorSubject<PaginationConfig>({
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 0
  });

  public paginationConfig$: Observable<PaginationConfig> = this.paginationConfigSubject.asObservable();

  /**
   * Actualiza la configuración de paginación
   */
  updatePaginationConfig(config: Partial<PaginationConfig>): void {
    const currentConfig = this.paginationConfigSubject.value;
    const newConfig = { ...currentConfig, ...config };
    this.paginationConfigSubject.next(newConfig);
  }

  /**
   * Obtiene la configuración actual de paginación
   */
  getCurrentConfig(): PaginationConfig {
    return this.paginationConfigSubject.value;
  }

  /**
   * Calcula el número total de páginas
   */
  calculateTotalPages(totalItems: number, itemsPerPage: number): number {
    return Math.ceil(totalItems / itemsPerPage);
  }

  /**
   * Calcula los elementos a mostrar en la página actual
   */
  getPageItems<T>(items: T[], currentPage: number, itemsPerPage: number): T[] {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }

  /**
   * Navega a la página siguiente
   */
  goToNextPage(): void {
    const config = this.getCurrentConfig();
    const totalPages = this.calculateTotalPages(config.totalItems, config.itemsPerPage);
    
    if (config.currentPage < totalPages) {
      this.updatePaginationConfig({ currentPage: config.currentPage + 1 });
    }
  }

  /**
   * Navega a la página anterior
   */
  goToPreviousPage(): void {
    const config = this.getCurrentConfig();
    
    if (config.currentPage > 1) {
      this.updatePaginationConfig({ currentPage: config.currentPage - 1 });
    }
  }

  /**
   * Cambia la cantidad de elementos por página
   */
  changeItemsPerPage(itemsPerPage: number): void {
    this.updatePaginationConfig({ 
      itemsPerPage, 
      currentPage: 1 // Reset a la primera página
    });
  }

  /**
   * Resetea la paginación a los valores por defecto
   */
  reset(): void {
    this.paginationConfigSubject.next({
      currentPage: 1,
      itemsPerPage: 5,
      totalItems: 0
    });
  }

  /**
   * Obtiene el texto descriptivo de los resultados
   */
  getResultsText(totalItems: number): string {
    if (totalItems === 0) {
      return '0 Resultados';
    }
    
    if (totalItems === 1) {
      return '1 Resultado';
    }
    
    return `${totalItems} Resultados`;
  }
}
