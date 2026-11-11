import type { APIResponse } from '@playwright/test';
import { ApiClient } from '../api-client';

export interface Product {
  id: number;
  title: string;
  price: number;
}

export interface ProductList {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export class ProductService extends ApiClient {
  async search(query: string): Promise<Product[]> {
    const response = await this.request.get(this.url('products/search'), {
      params: { q: query, select: 'title,price' },
    });
    const body = await this.parse<ProductList>(response, 200);
    return body.products;
  }

  list(params: { limit?: number; skip?: number }): Promise<APIResponse> {
    return this.request.get(this.url('products'), { params: { ...params, select: 'id' } });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(this.url(`products/${id}`), { params: { select: 'id' } });
  }
}
