import { useState, useEffect, useMemo } from 'react';
import { Button, Table, Tag, Space, Modal, Form, Input, InputNumber, TreeSelect, Switch, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { adminCategory } from '@fe/api-client';
import type { CategoryNode } from '@fe/shared';
import { ApiError } from '@fe/api-client';

interface CategoryFormValues {
  name: string;
  slug?: string;
  parentId?: string;
  iconUrl?: string;
  sortOrder?: number;
}

function flattenTree(nodes: CategoryNode[]): CategoryNode[] {
  const result: CategoryNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children?.length) {
      result.push(...flattenTree(node.children));
    }
  }
  return result;
}

function buildTreeSelectData(nodes: CategoryNode[], excludeId?: string): any[] {
  return nodes
    .filter((n) => n.id !== excludeId)
    .map((node) => ({
      title: node.name,
      value: node.id,
      children: node.children?.length ? buildTreeSelectData(node.children, excludeId) : [],
    }));
}

export default function CategoryList() {
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryNode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<CategoryFormValues>();

  const fetchTree = async () => {
    setLoading(true);
    try {
      const data = await adminCategory.tree();
      setTree(data);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '加载分类失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const treeSelectData = useMemo(
    () => buildTreeSelectData(tree, editing?.id),
    [tree, editing?.id],
  );

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: CategoryNode) => {
    setEditing(record);
    const flat = flattenTree(tree);
    const parent = flat.find((n) => n.children?.some((c) => c.id === record.id));
    form.setFieldsValue({
      name: record.name,
      slug: record.slug,
      parentId: parent?.id,
      iconUrl: record.iconUrl ?? undefined,
      sortOrder: record.sortOrder,
    });
    setModalOpen(true);
  };

  const onSubmit = async (values: CategoryFormValues) => {
    setSubmitting(true);
    try {
      if (editing) {
        await adminCategory.update({ id: editing.id, ...values });
        message.success('分类已更新');
      } else {
        await adminCategory.create(values);
        message.success('分类已创建');
      }
      setModalOpen(false);
      fetchTree();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '操作失败';
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (record: CategoryNode) => {
    try {
      await adminCategory.update({ id: record.id, isActive: !record.isActive });
      message.success(record.isActive ? '已禁用' : '已启用');
      fetchTree();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '操作失败';
      message.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminCategory.remove(id);
      message.success('分类已删除');
      fetchTree();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '删除失败';
      message.error(msg);
    }
  };

  const columns: ColumnsType<CategoryNode> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 180,
    },
    {
      title: '图标',
      dataIndex: 'iconUrl',
      key: 'iconUrl',
      width: 80,
      render: (url: string | null) =>
        url ? <img src={url} alt="icon" className="w-24px h-24px object-contain" /> : '-',
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>{isActive ? '启用' : '禁用'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Switch
            size="small"
            checked={record.isActive}
            onChange={() => toggleActive(record)}
          />
          <Popconfirm
            title="确认删除此分类？"
            description="有子分类或关联商品时无法删除"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-16">
        <h1 className="text-20 font-bold m-0">分类管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建分类
        </Button>
      </div>

      <Table<CategoryNode>
        columns={columns}
        dataSource={tree}
        rowKey="id"
        loading={loading}
        pagination={false}
        expandable={{ childrenColumnName: 'children' }}
      />

      <Modal
        title={editing ? '编辑分类' : '新建分类'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        width={520}
        destroyOnClose
      >
        <Form<CategoryFormValues>
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          className="mt-16"
        >
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" maxLength={100} />
          </Form.Item>

          <Form.Item name="slug" label="Slug">
            <Input placeholder="留空自动生成" maxLength={100} />
          </Form.Item>

          <Form.Item name="parentId" label="父分类">
            <TreeSelect
              placeholder="无（顶级分类）"
              treeData={treeSelectData}
              allowClear
              treeDefaultExpandAll
            />
          </Form.Item>

          <Form.Item name="iconUrl" label="图标 URL">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item name="sortOrder" label="排序">
            <InputNumber min={0} precision={0} placeholder="0" className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
