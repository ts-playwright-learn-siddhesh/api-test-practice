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
    const response = await this.request.post(this.url('carts/add'), { data: { userId, products } });
    return this.parse<Cart>(response, 201);
  }
}
