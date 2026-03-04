import { Link } from 'react-router';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-60 font-bold text-gray-300 mb-4">404</h1>
      <p className="text-gray-500 mb-6">页面不存在</p>
      <Link to="/" className="text-blue-600 hover:underline">返回首页</Link>
    </div>
  );
}
