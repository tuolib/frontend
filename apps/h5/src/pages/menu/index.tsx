/**
 * Menu 分类浏览页 — Amazon 风格左右分栏
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useRequest } from '@fe/hooks';
import { category, product } from '@fe/api-client';
import { Skeleton } from '@fe/ui';
import type { CategoryNode, ProductListItem } from '@fe/shared';
import { categoryPlaceholder, productPlaceholder } from '@/pages/home/placeholder';
import './menu.scss';

function MenuSkeleton() {
  return (
    <div className="menu-body">
      <div className="menu-left">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-48 mb-4" />
        ))}
      </div>
      <div className="menu-right">
        <div className="grid grid-cols-3 gap-16 p-16">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <Skeleton className="w-56 h-56 rounded-full" />
              <Skeleton className="w-48 h-14 mt-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PopularProducts({ categoryId }: { categoryId: string }) {
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    product
      .list({
        page: 1,
        pageSize: 6,
        sort: 'sales',
        order: 'desc',
        filters: { categoryId },
      })
      .then((res) => setItems(res.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categoryId]);

  if (loading) {
    return (
      <div className="popular-section">
        <div className="popular-header">Popular</div>
        <div className="popular-scroll">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="popular-item-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="popular-section">
      <div className="popular-header">Popular</div>
      <div className="popular-scroll">
        {items.map((item) => {
          const price = item.minPrice ? Number.parseFloat(item.minPrice) : 0;
          return (
            <Link key={item.id} to={`/dp/${item.id}`} className="popular-item">
              <div className="popular-img">
                <img
                  src={item.primaryImage || productPlaceholder(item.title)}
                  alt={item.title}
                  loading="lazy"
                />
              </div>
              <div className="popular-info">
                <div className="popular-title">{item.title}</div>
                <div className="popular-price">
                  <span className="text-10">¥</span>
                  {price.toFixed(0)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SubcategoryGrid({ items, parentId }: { items: CategoryNode[]; parentId: string }) {
  return (
    <div className="subcategory-content">
      <div className="subcategory-grid">
        {items.map((sub) => (
          <Link
            key={sub.id}
            to={`/product?categoryId=${sub.id}`}
            className="subcategory-item"
          >
            <div className="subcategory-icon">
              <img
                src={sub.iconUrl || categoryPlaceholder(sub.name)}
                alt={sub.name}
              />
            </div>
            <span className="subcategory-name">{sub.name}</span>
          </Link>
        ))}
      </div>
      <PopularProducts categoryId={parentId} />
      <Link
        to={`/product?categoryId=${parentId}`}
        className="see-all-link"
      >
        See all <span className="i-carbon-chevron-right text-14 ml-4" />
      </Link>
    </div>
  );
}

export default function Menu() {
  const { data: categories, loading } = useRequest(
    (signal) => category.tree({ signal }),
  );

  const [activeIndex, setActiveIndex] = useState(0);

  if (loading) {
    return (
      <div className="amz-menu">
        <div className="menu-header">Menu</div>
        <MenuSkeleton />
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="amz-menu">
        <div className="menu-header">Menu</div>
        <div className="flex-cc flex-1">
          <span className="i-carbon-catalog text-48 text-[#565959] block mb-16" />
          <p className="text-14 text-[#565959]">No categories available</p>
        </div>
      </div>
    );
  }

  const activeCategory = categories[activeIndex];

  return (
    <div className="amz-menu">
      <div className="menu-header">Menu</div>
      <div className="menu-body">
        {/* 左栏 — 一级分类 */}
        <div className="menu-left">
          {categories.map((cat, index) => (
            <button
              key={cat.id}
              type="button"
              className={`menu-left-item ${index === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 右栏 — 二级分类 */}
        <div className="menu-right">
          {activeCategory.children && activeCategory.children.length > 0 ? (
            <SubcategoryGrid
              items={activeCategory.children}
              parentId={activeCategory.id}
            />
          ) : (
            <div className="subcategory-content">
              <PopularProducts categoryId={activeCategory.id} />
              <Link
                to={`/product?categoryId=${activeCategory.id}`}
                className="see-all-link"
              >
                See all {activeCategory.name} <span className="i-carbon-chevron-right text-14 ml-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
