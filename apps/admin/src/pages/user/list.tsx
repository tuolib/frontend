import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Table, Button, Input, Select, Tag, Space, Popconfirm, message, Avatar, Pagination,
} from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { adminUser, ApiError } from '@fe/api-client';
import type { AdminUserListItem } from '@fe/shared';
import { formatDate } from '@fe/shared';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  active: { color: 'green', label: '正常' },
  banned: { color: 'red', label: '已封禁' },
};

export default function UserList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<AdminUserListItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const fetchList = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const res = await adminUser.list({
        page,
        pageSize,
        keyword: keyword || undefined,
        status: statusFilter as 'active' | 'banned' | undefined,
      });
      setItems(res.items);
      setPagination(res.pagination);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '获取用户列表失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, [keyword, statusFilter]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleToggleStatus = async (id: string, status: 'active' | 'banned') => {
    try {
      await adminUser.toggleStatus(id, status);
      message.success(status === 'banned' ? '已封禁' : '已解封');
      fetchList(pagination.page, pagination.pageSize);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '操作失败';
      message.error(msg);
    }
  };

  const columns = [
    {
      title: '用户',
      key: 'user',
      ellipsis: true,
      render: (_: unknown, record: AdminUserListItem) => (
        <div className="flex items-center gap-12">
          <Avatar
            src={record.avatarUrl || undefined}
            icon={<UserOutlined />}
            size={40}
            style={{ minWidth: 40, background: record.avatarUrl ? undefined : '#1677ff' }}
          />
          <div style={{ minWidth: 0 }}>
            <div className="font-medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {record.nickname || record.email}
            </div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (v: string | null) => v || '-',
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
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 110,
      render: (v: string | null) => v ? formatDate(v) : '-',
    },
    {
      title: '注册时间',
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
      render: (_: unknown, record: AdminUserListItem) => (
        <Space>
          <Button type="link" size="small" onClick={() => navigate(`/user/${record.id}`)}>
            详情
          </Button>
          {record.status === 'active' ? (
            <Popconfirm title="确定封禁此用户？" onConfirm={() => handleToggleStatus(record.id, 'banned')}>
              <Button type="link" size="small" danger>封禁</Button>
            </Popconfirm>
          ) : (
            <Popconfirm title="确定解封此用户？" onConfirm={() => handleToggleStatus(record.id, 'active')}>
              <Button type="link" size="small">解封</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-16">
        <h1 className="text-20 font-bold m-0">用户管理</h1>
      </div>

      <div className="flex items-center gap-12 mb-16">
        <Input
          placeholder="搜索邮箱/昵称"
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={() => fetchList(1)}
          allowClear
          style={{ width: 240 }}
        />
        <Select
          placeholder="状态筛选"
          value={statusFilter}
          onChange={setStatusFilter}
          allowClear
          style={{ width: 120 }}
          options={[
            { label: '正常', value: 'active' },
            { label: '已封禁', value: 'banned' },
          ]}
        />
      </div>

      <Table
        rowKey="id"
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
    </div>
  );
}
