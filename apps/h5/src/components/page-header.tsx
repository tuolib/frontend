/**
 * PageHeader — 独立页面通用顶栏：返回箭头 + 标题 + 右侧操作区
 */

import { useNavigate } from 'react-router';

interface PageHeaderProps {
  title?: string;
  right?: React.ReactNode;
}

export function PageHeader({ title, right }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 flex items-center h-44 px-12 bg-white border-b border-b-[#eaeded]">
      <button
        className="w-32 h-32 flex-cc text-20 text-[#0f1111]"
        onClick={() => navigate(-1)}
      >
        <span className="i-carbon-arrow-left" />
      </button>
      {title && (
        <h1 className="flex-1 text-16 font-600 text-[#0f1111] truncate ml-8">
          {title}
        </h1>
      )}
      <div className="flex items-center gap-8">{right}</div>
    </header>
  );
}
