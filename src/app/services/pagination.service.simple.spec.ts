import { PaginationService } from './pagination.service';
import { PaginationConfig } from '../interfaces/financial-product.interface';

describe('PaginationService (Simple)', () => {
  let service: PaginationService;

  beforeEach(() => {
    service = new PaginationService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default values', () => {
    service.paginationConfig$.subscribe(config => {
      expect(config.currentPage).toBe(1);
      expect(config.itemsPerPage).toBe(5);
      expect(config.totalItems).toBe(0);
    });
  });

  it('should update pagination config', () => {
    const newConfig: Partial<PaginationConfig> = {
      currentPage: 2,
      itemsPerPage: 10,
      totalItems: 50
    };

    service.updatePaginationConfig(newConfig);

    expect(service.getCurrentConfig().currentPage).toBe(2);
    expect(service.getCurrentConfig().itemsPerPage).toBe(10);
    expect(service.getCurrentConfig().totalItems).toBe(50);
  });

  it('should calculate total pages correctly', () => {
    expect(service.calculateTotalPages(25, 10)).toBe(3);
    expect(service.calculateTotalPages(20, 10)).toBe(2);
    expect(service.calculateTotalPages(0, 10)).toBe(0);
  });

  it('should get page items correctly', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    const page1 = service.getPageItems(items, 1, 3);
    expect(page1).toEqual([1, 2, 3]);

    const page2 = service.getPageItems(items, 2, 3);
    expect(page2).toEqual([4, 5, 6]);
  });

  it('should navigate to next page', () => {
    service.updatePaginationConfig({ 
      currentPage: 1, 
      totalItems: 20, 
      itemsPerPage: 5 
    });

    service.goToNextPage();
    expect(service.getCurrentConfig().currentPage).toBe(2);
  });

  it('should navigate to previous page', () => {
    service.updatePaginationConfig({ currentPage: 3 });
    service.goToPreviousPage();
    expect(service.getCurrentConfig().currentPage).toBe(2);
  });

  it('should change items per page', () => {
    service.changeItemsPerPage(15);
    const config = service.getCurrentConfig();
    expect(config.itemsPerPage).toBe(15);
    expect(config.currentPage).toBe(1);
  });

  it('should reset to defaults', () => {
    service.updatePaginationConfig({ currentPage: 5, itemsPerPage: 20 });
    service.reset();
    
    const config = service.getCurrentConfig();
    expect(config.currentPage).toBe(1);
    expect(config.itemsPerPage).toBe(5);
    expect(config.totalItems).toBe(0);
  });

  it('should generate results text correctly', () => {
    expect(service.getResultsText(0)).toBe('0 Resultados');
    expect(service.getResultsText(1)).toBe('1 Resultado');
    expect(service.getResultsText(5)).toBe('5 Resultados');
  });
});
