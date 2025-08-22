import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FinancialProduct, FinancialProductsResponse } from '../interfaces/financial-product.interface';

@Injectable({
  providedIn: 'root'
})
export class FinancialProductsService {
  private readonly baseUrl = 'http://localhost:3002';

  constructor(private http: HttpClient) {}

  getFinancialProducts(): Observable<FinancialProduct[]> {
    return this.http.get<FinancialProductsResponse>(`${this.baseUrl}/bp/products`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  createProduct(product: Omit<FinancialProduct, 'id'>): Observable<FinancialProduct> {
    return this.http.post<FinancialProduct>(`${this.baseUrl}/bp/products`, product)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
