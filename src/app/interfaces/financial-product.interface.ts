export interface FinancialProduct {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

export interface FinancialProductsResponse {
  data: FinancialProduct[];
}

export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface SearchFilters {
  searchTerm: string;
}
