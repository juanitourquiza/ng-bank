import { TestBed } from '@angular/core/testing';
import { PaginationService } from './pagination.service';
import { PaginationConfig } from '../interfaces/financial-product.interface';

describe('PaginationService', () => {
  let service: PaginationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaginationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default pagination config', () => {
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

    service.paginationConfig$.subscribe(config => {
      expect(config.currentPage).toBe(2);
      expect(config.itemsPerPage).toBe(10);
      expect(config.totalItems).toBe(50);
    });
  });

  it('should get current pagination config', () => {
    const newConfig: Partial<PaginationConfig> = {
      currentPage: 3,
      itemsPerPage: 20
    };

    service.updatePaginationConfig(newConfig);
    const currentConfig = service.getCurrentConfig();

    expect(currentConfig.currentPage).toBe(3);
    expect(currentConfig.itemsPerPage).toBe(20);
  });

  it('should calculate total pages correctly', () => {
    expect(service.calculateTotalPages(25, 10)).toBe(3);
    expect(service.calculateTotalPages(20, 10)).toBe(2);
    expect(service.calculateTotalPages(0, 10)).toBe(0);
    expect(service.calculateTotalPages(1, 10)).toBe(1);
  });

  it('should get page items correctly', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    const page1 = service.getPageItems(items, 1, 3);
    expect(page1).toEqual([1, 2, 3]);

    const page2 = service.getPageItems(items, 2, 3);
    expect(page2).toEqual([4, 5, 6]);

    const page4 = service.getPageItems(items, 4, 3);
    expect(page4).toEqual([10]);
  });

  it('should navigate to next page if valid', () => {
    service.updatePaginationConfig({ 
      currentPage: 1, 
      totalItems: 20, 
      itemsPerPage: 5 
    });

    service.goToNextPage();

    service.paginationConfig$.subscribe(config => {
      expect(config.currentPage).toBe(2);
    });
  });

  it('should not navigate to next page if at last page', () => {
    service.updatePaginationConfig({ 
      currentPage: 4, 
      totalItems: 20, 
      itemsPerPage: 5 
    });

    service.goToNextPage();

    service.paginationConfig$.subscribe(config => {
      expect(config.currentPage).toBe(4);
    });
  });

  it('should navigate to previous page if valid', () => {
    service.updatePaginationConfig({ currentPage: 3 });

    service.goToPreviousPage();

    service.paginationConfig$.subscribe(config => {
      expect(config.currentPage).toBe(2);
    });
  });

  it('should not navigate to previous page if at first page', () => {
    service.updatePaginationConfig({ currentPage: 1 });

    service.goToPreviousPage();

    service.paginationConfig$.subscribe(config => {
      expect(config.currentPage).toBe(1);
    });
  });

  it('should change items per page and reset to first page', () => {
    service.updatePaginationConfig({ currentPage: 3 });
    
    service.changeItemsPerPage(10);

    service.paginationConfig$.subscribe(config => {
      expect(config.itemsPerPage).toBe(10);
      expect(config.currentPage).toBe(1);
    });
  });

  it('should reset pagination to default values', () => {
    service.updatePaginationConfig({ 
      currentPage: 5, 
      itemsPerPage: 20, 
      totalItems: 100 
    });

    service.reset();

    service.paginationConfig$.subscribe(config => {
      expect(config.currentPage).toBe(1);
      expect(config.itemsPerPage).toBe(5);
      expect(config.totalItems).toBe(0);
    });
  });

  it('should generate correct results text', () => {
    expect(service.getResultsText(0)).toBe('0 Resultados');
    expect(service.getResultsText(1)).toBe('1 Resultado');
    expect(service.getResultsText(5)).toBe('5 Resultados');
    expect(service.getResultsText(100)).toBe('100 Resultados');
  });
});
