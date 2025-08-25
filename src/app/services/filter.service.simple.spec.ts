import { FilterService } from './filter.service';
import { FinancialProduct } from '../interfaces/financial-product.interface';

describe('FilterService (Simple)', () => {
  let service: FilterService;

  const mockProducts: FinancialProduct[] = [
    {
      id: 'product-1',
      name: 'Tarjeta de Crédito Visa',
      description: 'Tarjeta de crédito con beneficios especiales',
      logo: 'visa.png',
      date_release: '2024-01-15',
      date_revision: '2025-01-15'
    },
    {
      id: 'product-2',
      name: 'Cuenta de Ahorros Premium',
      description: 'Cuenta de ahorros con alta rentabilidad',
      logo: 'savings.png',
      date_release: '2024-02-20',
      date_revision: '2025-02-20'
    }
  ];

  beforeEach(() => {
    service = new FilterService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty search filters', () => {
    const filters = service.getCurrentFilters();
    expect(filters.searchTerm).toBe('');
  });

  it('should update search term', () => {
    service.updateSearchTerm('test');
    expect(service.getCurrentFilters().searchTerm).toBe('test');
  });

  it('should apply filters with no search term', () => {
    const result = service.applyFilters(mockProducts);
    expect(result).toEqual(mockProducts);
  });

  it('should filter by name (case insensitive)', () => {
    service.updateSearchTerm('TARJETA');
    const result = service.applyFilters(mockProducts);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Tarjeta de Crédito Visa');
  });

  it('should filter by description', () => {
    service.updateSearchTerm('rentabilidad');
    const result = service.applyFilters(mockProducts);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Cuenta de Ahorros Premium');
  });

  it('should filter by ID', () => {
    service.updateSearchTerm('product-1');
    const result = service.applyFilters(mockProducts);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('product-1');
  });

  it('should return empty array when no matches', () => {
    service.updateSearchTerm('NoExiste');
    const result = service.applyFilters(mockProducts);
    expect(result.length).toBe(0);
  });

  it('should handle whitespace search term', () => {
    service.updateSearchTerm('   ');
    const result = service.applyFilters(mockProducts);
    expect(result).toEqual(mockProducts);
  });

  it('should clear filters', () => {
    service.updateSearchTerm('test');
    service.clearFilters();
    expect(service.getCurrentFilters().searchTerm).toBe('');
  });

  it('should detect active filters', () => {
    expect(service.hasActiveFilters()).toBe(false);
    
    service.updateSearchTerm('test');
    expect(service.hasActiveFilters()).toBe(true);
    
    service.updateSearchTerm('');
    expect(service.hasActiveFilters()).toBe(false);
  });

  it('should provide filter stats', () => {
    const stats = service.getFilterStats(10, 5);
    expect(stats.originalCount).toBe(10);
    expect(stats.filteredCount).toBe(5);
    expect(stats.isFiltered).toBe(true);

    const noFilterStats = service.getFilterStats(7, 7);
    expect(noFilterStats.isFiltered).toBe(false);
  });
});
