import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Table, Button, Input, Tag, Space, Popconfirm, Modal, Form, Select, message, Pagination,
} from 'antd';
import {
  SearchOutlined, PlusOutlined, CrownOutlined, LockOutlined,
} from '@ant-design/icons';
import { adminManage, ApiError } from '@fe/api-client';
import type { StaffListItem } from '@fe/shared';
import { formatDate } from '@fe/shared';
import { useAdminAuthStore } from '@/stores/admin-auth';

const ROLE_MAP: Record<string, { color: string; label: string }> = {
  admin: { color: 'blue', label: '管理员' },
  operator: { color: 'green', label: '运营' },
  viewer: { color: 'default', label: '只读' },
};

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  active: { color: 'green', label: '正常' },
  disabled: { color: 'red', label: '已禁用' },
};

export default function StaffList() {
  const navigate = useNavigate();
  const currentAdmin = useAdminAuthStore((s) => s.admin);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<StaffListItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [keyword, setKeyword] = useState('');

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffListItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form] = Form.useForm();

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<StaffListItem | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetForm] = Form.useForm();

  // Guard: non-super admins redirect
  useEffect(() => {
    if (currentAdmin && !currentAdmin.isSuper) {
      message.error('需要超级管理员权限');
      navigate('/', { replace: true });
    }
  }, [currentAdmin, navigate]);

  const fetchList = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const res = await adminManage.list({
        page,
        pageSize,
        keyword: keyword || undefined,
      });
      setItems(res.items);
      setPagination(res.pagination);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '获取管理员列表失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => {
    if (currentAdmin?.isSuper) {
      fetchList();
    }
  }, [fetchList, currentAdmin?.isSuper]);

  // Create / Edit
  const openCreateModal = () => {
    setEditingStaff(null);
    form.resetFields();
    setFormModalOpen(true);
  };

  const openEditModal = (record: StaffListItem) => {
    setEditingStaff(record);
    form.setFieldsValue({
      username: record.username,
      realName: record.realName || undefined,
      phone: record.phone || undefined,
      email: record.email || undefined,
      role: record.role,
    });
    setFormModalOpen(true);
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormLoading(true);
      if (editingStaff) {
        await adminManage.update({
          id: editingStaff.id,
          realName: values.realName,
          phone: values.phone,
          email: values.email,
          role: values.role,
        });
        message.success('更新成功');
      } else {
        await adminManage.create(values);
        message.success('创建成功，该管理员首次登录需修改密码');
      }
      setFormModalOpen(false);
      fetchList(pagination.page, pagination.pageSize);
    } catch (err) {
      if (err instanceof ApiError) {
        message.error(err.message);
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (record: StaffListItem) => {
    const newStatus = record.status === 'active' ? 'disabled' : 'active';
    try {
      await adminManage.toggleStatus(record.id, newStatus);
      message.success(newStatus === 'disabled' ? '已禁用' : '已启用');
      fetchList(pagination.page, pagination.pageSize);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '操作失败';
      message.error(msg);
    }
  };

  // Reset password
  const openResetModal = (record: StaffListItem) => {
    setResetTarget(record);
    resetForm.resetFields();
    setResetModalOpen(true);
  };

  const handleResetPassword = async () => {
    try {
      const values = await resetForm.validateFields();
      setResetLoading(true);
      await adminManage.resetPassword(resetTarget!.id, values.newPassword);
      message.success('密码已重置，该管理员下次登录需修改密码');
      setResetModalOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        message.error(err.message);
      }
    } finally {
      setResetLoading(false);
    }
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 140,
      render: (username: string, record: StaffListItem) => (
        <Space>
          <span className="font-medium">{username}</span>
          {record.isSuper && (
            <Tag icon={<CrownOutlined />} color="gold">超管</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '姓名',
      dataIndex: 'realName',
      key: 'realName',
      width: 100,
      render: (v: string | null) => v || '-',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 90,
      render: (role: string) => {
        const r = ROLE_MAP[role] || { color: 'default', label: role };
        return <Tag color={r.color}>{r.label}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const s = STATUS_MAP[status] || { color: 'default', label: status };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (v: string | null) => v || '-',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      ellipsis: true,
      render: (v: string | null) => v || '-',
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 110,
      render: (v: string | null) => v ? formatDate(v) : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (v: string) => formatDate(v),
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: StaffListItem) => {
        if (record.isSuper) return <span style={{ color: 'rgba(0,0,0,0.25)' }}>-</span>;
        return (
          <Space>
            <Button type="link" size="small" onClick={() => openEditModal(record)}>
              编辑
            </Button>
            <Popconfirm
              title={record.status === 'active' ? '确定禁用此管理员？' : '确定启用此管理员？'}
              onConfirm={() => handleToggleStatus(record)}
            >
              <Button type="link" size="small" danger={record.status === 'active'}>
                {record.status === 'active' ? '禁用' : '启用'}
              </Button>
            </Popconfirm>
            <Button type="link" size="small" onClick={() => openResetModal(record)}>
              重置密码
            </Button>
          </Space>
        );
      },
    },
  ];

  if (!currentAdmin?.isSuper) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-16">
        <h1 className="text-20 font-bold m-0">管理员管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          新建管理员
        </Button>
      </div>

      <div className="flex items-center gap-12 mb-16">
        <Input
          placeholder="搜索用户名"
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={() => fetchList(1)}
          allowClear
          style={{ width: 240 }}
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={loading}
        pagination={false}
        scroll={{ x: 1000 }}
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

      {/* 创建/编辑 Modal */}
      <Modal
        title={editingStaff ? '编辑管理员' : '新建管理员'}
        open={formModalOpen}
        onOk={handleFormSubmit}
        onCancel={() => setFormModalOpen(false)}
        confirmLoading={formLoading}
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: !editingStaff, message: '请输入用户名' },
              { min: 2, max: 50, message: '2-50 字符' },
              { pattern: /^[a-zA-Z0-9_-]+$/, message: '仅允许字母、数字、下划线、短横线' },
            ]}
          >
            <Input
              placeholder="请输入用户名"
              disabled={!!editingStaff}
            />
          </Form.Item>

          {!editingStaff && (
            <Form.Item
              name="password"
              label="初始密码"
              rules={[
                { required: true, message: '请输入初始密码' },
                { min: 8, max: 100, message: '8-100 字符' },
              ]}
              extra="新管理员首次登录需修改密码"
            >
              <Input.Password placeholder="请输入初始密码" />
            </Form.Item>
          )}

          <Form.Item name="realName" label="姓名">
            <Input placeholder="请输入姓名" maxLength={50} />
          </Form.Item>

          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" maxLength={20} />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: 'email', message: '请输入有效邮箱' }]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            initialValue="operator"
          >
            <Select
              options={[
                { label: '管理员 — 全部后台管理权限', value: 'admin' },
                { label: '运营 — 商品上下架、订单处理', value: 'operator' },
                { label: '只读 — 仅查看', value: 'viewer' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 重置密码 Modal */}
      <Modal
        title={`重置密码 — ${resetTarget?.username}`}
        open={resetModalOpen}
        onOk={handleResetPassword}
        onCancel={() => setResetModalOpen(false)}
        confirmLoading={resetLoading}
        width={420}
        destroyOnClose
      >
        <Form form={resetForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 8, max: 100, message: '8-100 字符' },
            ]}
            extra="重置后该管理员下次登录需修改密码"
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
