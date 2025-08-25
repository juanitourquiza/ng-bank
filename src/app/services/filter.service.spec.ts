import { TestBed } from '@angular/core/testing';
import { FilterService } from './filter.service';
import { FinancialProduct, SearchFilters } from '../interfaces/financial-product.interface';

describe('FilterService', () => {
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
    },
    {
      id: 'LOAN-003',
      name: 'Préstamo Personal',
      description: 'Préstamo personal con tasas preferenciales',
      logo: 'loan.png',
      date_release: '2024-03-10',
      date_revision: '2025-03-10'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty search filters', () => {
    service.searchFilters$.subscribe(filters => {
      expect(filters.searchTerm).toBe('');
    });
  });

  it('should update search filters', () => {
    const newFilters: Partial<SearchFilters> = { searchTerm: 'test' };
    service.updateSearchFilters(newFilters);

    service.searchFilters$.subscribe(filters => {
      expect(filters.searchTerm).toBe('test');
    });
  });

  it('should get current filters', () => {
    service.updateSearchTerm('current test');
    const filters = service.getCurrentFilters();
    expect(filters.searchTerm).toBe('current test');
  });

  it('should apply filters and return all products when no search term', () => {
    const result = service.applyFilters(mockProducts);
    expect(result).toEqual(mockProducts);
    expect(result.length).toBe(3);
  });

  it('should filter products by name (case insensitive)', () => {
    service.updateSearchTerm('TARJETA');
    const result = service.applyFilters(mockProducts);
    
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Tarjeta de Crédito Visa');
  });

  it('should filter products by description', () => {
    service.updateSearchTerm('rentabilidad');
    const result = service.applyFilters(mockProducts);
    
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Cuenta de Ahorros Premium');
  });

  it('should filter products by ID', () => {
    service.updateSearchTerm('LOAN-003');
    const result = service.applyFilters(mockProducts);
    
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('LOAN-003');
  });

  it('should handle partial matches', () => {
    service.updateSearchTerm('Crédito');
    const result = service.applyFilters(mockProducts);
    
    expect(result.length).toBe(1);
    expect(result[0].name).toContain('Crédito');
  });

  it('should return empty array when no matches found', () => {
    service.updateSearchTerm('NoExiste');
    const result = service.applyFilters(mockProducts);
    
    expect(result.length).toBe(0);
  });

  it('should handle empty search term', () => {
    service.updateSearchTerm('');
    const result = service.applyFilters(mockProducts);
    
    expect(result).toEqual(mockProducts);
  });

  it('should handle whitespace-only search term', () => {
    service.updateSearchTerm('   ');
    const result = service.applyFilters(mockProducts);
    
    expect(result).toEqual(mockProducts);
  });

  it('should clear all filters', () => {
    service.updateSearchTerm('test');
    service.clearFilters();

    service.searchFilters$.subscribe(filters => {
      expect(filters.searchTerm).toBe('');
    });
  });

  it('should update search term directly', () => {
    service.updateSearchTerm('direct update');
    
    const filters = service.getCurrentFilters();
    expect(filters.searchTerm).toBe('direct update');
  });

  it('should detect active filters correctly', () => {
    expect(service.hasActiveFilters()).toBe(false);

    service.updateSearchTerm('test');
    expect(service.hasActiveFilters()).toBe(true);

    service.updateSearchTerm('');
    expect(service.hasActiveFilters()).toBe(false);

    service.updateSearchTerm('   ');
    expect(service.hasActiveFilters()).toBe(false);
  });

  it('should provide correct filter stats', () => {
    const stats = service.getFilterStats(10, 5);
    
    expect(stats.originalCount).toBe(10);
    expect(stats.filteredCount).toBe(5);
    expect(stats.isFiltered).toBe(true);
  });

  it('should indicate no filtering when counts are equal', () => {
    const stats = service.getFilterStats(7, 7);
    
    expect(stats.originalCount).toBe(7);
    expect(stats.filteredCount).toBe(7);
    expect(stats.isFiltered).toBe(false);
  });

  it('should apply custom filters parameter', () => {
    const customFilters: SearchFilters = { searchTerm: 'Premium' };
    const result = service.applyFilters(mockProducts, customFilters);
    
    expect(result.length).toBe(1);
    expect(result[0].name).toContain('Premium');
  });

  it('should handle null or undefined text in search', () => {
    // Test with product that might have null/undefined fields
    const testProducts: FinancialProduct[] = [
      {
        id: 'test',
        name: 'Test Product',
        description: '',
        logo: 'test.png',
        date_release: '2024-01-01',
        date_revision: '2025-01-01'
      }
    ];

    service.updateSearchTerm('nonexistent');
    const result = service.applyFilters(testProducts);
    
    expect(result.length).toBe(0);
  });
});
