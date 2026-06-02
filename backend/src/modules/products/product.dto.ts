export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  sku: string;
  stock: number;
  status: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  sku?: string;
  stock?: number;
  status?: string;
}