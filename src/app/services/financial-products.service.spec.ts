import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FinancialProductsService } from './financial-products.service';
import { FinancialProduct, FinancialProductsResponse } from '../interfaces/financial-product.interface';

describe('FinancialProductsService', () => {
  let service: FinancialProductsService;
  let httpMock: HttpTestingController;

  const mockProducts: FinancialProduct[] = [
    {
      id: 'test-1',
      name: 'Test Product 1',
      description: 'Test Description 1',
      logo: 'test-logo-1.png',
      date_release: '2024-01-01',
      date_revision: '2025-01-01'
    },
    {
      id: 'test-2',
      name: 'Test Product 2',
      description: 'Test Description 2',
      logo: 'test-logo-2.png',
      date_release: '2024-02-01',
      date_revision: '2025-02-01'
    }
  ];

  const mockApiResponse: FinancialProductsResponse = {
    data: mockProducts
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FinancialProductsService]
    });
    service = TestBed.inject(FinancialProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get financial products successfully', () => {
    service.getFinancialProducts().subscribe(products => {
      expect(products).toEqual(mockProducts);
      expect(products.length).toBe(2);
      expect(products[0].id).toBe('test-1');
      expect(products[1].name).toBe('Test Product 2');
    });

    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    expect(req.request.method).toBe('GET');
    req.flush(mockApiResponse);
  });

  it('should handle HTTP errors gracefully', () => {
    const errorMessage = 'Server error';

    service.getFinancialProducts().subscribe({
      next: () => fail('Expected error, but got success'),
      error: (error) => {
        expect(error).toBeTruthy();
        expect(typeof error).toBe('string');
      }
    });

    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle network errors', () => {
    service.getFinancialProducts().subscribe({
      next: () => fail('Expected error, but got success'),
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });

    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.error(new ErrorEvent('Network error'));
  });

  it('should map response data correctly', () => {
    const customResponse: FinancialProductsResponse = {
      data: [mockProducts[0]]
    };

    service.getFinancialProducts().subscribe(products => {
      expect(products).toEqual([mockProducts[0]]);
      expect(products.length).toBe(1);
    });

    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush(customResponse);
  });
});
