import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button, Input, useToast } from '@fe/ui';
import { useAuthStore } from '@fe/hooks';
import { ApiError } from '@fe/api-client';
import { ERROR_CODE, ROUTES } from '@fe/shared';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const next: typeof errors = {};

    if (!email.trim()) {
      next.email = '请输入邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = '邮箱格式不正确';
    }

    if (!password) {
      next.password = '请输入密码';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      toast('登录成功', 'success');
      navigate(ROUTES.HOME, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.is(ERROR_CODE.INVALID_CREDENTIALS)) {
          toast('邮箱或密码错误', 'error');
        } else if (err.is(ERROR_CODE.USER_NOT_FOUND)) {
          toast('用户不存在', 'error');
        } else {
          toast(err.message || '登录失败，请稍后重试', 'error');
        }
      } else {
        toast('网络异常，请检查网络连接', 'error');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-28 font-bold text-center mb-8">登录</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="邮箱"
          type="email"
          placeholder="请输入邮箱地址"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
          autoComplete="email"
        />

        <Input
          label="密码"
          type="password"
          placeholder="请输入密码"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={errors.password}
          autoComplete="current-password"
        />

        <Button type="submit" loading={loading} className="w-full mt-4">
          登录
        </Button>
      </form>

      <p className="text-14 text-gray-500 text-center mt-6">
        还没有账号？
        <Link to={ROUTES.REGISTER} className="text-blue-600 ml-1">
          立即注册
        </Link>
      </p>
    </div>
  );
}
