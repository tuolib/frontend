import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Form, Input, Select, Button, Card, Space, TreeSelect, Tabs,
  Table, Modal, InputNumber, Popconfirm, Tag, message, Spin, Image,
} from 'antd';
import {
  ArrowLeftOutlined, PlusOutlined, DeleteOutlined,
  ArrowUpOutlined, ArrowDownOutlined, PictureOutlined,
} from '@ant-design/icons';
import { adminProduct, category as categoryApi, ApiError } from '@fe/api-client';
import type { ProductDetail, CategoryNode, SkuDTO, ProductImage } from '@fe/shared';
import { formatPrice } from '@fe/shared';

function categoriesToTreeData(nodes: CategoryNode[]): any[] {
  return nodes.map((n) => ({
    title: n.name,
    value: n.id,
    children: n.children?.length ? categoriesToTreeData(n.children) : undefined,
  }));
}

// ── SKU Modal ──
function SkuModal({
  open,
  sku,
  productId,
  onClose,
  onSuccess,
}: {
  open: boolean;
  sku: SkuDTO | null;
  productId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEdit = !!sku;

  useEffect(() => {
    if (open) {
      if (sku) {
        form.setFieldsValue({
          skuCode: sku.skuCode,
          price: parseFloat(sku.price),
          comparePrice: sku.comparePrice ? parseFloat(sku.comparePrice) : undefined,
          stock: sku.stock,
          attributes: sku.attributes ? JSON.stringify(sku.attributes) : '{}',
          status: sku.status,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, sku, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      let attrs: Record<string, string> = {};
      try {
        attrs = JSON.parse(values.attributes || '{}');
      } catch {
        message.error('规格属性 JSON 格式错误');
        setLoading(false);
        return;
      }

      if (isEdit) {
        await adminProduct.updateSku({
          skuId: sku!.id,
          price: values.price,
          comparePrice: values.comparePrice || null,
          attributes: attrs,
          status: values.status,
        });
      } else {
        await adminProduct.createSku({
          productId,
          skuCode: values.skuCode,
          price: values.price,
          comparePrice: values.comparePrice,
          stock: values.stock ?? 0,
          attributes: attrs,
        });
      }
      message.success(isEdit ? 'SKU 已更新' : 'SKU 已创建');
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '操作失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? '编辑 SKU' : '新建 SKU'}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="skuCode"
          label="SKU 编码"
          rules={[{ required: true, message: '请输入 SKU 编码' }]}
        >
          <Input disabled={isEdit} placeholder="唯一编码" />
        </Form.Item>
        <div className="flex gap-12">
          <Form.Item
            name="price"
            label="售价"
            rules={[{ required: true, message: '请输入售价' }]}
            className="flex-1"
          >
            <InputNumber min={0.01} step={0.01} precision={2} className="w-full" placeholder="0.00" />
          </Form.Item>
          <Form.Item name="comparePrice" label="划线价" className="flex-1">
            <InputNumber min={0.01} step={0.01} precision={2} className="w-full" placeholder="可选" />
          </Form.Item>
        </div>
        {!isEdit && (
          <Form.Item name="stock" label="库存" initialValue={0}>
            <InputNumber min={0} precision={0} className="w-full" />
          </Form.Item>
        )}
        <Form.Item
          name="attributes"
          label="规格属性"
          tooltip='JSON 格式，如 {"颜色":"红","尺码":"L"}'
          initialValue="{}"
          rules={[{ required: !isEdit, message: '请输入规格属性' }]}
        >
          <Input.TextArea rows={2} placeholder='{"颜色":"红","尺码":"L"}' />
        </Form.Item>
        {isEdit && (
          <Form.Item name="status" label="状态">
            <Select
              options={[
                { label: '启用', value: 'active' },
                { label: '停用', value: 'inactive' },
              ]}
            />
          </Form.Item>
        )}
        <div className="flex justify-end gap-8">
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? '保存' : '创建'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

// ── Image Management ──
function ImageAddModal({
  open,
  productId,
  onClose,
  onSuccess,
}: {
  open: boolean;
  productId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { url: string; altText?: string; isPrimary?: boolean }) => {
    setLoading(true);
    try {
      await adminProduct.addImages(productId, [values]);
      message.success('图片已添加');
      onSuccess();
      onClose();
      form.resetFields();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '添加失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="添加图片" open={open} onCancel={onClose} footer={null} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="url" label="图片 URL" rules={[{ required: true, message: '请输入图片 URL' }]}>
          <Input placeholder="https://..." />
        </Form.Item>
        <Form.Item name="altText" label="替代文本">
          <Input placeholder="图片描述（可选）" />
        </Form.Item>
        <Form.Item name="isPrimary" label="设为主图" valuePropName="checked" initialValue={false}>
          <Select
            options={[
              { label: '否', value: false },
              { label: '是', value: true },
            ]}
          />
        </Form.Item>
        <div className="flex justify-end gap-8">
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>添加</Button>
        </div>
      </Form>
    </Modal>
  );
}

// ── Main Page ──
export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [skuModalOpen, setSkuModalOpen] = useState(false);
  const [editingSku, setEditingSku] = useState<SkuDTO | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    try {
      const detail = await adminProduct.detail(id);
      setProduct(detail);
      form.setFieldsValue({
        title: detail.title,
        slug: detail.slug,
        description: detail.description,
        brand: detail.brand,
        status: detail.status,
        categoryIds: detail.categories.map((c) => c.id),
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '获取商品详情失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, [id, form]);

  useEffect(() => {
    fetchProduct();
    categoryApi.tree().then(setCategoryTree).catch(() => {});
  }, [fetchProduct]);

  const onSave = async (values: any) => {
    if (!id) return;
    setSaving(true);
    try {
      await adminProduct.update({
        id,
        title: values.title,
        slug: values.slug || undefined,
        description: values.description || undefined,
        brand: values.brand || undefined,
        status: values.status,
        categoryIds: values.categoryIds,
      });
      message.success('保存成功');
      fetchProduct();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '保存失败';
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await adminProduct.remove(id);
      message.success('商品已删除');
      navigate('/product');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '删除失败';
      message.error(msg);
    }
  };

  const handleDeleteSku = async (skuId: string) => {
    try {
      await adminProduct.deleteSku(skuId);
      message.success('SKU 已删除');
      fetchProduct();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '删除失败';
      message.error(msg);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await adminProduct.deleteImage(imageId);
      message.success('图片已删除');
      fetchProduct();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '删除失败';
      message.error(msg);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!product) return;
    try {
      // 通过 update 接口重置所有图片的 isPrimary
      await adminProduct.update({
        id: product.id,
        images: product.images.map((img) => ({
          url: img.url,
          altText: img.altText || undefined,
          isPrimary: img.id === imageId,
          sortOrder: img.sortOrder,
        })),
      });
      message.success('已设为主图');
      fetchProduct();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '设置失败';
      message.error(msg);
    }
  };

  const handleSortImages = async (imageId: string, direction: 'up' | 'down') => {
    if (!product) return;
    const sorted = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((img) => img.id === imageId);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    // 交换位置后提交新排序
    const newOrder = sorted.map((img) => img.id);
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    try {
      await adminProduct.sortImages(product.id, newOrder);
      fetchProduct();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '排序失败';
      message.error(msg);
    }
  };

  const handleUpdateImage = async (imageId: string, field: 'url' | 'altText', value: string) => {
    if (!product) return;
    if (field === 'url' && !value.trim()) {
      message.error('图片地址不能为空');
      return;
    }
    try {
      await adminProduct.update({
        id: product.id,
        images: product.images.map((img) => ({
          url: field === 'url' && img.id === imageId ? value.trim() : img.url,
          altText: field === 'altText' && img.id === imageId ? value.trim() : (img.altText || undefined),
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
        })),
      });
      message.success('已更新');
      fetchProduct();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '更新失败';
      message.error(msg);
    }
  };

  if (loading) {
    return <div className="flex-cc py-48"><Spin size="large" /></div>;
  }

  if (!product) {
    return <div className="py-48 text-center text-gray-400">商品不存在</div>;
  }

  const skuColumns = [
    { title: '编码', dataIndex: 'skuCode', key: 'skuCode', width: 120 },
    {
      title: '售价',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (v: string) => formatPrice(v),
    },
    {
      title: '划线价',
      dataIndex: 'comparePrice',
      key: 'comparePrice',
      width: 100,
      render: (v: string | null) => v ? formatPrice(v) : '-',
    },
    { title: '库存', dataIndex: 'stock', key: 'stock', width: 80, align: 'right' as const },
    {
      title: '规格',
      dataIndex: 'attributes',
      key: 'attributes',
      ellipsis: true,
      render: (attrs: Record<string, string> | null) =>
        attrs ? Object.entries(attrs).map(([k, v]) => (
          <Tag key={k}>{k}: {v}</Tag>
        )) : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (s: string) => (
        <Tag color={s === 'active' ? 'green' : 'default'}>
          {s === 'active' ? '启用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, record: SkuDTO) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => { setEditingSku(record); setSkuModalOpen(true); }}
          >
            编辑
          </Button>
          <Popconfirm title="确定删除此 SKU？" onConfirm={() => handleDeleteSku(record.id)}>
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const sortedImages = product ? [...product.images].sort((a, b) => a.sortOrder - b.sortOrder) : [];

  const imageColumns = [
    {
      title: '图片',
      dataIndex: 'url',
      key: 'url',
      width: 80,
      render: (url: string) => (
        <Image src={url} width={48} height={48} style={{ borderRadius: 4, objectFit: 'cover' as const }} />
      ),
    },
    {
      title: '图片地址',
      dataIndex: 'url',
      key: 'urlEdit',
      ellipsis: true,
      render: (v: string, record: ProductImage) => (
        <Input
          size="small"
          defaultValue={v}
          key={v}
          placeholder="图片 URL"
          variant="borderless"
          onBlur={(e) => {
            const newVal = e.target.value.trim();
            if (newVal && newVal !== v) handleUpdateImage(record.id, 'url', newVal);
          }}
          onPressEnter={(e) => (e.target as HTMLInputElement).blur()}
        />
      ),
    },
    {
      title: '替代文本',
      dataIndex: 'altText',
      key: 'altText',
      width: 160,
      ellipsis: true,
      render: (v: string | null, record: ProductImage) => (
        <Input
          size="small"
          defaultValue={v || ''}
          key={`alt-${record.id}-${v}`}
          placeholder="替代文本"
          variant="borderless"
          onBlur={(e) => {
            const newVal = e.target.value.trim();
            if (newVal !== (v || '')) handleUpdateImage(record.id, 'altText', newVal);
          }}
          onPressEnter={(e) => (e.target as HTMLInputElement).blur()}
        />
      ),
    },
    {
      title: '主图',
      dataIndex: 'isPrimary',
      key: 'isPrimary',
      width: 80,
      render: (v: boolean) => v ? <Tag color="blue">主图</Tag> : <span style={{ color: 'rgba(0,0,0,0.25)' }}>-</span>,
    },
    {
      title: '排序',
      key: 'sort',
      width: 90,
      render: (_: unknown, record: ProductImage) => {
        const idx = sortedImages.findIndex((img) => img.id === record.id);
        return (
          <Space size={4}>
            <Button
              type="text"
              size="small"
              icon={<ArrowUpOutlined />}
              disabled={idx <= 0}
              onClick={() => handleSortImages(record.id, 'up')}
            />
            <Button
              type="text"
              size="small"
              icon={<ArrowDownOutlined />}
              disabled={idx >= sortedImages.length - 1}
              onClick={() => handleSortImages(record.id, 'down')}
            />
          </Space>
        );
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, record: ProductImage) => (
        <Space>
          {!record.isPrimary && (
            <Button
              type="link"
              size="small"
              icon={<PictureOutlined />}
              onClick={() => handleSetPrimary(record.id)}
            >
              主图
            </Button>
          )}
          <Popconfirm title="确定删除此图片？" onConfirm={() => handleDeleteImage(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-16">
        <div className="flex items-center gap-12">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/product')}>
            返回
          </Button>
          <h1 className="text-20 font-bold m-0">编辑商品</h1>
        </div>
        <Popconfirm title="确定删除此商品？此操作不可恢复" onConfirm={handleDelete}>
          <Button danger>删除商品</Button>
        </Popconfirm>
      </div>

      <Tabs
        items={[
          {
            key: 'info',
            label: '基本信息',
            children: (
              <Form
                form={form}
                layout="vertical"
                onFinish={onSave}
                style={{ maxWidth: 720 }}
              >
                <Card className="mb-16">
                  <Form.Item
                    name="title"
                    label="商品标题"
                    rules={[
                      { required: true, message: '请输入商品标题' },
                      { max: 200, message: '最长 200 字符' },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item name="slug" label="Slug">
                    <Input />
                  </Form.Item>
                  <Form.Item name="description" label="商品描述">
                    <Input.TextArea rows={4} />
                  </Form.Item>
                  <Form.Item name="brand" label="品牌">
                    <Input />
                  </Form.Item>
                  <Form.Item name="status" label="状态">
                    <Select
                      options={[
                        { label: '草稿', value: 'draft' },
                        { label: '上架', value: 'active' },
                        { label: '已下架', value: 'archived' },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item
                    name="categoryIds"
                    label="所属分类"
                    rules={[{ required: true, message: '请选择分类' }]}
                  >
                    <TreeSelect
                      treeData={categoriesToTreeData(categoryTree)}
                      multiple
                      treeCheckable
                      showCheckedStrategy={TreeSelect.SHOW_CHILD}
                      allowClear
                    />
                  </Form.Item>
                </Card>
                <Button type="primary" htmlType="submit" loading={saving}>
                  保存修改
                </Button>
              </Form>
            ),
          },
          {
            key: 'sku',
            label: `SKU (${product.skus.length})`,
            children: (
              <div>
                <div className="flex justify-end mb-12">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => { setEditingSku(null); setSkuModalOpen(true); }}
                  >
                    新建 SKU
                  </Button>
                </div>
                <Table
                  rowKey="id"
                  columns={skuColumns}
                  dataSource={product.skus}
                  pagination={false}
                  scroll={{ x: 700 }}
                  sticky={{ offsetHeader: 56 }}
                />
                <SkuModal
                  open={skuModalOpen}
                  sku={editingSku}
                  productId={id!}
                  onClose={() => setSkuModalOpen(false)}
                  onSuccess={fetchProduct}
                />
              </div>
            ),
          },
          {
            key: 'images',
            label: `图片 (${product.images.length})`,
            children: (
              <div>
                <div className="flex justify-end mb-12">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setImageModalOpen(true)}
                  >
                    添加图片
                  </Button>
                </div>
                <Table
                  rowKey="id"
                  columns={imageColumns}
                  dataSource={sortedImages}
                  pagination={false}
                  scroll={{ x: 700 }}
                  sticky={{ offsetHeader: 56 }}
                />
                <ImageAddModal
                  open={imageModalOpen}
                  productId={id!}
                  onClose={() => setImageModalOpen(false)}
                  onSuccess={fetchProduct}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
