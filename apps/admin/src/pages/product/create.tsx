import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Form, Input, Select, Button, Card, Space, TreeSelect, message,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { adminProduct, category as categoryApi, ApiError } from '@fe/api-client';
import type { CategoryNode } from '@fe/shared';

function categoriesToTreeData(nodes: CategoryNode[]): any[] {
  return nodes.map((n) => ({
    title: n.name,
    value: n.id,
    children: n.children?.length ? categoriesToTreeData(n.children) : undefined,
  }));
}

interface ProductFormValues {
  title: string;
  slug?: string;
  description?: string;
  brand?: string;
  status: 'draft' | 'active';
  categoryIds: string[];
  images?: Array<{
    url: string;
    altText?: string;
    isPrimary?: boolean;
    sortOrder?: number;
  }>;
}

export default function ProductCreate() {
  const navigate = useNavigate();
  const [form] = Form.useForm<ProductFormValues>();
  const [loading, setLoading] = useState(false);
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);

  useEffect(() => {
    categoryApi.tree().then(setCategoryTree).catch(() => {});
  }, []);

  const onFinish = async (values: ProductFormValues) => {
    setLoading(true);
    try {
      const result = await adminProduct.create({
        title: values.title,
        slug: values.slug || undefined,
        description: values.description || undefined,
        brand: values.brand || undefined,
        status: values.status,
        categoryIds: values.categoryIds,
      });
      message.success('商品创建成功');
      navigate(`/product/${result.id}/edit`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '创建失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-12 mb-16">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/product')}>
          返回
        </Button>
        <h1 className="text-20 font-bold m-0">创建商品</h1>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ status: 'draft' }}
        style={{ maxWidth: 720 }}
      >
        <Card title="基本信息" className="mb-16">
          <Form.Item
            name="title"
            label="商品标题"
            rules={[
              { required: true, message: '请输入商品标题' },
              { max: 200, message: '最长 200 字符' },
            ]}
          >
            <Input placeholder="请输入商品标题" />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            tooltip="URL 友好标识，不填则自动生成"
          >
            <Input placeholder="留空自动生成" />
          </Form.Item>

          <Form.Item name="description" label="商品描述">
            <Input.TextArea rows={4} placeholder="请输入商品描述" />
          </Form.Item>

          <Form.Item name="brand" label="品牌" rules={[{ max: 100, message: '最长 100 字符' }]}>
            <Input placeholder="请输入品牌" />
          </Form.Item>

          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '草稿', value: 'draft' },
                { label: '上架', value: 'active' },
              ]}
            />
          </Form.Item>
        </Card>

        <Card title="分类" className="mb-16">
          <Form.Item
            name="categoryIds"
            label="所属分类"
            rules={[{ required: true, message: '请选择至少一个分类' }]}
          >
            <TreeSelect
              treeData={categoriesToTreeData(categoryTree)}
              multiple
              treeCheckable
              placeholder="请选择分类"
              showCheckedStrategy={TreeSelect.SHOW_CHILD}
              allowClear
            />
          </Form.Item>
        </Card>

        <Space>
          <Button onClick={() => navigate('/product')}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            创建商品
          </Button>
        </Space>
      </Form>
    </div>
  );
}
