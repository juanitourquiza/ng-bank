import { Routes } from '@angular/router';
import { ProductList } from './components/product-list/product-list';
import { AddProductComponent } from './components/add-product/add-product';

export const routes: Routes = [
  { path: '', component: ProductList },
  { path: 'add-product', component: AddProductComponent },
  { path: '**', redirectTo: '' }
];
