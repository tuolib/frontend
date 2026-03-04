import { useNavigate } from 'react-router';
import { Button, useToast } from '@fe/ui';
import { useAuthStore } from '@fe/hooks';
import { ROUTES } from '@fe/shared';

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout() {
    try {
      await logout();
      toast('已退出登录', 'success');
      navigate(ROUTES.LOGIN, { replace: true });
    } catch {
      toast('退出失败，请重试', 'error');
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-20 font-bold mb-4">个人中心</h1>
      <p className="text-gray-500">{user?.nickname || user?.email || '查看和编辑个人信息'}</p>

      <Button variant="danger" className="w-full mt-8" onClick={handleLogout}>
        退出登录
      </Button>
    </div>
  );
}
