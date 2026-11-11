import type { APIResponse } from '@playwright/test';
import { ApiClient } from '../api-client';

export interface CartItem {
  id: number;
  quantity: number;
}

export interface CartProduct extends CartItem {
  title: string;
  price: number;
  total: number;
}

export interface Cart {
  id: number;
  userId: number;
  products: CartProduct[];
  total: number;
  discountedTotal: number;
  totalProducts: number;
  totalQuantity: number;
}

export class CartService extends ApiClient {
  async add(userId: number, products: CartItem[]): Promise<Cart> {
    const response = await this.addRequest({ userId, products });
    return this.parse<Cart>(response, 201);
  }

  addRequest(data: unknown): Promise<APIResponse> {
    return this.request.post(this.url('carts/add'), { data });
  }

  addAuthenticated(data: unknown, token = this.token): Promise<APIResponse> {
    return this.request.post(this.url('auth/carts/add'), { headers: this.authHeaders(token), data });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(this.url(`carts/${id}`));
  }
}
