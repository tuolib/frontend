import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Table, Button, Tag, Space, Tabs, Modal, Form, Input, message, Pagination, Image,
} from 'antd';
import { adminOrder, ApiError } from '@fe/api-client';
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

const STATUS_TABS = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待付款' },
  { key: 'paid', label: '待发货' },
  { key: 'shipped', label: '已发货' },
  { key: 'delivered', label: '已签收' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
  { key: 'refunded', label: '已退款' },
];

export default function OrderList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<OrderListItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [statusTab, setStatusTab] = useState('all');

  // Ship modal
  const [shipModalOpen, setShipModalOpen] = useState(false);
  const [shipOrderId, setShipOrderId] = useState('');
  const [shipLoading, setShipLoading] = useState(false);
  const [shipForm] = Form.useForm();

  const fetchList = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const res = await adminOrder.list({
        page,
        pageSize,
        status: statusTab === 'all' ? undefined : statusTab,
      });
      setItems(res.items);
      setPagination(res.pagination);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '获取订单列表失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, [statusTab]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const openShipModal = (orderId: string) => {
    setShipOrderId(orderId);
    shipForm.resetFields();
    setShipModalOpen(true);
  };

  const handleShip = async () => {
    try {
      const values = await shipForm.validateFields();
      setShipLoading(true);
      await adminOrder.ship(shipOrderId, values.trackingNo || undefined);
      message.success('发货成功');
      setShipModalOpen(false);
      fetchList(pagination.page, pagination.pageSize);
    } catch (err) {
      if (err instanceof ApiError) message.error(err.message);
    } finally {
      setShipLoading(false);
    }
  };

  const columns = [
    {
      title: '订单信息',
      key: 'order',
      ellipsis: true,
      render: (_: unknown, record: OrderListItem) => (
        <div className="flex items-center gap-12">
          {record.firstItem?.imageUrl && (
            <Image
              src={record.firstItem.imageUrl}
              width={40}
              height={40}
              style={{ minWidth: 40, borderRadius: 4, objectFit: 'cover' }}
              preview={false}
            />
          )}
          <div style={{ minWidth: 0 }}>
            <div className="font-medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {record.firstItem?.productTitle || '-'}
              {record.itemCount > 1 && <span style={{ color: 'rgba(0,0,0,0.45)' }}> 等{record.itemCount}件</span>}
            </div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.orderNo}</div>
          </div>
        </div>
      ),
    },
    {
      title: '金额',
      dataIndex: 'payAmount',
      key: 'payAmount',
      width: 100,
      align: 'right' as const,
      render: (v: string) => <span className="font-medium">{formatPrice(v)}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: string) => (
        <Tag color={STATUS_COLOR[status] || 'default'}>
          {ORDER_STATUS_LABEL[status as OrderStatus] || status}
        </Tag>
      ),
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (v: string) => formatDate(v),
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      fixed: 'right' as const,
      render: (_: unknown, record: OrderListItem) => (
        <Space>
          <Button type="link" size="small" onClick={() => navigate(`/order/${record.orderId}`)}>
            详情
          </Button>
          {record.status === 'paid' && (
            <Button type="link" size="small" onClick={() => openShipModal(record.orderId)}>
              发货
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-16">
        <h1 className="text-20 font-bold m-0">订单管理</h1>
      </div>

      <Tabs
        activeKey={statusTab}
        onChange={(key) => setStatusTab(key)}
        items={STATUS_TABS}
        className="mb-16"
      />

      <Table
        rowKey="orderId"
        columns={columns}
        dataSource={items}
        loading={loading}
        pagination={false}
        scroll={{ x: 700 }}
        sticky={{ offsetHeader: 56 }}
      />

      {pagination.total > 0 && (
        <div
          className="flex items-center justify-between"
          style={{
            position: 'sticky',
            bottom: 0,
            background: '#fff',
            borderTop: '1px solid #f0f0f0',
            padding: '12px 16px',
            marginTop: -1,
            boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
            borderRadius: '0 0 8px 8px',
            zIndex: 5,
          }}
        >
          <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 14 }}>
            共 {pagination.total} 条
          </span>
          <Pagination
            current={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showSizeChanger
            showQuickJumper
            onChange={(page, pageSize) => fetchList(page, pageSize)}
          />
        </div>
      )}

      <Modal
        title="发货"
        open={shipModalOpen}
        onOk={handleShip}
        onCancel={() => setShipModalOpen(false)}
        confirmLoading={shipLoading}
        width={420}
        destroyOnClose
      >
        <Form form={shipForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="trackingNo" label="物流单号">
            <Input placeholder="请输入物流单号（可选）" maxLength={100} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
