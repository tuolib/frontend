/**
 * 分类相关类型 — 镜像后端 CategoryNode
 */

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  children: CategoryNode[];
}
