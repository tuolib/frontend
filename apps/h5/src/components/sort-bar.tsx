/**
 * SortBar — 排序切换栏，复用于搜索页/商品列表页
 */

interface SortOption {
  value: string;
  label: string;
}

interface SortBarProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
}

export function SortBar({ options, value, onChange }: SortBarProps) {
  return (
    <div className="amz-sort-bar">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`sort-item ${opt.value === value ? 'active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
