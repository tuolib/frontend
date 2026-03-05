/**
 * Search — Amazon 风格搜索页，独立全屏页面
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { usePaginatedRequest } from '@fe/hooks';
import { product } from '@fe/api-client';
import { getStorageItem, setStorageItem } from '@fe/shared';
import { ProductGrid } from '@/components/product-grid';
import { SortBar } from '@/components/sort-bar';
import './search.scss';

const PAGE_SIZE = 10;
const HISTORY_KEY = 'search_history';
const MAX_HISTORY = 10;

const HOT_KEYWORDS = ['手机', '笔记本', '耳机', '零食', '运动鞋', '面膜', '背包', '键盘'];

const SORT_OPTIONS = [
  { value: 'relevance', label: '综合' },
  { value: 'price_asc', label: '价格↑' },
  { value: 'price_desc', label: '价格↓' },
  { value: 'sales', label: '销量' },
];

export default function Search() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [keyword, setKeyword] = useState('');
  const [activeKeyword, setActiveKeyword] = useState('');
  const [sort, setSort] = useState('relevance');
  const [history, setHistory] = useState<string[]>(
    () => getStorageItem<string[]>(HISTORY_KEY) ?? [],
  );

  const hasSearch = activeKeyword.length > 0;

  const { items, loading, loadingMore, hasMore, loadMore } = usePaginatedRequest(
    (page, pageSize, signal) =>
      product.search({ keyword: activeKeyword, sort, page, pageSize, signal }),
    { pageSize: PAGE_SIZE, immediate: hasSearch, deps: [activeKeyword, sort] },
  );

  // Autofocus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addToHistory = (kw: string) => {
    setHistory((prev) => {
      const next = [kw, ...prev.filter((h) => h !== kw)].slice(0, MAX_HISTORY);
      setStorageItem(HISTORY_KEY, next);
      return next;
    });
  };

  const doSearch = (kw: string) => {
    const trimmed = kw.trim();
    if (!trimmed) return;
    setKeyword(trimmed);
    addToHistory(trimmed);
    setActiveKeyword(trimmed);
    setSort('relevance');
    inputRef.current?.blur();
  };

  const clearHistory = () => {
    setHistory([]);
    setStorageItem(HISTORY_KEY, []);
  };

  return (
    <div className="amz-search">
      {/* Search header */}
      <div className="search-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <span className="i-carbon-arrow-left" />
        </button>
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') doSearch(keyword); }}
          placeholder="Search"
        />
        <button className="cancel-btn" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>

      {!hasSearch ? (
        <>
          {/* Search history */}
          {history.length > 0 && (
            <div className="search-section">
              <div className="section-header">
                <span className="section-title">搜索历史</span>
                <button className="section-clear" onClick={clearHistory}>清除</button>
              </div>
              <div className="tag-list">
                {history.map((kw) => (
                  <button key={kw} className="tag" onClick={() => doSearch(kw)}>
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hot keywords */}
          <div className="search-section">
            <div className="section-header">
              <span className="section-title">热门搜索</span>
            </div>
            <div className="tag-list">
              {HOT_KEYWORDS.map((kw) => (
                <button key={kw} className="tag" onClick={() => doSearch(kw)}>
                  {kw}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Sort bar */}
          <SortBar options={SORT_OPTIONS} value={sort} onChange={setSort} />

          {/* Search results */}
          <ProductGrid
            items={items}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            loadMore={loadMore}
          />

          {/* Empty state */}
          {!loading && items.length === 0 && (
            <div className="search-empty">
              <span className="empty-icon i-carbon-search" />
              <span className="empty-text">No results for &ldquo;{activeKeyword}&rdquo;</span>
            </div>
          )}

          <div className="h-20" />
        </>
      )}
    </div>
  );
}
