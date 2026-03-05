/**
 * AdminLayout — Ant Design 侧边栏布局
 */

import { useState, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Layout, Menu, Dropdown, Avatar, Breadcrumb } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  OrderedListOutlined,
  DatabaseOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAdminAuthStore } from '@/stores/admin-auth';

const { Sider, Header, Content } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '数据概览' },
  { key: '/product', icon: <ShoppingOutlined />, label: '商品管理' },
  { key: '/category', icon: <AppstoreOutlined />, label: '分类管理' },
  { key: '/order', icon: <OrderedListOutlined />, label: '订单管理' },
  { key: '/stock', icon: <DatabaseOutlined />, label: '库存管理' },
];

const BREADCRUMB_MAP: Record<string, string> = {
  '/': '数据概览',
  '/product': '商品管理',
  '/product/create': '创建商品',
  '/category': '分类管理',
  '/order': '订单管理',
  '/stock': '库存管理',
};

function getSelectedKey(pathname: string): string {
  if (pathname.startsWith('/product')) return '/product';
  if (pathname.startsWith('/category')) return '/category';
  if (pathname.startsWith('/order')) return '/order';
  if (pathname.startsWith('/stock')) return '/stock';
  return '/';
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const admin = useAdminAuthStore((s) => s.admin);
  const logout = useAdminAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const selectedKey = getSelectedKey(location.pathname);

  const breadcrumbItems = useMemo(() => {
    const items: { title: string }[] = [{ title: '首页' }];
    const parentKey = selectedKey;
    const parentLabel = BREADCRUMB_MAP[parentKey];
    if (parentLabel && parentKey !== '/') {
      items.push({ title: parentLabel });
    }
    const currentLabel = BREADCRUMB_MAP[location.pathname];
    if (currentLabel && location.pathname !== parentKey && location.pathname !== '/') {
      items.push({ title: currentLabel });
    }
    if (location.pathname.match(/\/product\/[^/]+\/edit/)) {
      if (!items.some((i) => i.title === '商品管理')) items.push({ title: '商品管理' });
      items.push({ title: '编辑商品' });
    }
    if (location.pathname.match(/\/order\/[^/]+$/) && !location.pathname.endsWith('/order')) {
      if (!items.some((i) => i.title === '订单管理')) items.push({ title: '订单管理' });
      items.push({ title: '订单详情' });
    }
    return items;
  }, [location.pathname, selectedKey]);

  const displayName = admin?.realName || admin?.username || '管理员';

  return (
    <Layout className="min-h-screen">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={220}
        style={{ overflow: 'auto', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 10 }}
      >
        <div
          className="flex items-center justify-center cursor-pointer"
          style={{ height: 64, borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          onClick={() => navigate('/')}
        >
          <div
            className="flex items-center justify-center rounded-8 font-bold"
            style={{
              width: collapsed ? 36 : 'auto',
              height: 36,
              padding: collapsed ? 0 : '0 12px',
              background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
              color: '#fff',
              fontSize: collapsed ? 16 : 15,
              letterSpacing: collapsed ? 0 : 2,
              transition: 'all 0.2s',
            }}
          >
            {collapsed ? '商' : '商城后台'}
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 4 }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header
          className="flex items-center justify-between"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 9,
            height: 56,
            padding: '0 24px',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <Breadcrumb items={breadcrumbItems} />
          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  danger: true,
                  onClick: handleLogout,
                },
              ],
            }}
            placement="bottomRight"
          >
            <div className="flex items-center gap-8 cursor-pointer" style={{ padding: '4px 8px', borderRadius: 6 }}>
              <Avatar size={28} icon={<UserOutlined />} style={{ background: '#1677ff' }} />
              <span style={{ color: 'rgba(0,0,0,0.65)', fontSize: 14 }}>{displayName}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 20, minHeight: 'calc(100vh - 96px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
