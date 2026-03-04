import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button, Input, useToast } from '@fe/ui';
import { useAuthStore } from '@fe/hooks';
import { ApiError } from '@fe/api-client';
import { ERROR_CODE, ROUTES } from '@fe/shared';

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const register = useAuthStore((s) => s.register);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    nickname?: string;
  }>({});
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
    } else if (password.length < 8) {
      next.password = '密码至少 8 个字符';
    } else if (password.length > 100) {
      next.password = '密码最多 100 个字符';
    }

    if (nickname && nickname.length > 50) {
      next.nickname = '昵称最多 50 个字符';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function clearError(field: keyof typeof errors) {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(email.trim(), password, nickname.trim() || undefined);
      toast('注册成功', 'success');
      navigate(ROUTES.HOME, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.is(ERROR_CODE.USER_ALREADY_EXISTS)) {
          toast('该邮箱已注册', 'error');
        } else if (err.is(ERROR_CODE.PASSWORD_TOO_WEAK)) {
          toast('密码强度不够，请使用更复杂的密码', 'error');
        } else {
          toast(err.message || '注册失败，请稍后重试', 'error');
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
      <h1 className="text-28 font-bold text-center mb-8">注册</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="邮箱"
          type="email"
          placeholder="请输入邮箱地址"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError('email');
          }}
          error={errors.email}
          autoComplete="email"
        />

        <Input
          label="昵称（选填）"
          type="text"
          placeholder="请输入昵称"
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            clearError('nickname');
          }}
          error={errors.nickname}
          autoComplete="nickname"
        />

        <Input
          label="密码"
          type="password"
          placeholder="至少 8 个字符"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError('password');
          }}
          error={errors.password}
          autoComplete="new-password"
        />

        <Button type="submit" loading={loading} className="w-full mt-4">
          注册
        </Button>
      </form>

      <p className="text-14 text-gray-500 text-center mt-6">
        已有账号？
        <Link to={ROUTES.LOGIN} className="text-blue-600 ml-1">
          立即登录
        </Link>
      </p>
    </div>
  );
}
