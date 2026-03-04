import { Link } from 'react-router';
import { useAuthStore } from '@fe/hooks';
import { ROUTES } from '@fe/shared';

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="p-4">
      {!isAuthenticated && (
        <div className="flex items-center justify-between bg-blue-50 rounded-8 px-4 py-3 mb-4">
          <span className="text-14 text-gray-600">登录后享受更多服务</span>
          <Link to={ROUTES.LOGIN} className="text-14 text-blue-600 font-medium">
            去登录
          </Link>
        </div>
      )}
      <h1 className="text-20 font-bold mb-4">首页</h1>
      <p className="text-gray-500">商品推荐、分类入口</p>
    </div>
  );
}
