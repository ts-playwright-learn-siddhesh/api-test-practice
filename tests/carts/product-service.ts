import { ApiClient } from '../api-client';

export interface Product {
  id: number;
  title: string;
  price: number;
}

interface ProductList {
  products: Product[];
}

export class ProductService extends ApiClient {
  async search(query: string): Promise<Product[]> {
    const response = await this.request.get(this.url('products/search'), {
      params: { q: query, select: 'title,price' },
    });
    const body = await this.parse<ProductList>(response, 200);
    return body.products;
  }
}
