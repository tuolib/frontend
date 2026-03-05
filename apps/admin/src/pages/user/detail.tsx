import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Card, Descriptions, Tag, Button, Table, Popconfirm, message, Avatar, Statistic, Spin,
} from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { adminUser, ApiError } from '@fe/api-client';
import type { AdminUserDetail, AdminUserAddress } from '@fe/shared';
import { formatDate, formatPrice } from '@fe/shared';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  active: { color: 'green', label: '正常' },
  banned: { color: 'red', label: '已封禁' },
};

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminUserDetail | null>(null);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await adminUser.detail(id);
      setData(res);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '获取用户详情失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleToggleStatus = async (status: 'active' | 'banned') => {
    if (!id) return;
    try {
      await adminUser.toggleStatus(id, status);
      message.success(status === 'banned' ? '已封禁' : '已解封');
      fetchDetail();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '操作失败';
      message.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-60">
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/user')}>返回</Button>
        <div className="mt-16" style={{ color: 'rgba(0,0,0,0.45)' }}>用户不存在</div>
      </div>
    );
  }

  const { user, addresses, orderStats } = data;
  const statusInfo = STATUS_MAP[user.status] || { color: 'default', label: user.status };

  const addressColumns = [
    {
      title: '收货人',
      dataIndex: 'recipient',
      key: 'recipient',
      width: 100,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '地址',
      key: 'fullAddress',
      ellipsis: true,
      render: (_: unknown, record: AdminUserAddress) =>
        `${record.province}${record.city}${record.district}${record.address}`,
    },
    {
      title: '标签',
      key: 'label',
      width: 80,
      render: (_: unknown, record: AdminUserAddress) => (
        <>
          {record.label && <Tag>{record.label}</Tag>}
          {record.isDefault && <Tag color="blue">默认</Tag>}
        </>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-12 mb-16">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/user')}>
          返回
        </Button>
        <h1 className="text-20 font-bold m-0">用户详情</h1>
      </div>

      <Card className="mb-16">
        <div className="flex items-start gap-16">
          <Avatar
            src={user.avatarUrl || undefined}
            icon={<UserOutlined />}
            size={64}
            style={{ minWidth: 64, background: user.avatarUrl ? undefined : '#1677ff' }}
          />
          <div className="flex-1">
            <div className="flex items-center gap-12 mb-8">
              <span className="text-18 font-bold">{user.nickname || user.email}</span>
              <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
            </div>
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
              <Descriptions.Item label="邮箱">{user.email}</Descriptions.Item>
              <Descriptions.Item label="手机号">{user.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="注册时间">{formatDate(user.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="最后登录">{user.lastLogin ? formatDate(user.lastLogin) : '-'}</Descriptions.Item>
            </Descriptions>
            <div className="mt-12">
              {user.status === 'active' ? (
                <Popconfirm title="确定封禁此用户？" onConfirm={() => handleToggleStatus('banned')}>
                  <Button danger size="small">封禁用户</Button>
                </Popconfirm>
              ) : (
                <Popconfirm title="确定解封此用户？" onConfirm={() => handleToggleStatus('active')}>
                  <Button type="primary" size="small">解封用户</Button>
                </Popconfirm>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card title="订单统计" className="mb-16">
        <div className="flex gap-32">
          <Statistic title="总订单数" value={orderStats.totalOrders} />
          <Statistic title="已付款订单" value={orderStats.totalPaid} />
          <Statistic title="消费总额" value={formatPrice(Number(orderStats.totalAmount))} prefix="¥" />
        </div>
      </Card>

      <Card title={`收货地址 (${addresses.length})`}>
        <Table
          rowKey="id"
          columns={addressColumns}
          dataSource={addresses}
          pagination={false}
          scroll={{ x: 500 }}
          locale={{ emptyText: '暂无收货地址' }}
        />
      </Card>
    </div>
  );
}
