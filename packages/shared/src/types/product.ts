/**
 * 商品相关类型 — 镜像后端 ProductListItem / ProductDetail / SkuDTO
 */

export interface ProductListItem {
  id: string;
  title: string;
  slug: string;
  brand: string | null;
  status: string;
  minPrice: string | null;
  maxPrice: string | null;
  totalSales: number;
  primaryImage: string | null;
  createdAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface SkuDTO {
  id: string;
  skuCode: string;
  price: string;
  comparePrice: string | null;
  stock: number;
  attributes: Record<string, string> | null;
  status: string;
}

export interface CategoryBasic {
  id: string;
  name: string;
  slug: string;
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  attributes: unknown;
  updatedAt: string;
  images: ProductImage[];
  skus: SkuDTO[];
  categories: CategoryBasic[];
}
