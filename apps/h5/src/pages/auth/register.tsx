import { Link } from 'react-router';

export default function Register() {
  return (
    <div>
      <h1 className="text-24 font-bold text-center mb-8">注册</h1>
      <p className="text-gray-500 text-center">
        已有账号？
        <Link to="/login" className="text-blue-600 ml-1">立即登录</Link>
      </p>
    </div>
  );
}
