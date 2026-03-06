import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Card, Row, Col, Statistic, Table, Button, Tag, Space, Spin, Image,
} from 'antd';
import {
  ShoppingOutlined, OrderedListOutlined, ClockCircleOutlined, SendOutlined,
  PlusOutlined, AppstoreOutlined, DatabaseOutlined,
} from '@ant-design/icons';
import { adminProduct, adminOrder, ApiError } from '@fe/api-client';
import type { OrderListItem } from '@fe/shared';
import { formatPrice, formatDate, ORDER_STATUS_LABEL } from '@fe/shared';
import type { OrderStatus } from '@fe/shared';

const STATUS_COLOR: Record<string, string> = {
  pending: 'orange',
  paid: 'blue',
  shipped: 'cyan',
  delivered: 'green',
  completed: 'green',
  cancelled: 'default',
  refunded: 'red',
};

interface DashboardStats {
  productTotal: number;
  orderTotal: number;
  pendingOrders: number;
  paidOrders: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    productTotal: 0,
    orderTotal: 0,
    pendingOrders: 0,
    paidOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<OrderListItem[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [products, orders, pending, paid] = await Promise.all([
          adminProduct.list({ pageSize: 1 }),
          adminOrder.list({ pageSize: 5 }),
          adminOrder.list({ pageSize: 1, status: 'pending' }),
          adminOrder.list({ pageSize: 1, status: 'paid' }),
        ]);
        setStats({
          productTotal: products.pagination.total,
          orderTotal: orders.pagination.total,
          pendingOrders: pending.pagination.total,
          paidOrders: paid.pagination.total,
        });
        setRecentOrders(orders.items);
      } catch {
        // silently fail, partial data is okay
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const orderColumns = [
    {
      title: '订单',
      key: 'order',
      ellipsis: true,
      render: (_: unknown, record: OrderListItem) => (
        <div>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {record.firstItem?.productTitle || '-'}
            {record.itemCount > 1 && <span style={{ color: 'rgba(0,0,0,0.45)' }}> 等{record.itemCount}件</span>}
          </div>
          <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.orderNo}</div>
        </div>
      ),
    },
    {
      title: '金额',
      dataIndex: 'payAmount',
      key: 'payAmount',
      width: 90,
      align: 'right' as const,
      render: (v: string) => formatPrice(v),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={STATUS_COLOR[status] || 'default'}>
          {ORDER_STATUS_LABEL[status as OrderStatus] || status}
        </Tag>
      ),
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
      render: (v: string) => formatDate(v),
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_: unknown, record: OrderListItem) => (
        <Button type="link" size="small" onClick={() => navigate(`/order/${record.orderId}`)}>
          查看
        </Button>
      ),
    },
  ];

  if (loading) {
    return <div className="flex items-center justify-center min-h-60"><Spin size="large" /></div>;
  }

  return (
    <div>
      <h1 className="text-20 font-bold mb-16 m-0">数据概览</h1>

      {/* Stats cards */}
      <Row gutter={16} className="mb-16">
        <Col xs={12} sm={6}>
          <Card hoverable onClick={() => navigate('/product')}>
            <Statistic
              title="商品总数"
              value={stats.productTotal}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable onClick={() => navigate('/order')}>
            <Statistic
              title="订单总数"
              value={stats.orderTotal}
              prefix={<OrderedListOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable onClick={() => navigate('/order')}>
            <Statistic
              title="待付款"
              value={stats.pendingOrders}
              prefix={<ClockCircleOutlined />}
              valueStyle={stats.pendingOrders > 0 ? { color: '#faad14' } : undefined}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable onClick={() => navigate('/order')}>
            <Statistic
              title="待发货"
              value={stats.paidOrders}
              prefix={<SendOutlined />}
              valueStyle={stats.paidOrders > 0 ? { color: '#1677ff' } : undefined}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent orders */}
      <Card
        title="近期订单"
        className="mb-16"
        extra={<Button type="link" onClick={() => navigate('/order')}>查看全部</Button>}
      >
        <Table
          rowKey="orderId"
          columns={orderColumns}
          dataSource={recentOrders}
          pagination={false}
          size="small"
          locale={{ emptyText: '暂无订单' }}
        />
      </Card>

      {/* Quick actions */}
      <Card title="快捷操作">
        <Space wrap>
          <Button icon={<PlusOutlined />} onClick={() => navigate('/product/create')}>
            创建商品
          </Button>
          <Button icon={<AppstoreOutlined />} onClick={() => navigate('/category')}>
            管理分类
          </Button>
          <Button icon={<OrderedListOutlined />} onClick={() => navigate('/order')}>
            处理订单
          </Button>
          <Button icon={<DatabaseOutlined />} onClick={() => navigate('/stock')}>
            调整库存
          </Button>
        </Space>
      </Card>
    </div>
  );
}
