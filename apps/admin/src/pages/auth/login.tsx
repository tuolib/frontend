import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Button, Form, Input, App as AntdApp } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAdminAuthStore } from '@/stores/admin-auth';

interface LoginForm {
  username: string;
  password: string;
}

interface ChangePasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = AntdApp.useApp();
  const login = useAdminAuthStore((s) => s.login);
  const changePassword = useAdminAuthStore((s) => s.changePassword);
  const mustChangePassword = useAdminAuthStore((s) => s.mustChangePassword);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const onLogin = async (values: LoginForm) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      if (!useAdminAuthStore.getState().mustChangePassword) {
        message.success('登录成功');
        navigate(from, { replace: true });
      }
    } catch {
      // 全局 ApiErrorSetup 已通过 _onError 弹 toast（显示接口返回的 message）
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (values: ChangePasswordForm) => {
    setLoading(true);
    try {
      await changePassword(values.oldPassword, values.newPassword);
      message.success('密码修改成功');
      navigate(from, { replace: true });
    } catch {
      // 全局 ApiErrorSetup 已通过 _onError 弹 toast
    } finally {
      setLoading(false);
    }
  };

  if (mustChangePassword) {
    return (
      <div>
        <h1 className="text-24 font-bold text-center mb-8">修改密码</h1>
        <p className="text-gray-400 text-center mb-32">首次登录需修改初始密码</p>

        <Form<ChangePasswordForm> onFinish={onChangePassword} size="large" autoComplete="off">
          <Form.Item
            name="oldPassword"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="当前密码" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 8, message: '密码至少 8 个字符' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="新密码" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认新密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-24 font-bold text-center mb-8">后台管理系统</h1>
      <p className="text-gray-400 text-center mb-32">请使用管理员账号登录</p>

      <Form<LoginForm> onFinish={onLogin} size="large" autoComplete="off">
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="用户名" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="密码" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
