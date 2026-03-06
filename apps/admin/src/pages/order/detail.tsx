import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Card, Descriptions, Tag, Button, Table, Steps, Space, Modal, Form, Input,
  Popconfirm, message, Spin, Image,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { adminOrder, ApiError } from '@fe/api-client';
import type { AdminOrderDetail } from '@fe/shared';
import { formatPrice, formatDateTime, ORDER_STATUS_LABEL } from '@fe/shared';
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

const STEP_ITEMS = [
  { title: '创建', key: 'createdAt' },
  { title: '已付款', key: 'paidAt' },
  { title: '已发货', key: 'shippedAt' },
  { title: '已签收', key: 'deliveredAt' },
  { title: '已完成', key: 'completedAt' },
];

function getStepCurrent(order: AdminOrderDetail): number {
  if (order.status === 'cancelled' || order.status === 'refunded') return -1;
  if (order.completedAt) return 4;
  if (order.deliveredAt) return 3;
  if (order.shippedAt) return 2;
  if (order.paidAt) return 1;
  return 0;
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);

  // Ship modal
  const [shipModalOpen, setShipModalOpen] = useState(false);
  const [shipLoading, setShipLoading] = useState(false);
  const [shipForm] = Form.useForm();

  // Cancel/Refund modal
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [reasonAction, setReasonAction] = useState<'cancel' | 'refund'>('cancel');
  const [reasonLoading, setReasonLoading] = useState(false);
  const [reasonForm] = Form.useForm();

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await adminOrder.detail(id);
      setOrder(res);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '获取订单详情失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleShip = async () => {
    try {
      const values = await shipForm.validateFields();
      setShipLoading(true);
      await adminOrder.ship(id!, values.trackingNo || undefined);
      message.success('发货成功');
      setShipModalOpen(false);
      fetchDetail();
    } catch (err) {
      if (err instanceof ApiError) message.error(err.message);
    } finally {
      setShipLoading(false);
    }
  };

  const openReasonModal = (action: 'cancel' | 'refund') => {
    setReasonAction(action);
    reasonForm.resetFields();
    setReasonModalOpen(true);
  };

  const handleReasonSubmit = async () => {
    try {
      const values = await reasonForm.validateFields();
      setReasonLoading(true);
      if (reasonAction === 'cancel') {
        await adminOrder.cancel(id!, values.reason || undefined);
        message.success('订单已取消');
      } else {
        await adminOrder.refund(id!, values.reason || undefined);
        message.success('退款成功');
      }
      setReasonModalOpen(false);
      fetchDetail();
    } catch (err) {
      if (err instanceof ApiError) message.error(err.message);
    } finally {
      setReasonLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-60"><Spin size="large" /></div>;
  }

  if (!order) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/order')}>返回</Button>
        <div className="mt-16" style={{ color: 'rgba(0,0,0,0.45)' }}>订单不存在</div>
      </div>
    );
  }

  const stepCurrent = getStepCurrent(order);

  const itemColumns = [
    {
      title: '商品',
      key: 'product',
      ellipsis: true,
      render: (_: unknown, record: AdminOrderDetail['items'][0]) => (
        <div className="flex items-center gap-12">
          {record.imageUrl && (
            <Image
              src={record.imageUrl}
              width={40}
              height={40}
              style={{ minWidth: 40, borderRadius: 4, objectFit: 'cover' }}
              preview={false}
            />
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {record.productTitle}
            </div>
            {record.skuAttrs && Object.keys(record.skuAttrs).length > 0 && (
              <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
                {Object.entries(record.skuAttrs).map(([k, v]) => `${k}: ${v}`).join('，')}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      align: 'right' as const,
      render: (v: string) => formatPrice(v),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 70,
      align: 'center' as const,
    },
    {
      title: '小计',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 100,
      align: 'right' as const,
      render: (v: string) => <span className="font-medium">{formatPrice(v)}</span>,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-16">
        <div className="flex items-center gap-12">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/order')}>返回</Button>
          <h1 className="text-20 font-bold m-0">订单详情</h1>
          <Tag color={STATUS_COLOR[order.status] || 'default'}>
            {ORDER_STATUS_LABEL[order.status as OrderStatus] || order.status}
          </Tag>
        </div>
        <Space>
          {order.status === 'paid' && (
            <Button type="primary" onClick={() => { shipForm.resetFields(); setShipModalOpen(true); }}>
              发货
            </Button>
          )}
          {order.status === 'pending' && (
            <Button danger onClick={() => openReasonModal('cancel')}>
              取消订单
            </Button>
          )}
          {order.status === 'paid' && (
            <Button danger onClick={() => openReasonModal('refund')}>
              退款
            </Button>
          )}
        </Space>
      </div>

      {/* Order status steps */}
      {stepCurrent >= 0 && (
        <Card className="mb-16">
          <Steps
            current={stepCurrent}
            items={STEP_ITEMS.map((s) => ({
              title: s.title,
              description: (order as any)[s.key] ? formatDateTime((order as any)[s.key]) : undefined,
            }))}
          />
        </Card>
      )}

      {/* Cancelled/Refunded notice */}
      {(order.status === 'cancelled' || order.status === 'refunded') && (
        <Card className="mb-16">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="状态">
              <Tag color={STATUS_COLOR[order.status]}>
                {ORDER_STATUS_LABEL[order.status as OrderStatus]}
              </Tag>
            </Descriptions.Item>
            {order.cancelReason && (
              <Descriptions.Item label="原因">{order.cancelReason}</Descriptions.Item>
            )}
            <Descriptions.Item label="时间">
              {formatDateTime(order.cancelledAt || order.createdAt)}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Order info */}
      <Card title="订单信息" className="mb-16">
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
          <Descriptions.Item label="订单号">{order.orderNo}</Descriptions.Item>
          <Descriptions.Item label="下单时间">{formatDateTime(order.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="总金额">{formatPrice(order.totalAmount)}</Descriptions.Item>
          <Descriptions.Item label="优惠金额">{formatPrice(order.discountAmount)}</Descriptions.Item>
          <Descriptions.Item label="实付金额">
            <span className="font-medium" style={{ color: '#f5222d' }}>{formatPrice(order.payAmount)}</span>
          </Descriptions.Item>
          {order.remark && <Descriptions.Item label="备注">{order.remark}</Descriptions.Item>}
        </Descriptions>
      </Card>

      {/* User info */}
      {order.user && (
        <Card title="买家信息" className="mb-16">
          <Descriptions column={{ xs: 1, sm: 2 }} size="small">
            <Descriptions.Item label="昵称">{order.user.nickname || '-'}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{order.user.email}</Descriptions.Item>
            <Descriptions.Item label="手机号">{order.user.phone || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Items */}
      <Card title={`商品明细 (${order.items.length})`} className="mb-16">
        <Table
          rowKey="id"
          columns={itemColumns}
          dataSource={order.items}
          pagination={false}
          scroll={{ x: 500 }}
        />
        <div className="flex justify-end mt-12 gap-24" style={{ fontSize: 14 }}>
          <span>总金额：{formatPrice(order.totalAmount)}</span>
          <span>优惠：-{formatPrice(order.discountAmount)}</span>
          <span className="font-bold" style={{ color: '#f5222d' }}>
            实付：{formatPrice(order.payAmount)}
          </span>
        </div>
      </Card>

      {/* Address */}
      {order.address && (
        <Card title="收货地址" className="mb-16">
          <Descriptions column={{ xs: 1, sm: 2 }} size="small">
            <Descriptions.Item label="收货人">{order.address.recipient}</Descriptions.Item>
            <Descriptions.Item label="手机号">{order.address.phone}</Descriptions.Item>
            <Descriptions.Item label="地址" span={2}>
              {order.address.province}{order.address.city}{order.address.district}{order.address.address}
            </Descriptions.Item>
            {order.address.postalCode && (
              <Descriptions.Item label="邮编">{order.address.postalCode}</Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}

      {/* Payments */}
      {order.payments.length > 0 && (
        <Card title="支付记录">
          <Table
            rowKey="id"
            dataSource={order.payments}
            pagination={false}
            columns={[
              { title: '支付方式', dataIndex: 'method', key: 'method', width: 100 },
              {
                title: '金额',
                dataIndex: 'amount',
                key: 'amount',
                width: 100,
                align: 'right' as const,
                render: (v: string) => formatPrice(v),
              },
              {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                width: 80,
                render: (s: string) => <Tag color={s === 'success' ? 'green' : 'default'}>{s}</Tag>,
              },
              {
                title: '交易号',
                dataIndex: 'transactionId',
                key: 'transactionId',
                ellipsis: true,
                render: (v: string | null) => v || '-',
              },
              {
                title: '时间',
                dataIndex: 'createdAt',
                key: 'createdAt',
                width: 160,
                render: (v: string) => formatDateTime(v),
              },
            ]}
          />
        </Card>
      )}

      {/* Ship modal */}
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

      {/* Cancel/Refund reason modal */}
      <Modal
        title={reasonAction === 'cancel' ? '取消订单' : '退款'}
        open={reasonModalOpen}
        onOk={handleReasonSubmit}
        onCancel={() => setReasonModalOpen(false)}
        confirmLoading={reasonLoading}
        width={420}
        destroyOnClose
      >
        <Form form={reasonForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="reason" label="原因">
            <Input.TextArea rows={3} placeholder="请输入原因（可选）" maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
