import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Table, Button, Input, Select, Tag, Space, Popconfirm, message, Image, Pagination,
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { adminProduct, category as categoryApi, ApiError } from '@fe/api-client';
import type { ProductListItem, CategoryNode } from '@fe/shared';
import { formatPriceRange, formatDate } from '@fe/shared';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  active: { color: 'green', label: '在售' },
  draft: { color: 'default', label: '草稿' },
  archived: { color: 'red', label: '已下架' },
};

function flattenCategories(nodes: CategoryNode[], result: { id: string; name: string }[] = []) {
  for (const node of nodes) {
    result.push({ id: node.id, name: node.name });
    if (node.children?.length) flattenCategories(node.children, result);
  }
  return result;
}

export default function ProductList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const fetchList = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const res = await adminProduct.list({
        page,
        pageSize,
        keyword: keyword || undefined,
        filters: {
          status: statusFilter as 'active' | 'draft' | 'archived' | undefined,
          categoryId: categoryFilter,
        },
      });
      setItems(res.items);
      setPagination(res.pagination);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '获取商品列表失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, [keyword, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    categoryApi.tree().then((tree) => setCategories(flattenCategories(tree))).catch(() => {});
  }, []);

  const handleToggleStatus = async (id: string, status: 'active' | 'draft' | 'archived') => {
    try {
      await adminProduct.toggleStatus(id, status);
      message.success('状态已更新');
      fetchList(pagination.page, pagination.pageSize);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '操作失败';
      message.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminProduct.remove(id);
      message.success('已删除');
      fetchList(pagination.page, pagination.pageSize);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '删除失败';
      message.error(msg);
    }
  };

  const columns = [
    {
      title: '商品',
      key: 'product',
      ellipsis: true,
      render: (_: unknown, record: ProductListItem) => (
        <div className="flex items-center gap-12">
          <Image
            src={record.primaryImage || undefined}
            width={48}
            height={48}
            style={{ minWidth: 48, borderRadius: 4, objectFit: 'cover' }}
            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+"
            preview={false}
          />
          <div style={{ minWidth: 0 }}>
            <div className="font-medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{record.title}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.brand || '-'}</div>
          </div>
        </div>
      ),
    },
    {
      title: '价格',
      key: 'price',
      width: 140,
      render: (_: unknown, record: ProductListItem) =>
        formatPriceRange(record.minPrice, record.maxPrice),
    },
    {
      title: '销量',
      dataIndex: 'totalSales',
      key: 'totalSales',
      width: 80,
      align: 'right' as const,
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
      render: (_: unknown, record: ProductListItem) => (
        <Space>
          <Button type="link" size="small" onClick={() => navigate(`/product/${record.id}/edit`)}>
            编辑
          </Button>
          {record.status === 'active' ? (
            <Button type="link" size="small" onClick={() => handleToggleStatus(record.id, 'draft')}>
              下架
            </Button>
          ) : record.status === 'draft' ? (
            <Button type="link" size="small" onClick={() => handleToggleStatus(record.id, 'active')}>
              上架
            </Button>
          ) : null}
          <Popconfirm title="确定删除此商品？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-16">
        <h1 className="text-20 font-bold m-0">商品管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/product/create')}>
          新建商品
        </Button>
      </div>

      <div className="flex items-center gap-12 mb-16">
        <Input
          placeholder="搜索商品名称"
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
            { label: '在售', value: 'active' },
            { label: '草稿', value: 'draft' },
            { label: '已下架', value: 'archived' },
          ]}
        />
        <Select
          placeholder="分类筛选"
          value={categoryFilter}
          onChange={setCategoryFilter}
          allowClear
          showSearch
          optionFilterProp="label"
          style={{ width: 160 }}
          options={categories.map((c) => ({ label: c.name, value: c.id }))}
        />
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={loading}
        pagination={false}
        scroll={{ x: 800 }}
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
