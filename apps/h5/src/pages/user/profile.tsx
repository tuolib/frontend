import { Link, useNavigate } from 'react-router';
import { Button, useToast } from '@fe/ui';
import { useAuthStore } from '@fe/hooks';
import { ROUTES } from '@fe/shared';

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout() {
    try {
      await logout();
      toast('已退出登录', 'success');
      navigate(ROUTES.HOME, { replace: true });
    } catch {
      toast('退出失败，请重试', 'error');
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 flex flex-col items-center pt-20">
        <span className="i-carbon-user-avatar text-64 text-gray-300 mb-4" />
        <p className="text-16 text-gray-500 mb-6">登录后查看个人信息</p>
        <Link to={ROUTES.LOGIN}>
          <Button>去登录</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-20 font-bold mb-4">个人中心</h1>
      <p className="text-gray-500">{user?.nickname || user?.email}</p>

      <Button variant="danger" className="w-full mt-8" onClick={handleLogout}>
        退出登录
      </Button>
    </div>
  );
}
