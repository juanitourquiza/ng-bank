import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { ProductList } from './product-list';
import { FinancialProductsService } from '../../services/financial-products.service';
import { FinancialProduct } from '../../interfaces/financial-product.interface';

describe('ProductList', () => {
  let component: ProductList;
  let fixture: ComponentFixture<ProductList>;
  let mockService: jasmine.SpyObj<FinancialProductsService>;

  const mockProducts: FinancialProduct[] = [
    {
      id: 'product-1',
      name: 'Tarjeta de Crédito',
      description: 'Tarjeta de crédito con beneficios especiales',
      logo: 'credit-card.png',
      date_release: '2024-01-15',
      date_revision: '2025-01-15'
    },
    {
      id: 'product-2',
      name: 'Cuenta de Ahorros',
      description: 'Cuenta de ahorros con alta rentabilidad',
      logo: 'savings.png',
      date_release: '2024-02-20',
      date_revision: '2025-02-20'
    },
    {
      id: 'product-3',
      name: 'Préstamo Personal',
      description: 'Préstamo personal con tasas preferenciales',
      logo: 'loan.png',
      date_release: '2024-03-10',
      date_revision: '2025-03-10'
    }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('FinancialProductsService', ['getFinancialProducts']);

    await TestBed.configureTestingModule({
      imports: [ProductList, HttpClientTestingModule],
      providers: [
        { provide: FinancialProductsService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductList);
    component = fixture.componentInstance;
    mockService = TestBed.inject(FinancialProductsService) as jasmine.SpyObj<FinancialProductsService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.products).toEqual([]);
    expect(component.filteredProducts).toEqual([]);
    expect(component.displayedProducts).toEqual([]);
    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('');
    expect(component.searchFilters.searchTerm).toBe('');
    expect(component.paginationConfig.currentPage).toBe(1);
    expect(component.paginationConfig.itemsPerPage).toBe(5);
    expect(component.recordsPerPageOptions).toEqual([5, 10, 20]);
  });

  it('should load financial products on init', () => {
    mockService.getFinancialProducts.and.returnValue(of(mockProducts));

    component.ngOnInit();

    expect(mockService.getFinancialProducts).toHaveBeenCalled();
    expect(component.products).toEqual(mockProducts);
    expect(component.filteredProducts).toEqual(mockProducts);
    expect(component.isLoading).toBe(false);
  });

  it('should handle loading state correctly', () => {
    mockService.getFinancialProducts.and.returnValue(of(mockProducts));

    expect(component.isLoading).toBe(false);
    
    component.loadFinancialProducts();
    
    expect(component.isLoading).toBe(true);
    expect(component.errorMessage).toBe('');
  });

  it('should handle service errors', () => {
    const errorMessage = 'Service error';
    mockService.getFinancialProducts.and.returnValue(throwError(() => errorMessage));

    component.loadFinancialProducts();

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('Error al cargar los productos financieros. Por favor, intente nuevamente.');
    expect(component.products).toEqual([]);
  });

  it('should filter products by search term in name', () => {
    component.products = mockProducts;
    component.searchFilters.searchTerm = 'Tarjeta';

    component.applyFilters();

    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].name).toBe('Tarjeta de Crédito');
  });

  it('should filter products by search term in description', () => {
    component.products = mockProducts;
    component.searchFilters.searchTerm = 'rentabilidad';

    component.applyFilters();

    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].name).toBe('Cuenta de Ahorros');
  });

  it('should filter products by search term in id', () => {
    component.products = mockProducts;
    component.searchFilters.searchTerm = 'product-2';

    component.applyFilters();

    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].id).toBe('product-2');
  });

  it('should be case insensitive when filtering', () => {
    component.products = mockProducts;
    component.searchFilters.searchTerm = 'TARJETA';

    component.applyFilters();

    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].name).toBe('Tarjeta de Crédito');
  });

  it('should reset to first page when filtering', () => {
    component.products = mockProducts;
    component.paginationConfig.currentPage = 2;
    component.searchFilters.searchTerm = 'Tarjeta';

    component.applyFilters();

    expect(component.paginationConfig.currentPage).toBe(1);
  });

  it('should reset to first page when changing records per page', () => {
    component.products = mockProducts;
    component.paginationConfig.currentPage = 2;
    component.paginationConfig.itemsPerPage = 10;

    component.onRecordsPerPageChange();

    expect(component.paginationConfig.currentPage).toBe(1);
  });

  it('should calculate total pages correctly', () => {
    component.filteredProducts = mockProducts; // 3 products
    component.paginationConfig.itemsPerPage = 2;

    expect(component.getTotalPages()).toBe(2);
  });

  it('should calculate total pages for empty results', () => {
    component.filteredProducts = [];
    component.paginationConfig.itemsPerPage = 5;

    expect(component.getTotalPages()).toBe(0);
  });

  it('should format dates correctly', () => {
    // Mock toLocaleDateString to ensure consistent output
    const originalToLocaleDateString = Date.prototype.toLocaleDateString;
    Date.prototype.toLocaleDateString = jasmine.createSpy().and.returnValue('15/01/2024');

    const formattedDate = component.formatDate('2024-01-15');
    expect(formattedDate).toBe('15/01/2024');

    // Restore original method
    Date.prototype.toLocaleDateString = originalToLocaleDateString;
  });

  it('should update displayed products correctly', () => {
    component.filteredProducts = mockProducts;
    component.paginationConfig.itemsPerPage = 2;
    component.paginationConfig.currentPage = 1;

    component.updateDisplayedProducts();

    expect(component.displayedProducts.length).toBe(2);
    expect(component.displayedProducts[0]).toBe(mockProducts[0]);
    expect(component.displayedProducts[1]).toBe(mockProducts[1]);
  });

  it('should update displayed products for second page', () => {
    component.filteredProducts = mockProducts;
    component.paginationConfig.itemsPerPage = 2;
    component.paginationConfig.currentPage = 2;

    component.updateDisplayedProducts();

    expect(component.displayedProducts.length).toBe(1);
    expect(component.displayedProducts[0]).toBe(mockProducts[2]);
  });

  it('should trigger filter application on search change', () => {
    spyOn(component, 'applyFilters');
    
    component.onSearchChange();

    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should cleanup subscriptions on destroy', () => {
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });

  it('should clear filters correctly', () => {
    component.searchFilters.searchTerm = 'test';
    spyOn(component, 'applyFilters');

    component.clearFilters();

    expect(component.searchFilters.searchTerm).toBe('');
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should get results text for zero results', () => {
    component.paginationConfig.totalItems = 0;
    expect(component.getResultsText()).toBe('0 Resultados');
  });

  it('should get results text for one result', () => {
    component.paginationConfig.totalItems = 1;
    expect(component.getResultsText()).toBe('1 Resultado');
  });

  it('should get results text for multiple results', () => {
    component.paginationConfig.totalItems = 5;
    expect(component.getResultsText()).toBe('5 Resultados');
  });

  it('should update total items and pagination when applying filters', () => {
    component.products = mockProducts;
    component.searchFilters.searchTerm = 'Tarjeta';

    component.applyFilters();

    expect(component.paginationConfig.totalItems).toBe(1);
    expect(component.paginationConfig.currentPage).toBe(1);
  });
});
