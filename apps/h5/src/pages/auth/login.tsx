import { Link } from 'react-router';

export default function Login() {
  return (
    <div>
      <h1 className="text-24 font-bold text-center mb-8">登录</h1>
      <p className="text-gray-500 text-center">
        还没有账号？
        <Link to="/register" className="text-blue-600 ml-1">立即注册</Link>
      </p>
    </div>
  );
}
