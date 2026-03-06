import { useState } from 'react';
import {
  Card, Input, InputNumber, Button, Form, Table, Tag, Space, AutoComplete, message, Spin,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { product as productApi, adminStock, ApiError } from '@fe/api-client';
import type { ProductListItem, SkuDTO } from '@fe/shared';
import { formatPrice } from '@fe/shared';

export default function StockAdjust() {
  // Search
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<ProductListItem[]>([]);
  const [searching, setSearching] = useState(false);

  // Selected product & SKUs
  const [selectedProduct, setSelectedProduct] = useState<ProductListItem | null>(null);
  const [skus, setSkus] = useState<SkuDTO[]>([]);
  const [loadingSkus, setLoadingSkus] = useState(false);

  // Selected SKU for adjustment
  const [selectedSku, setSelectedSku] = useState<SkuDTO | null>(null);
  const [adjustForm] = Form.useForm();
  const [adjusting, setAdjusting] = useState(false);

  const handleSearch = async (value: string) => {
    setSearchKeyword(value);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await productApi.search({ keyword: value, pageSize: 10 });
      setSearchResults(res.items);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectProduct = async (productId: string) => {
    const product = searchResults.find((p) => p.id === productId);
    if (!product) return;
    setSelectedProduct(product);
    setSelectedSku(null);
    adjustForm.resetFields();
    setLoadingSkus(true);
    try {
      const list = await productApi.skuList(productId);
      setSkus(list);
    } catch {
      setSkus([]);
      message.error('获取 SKU 列表失败');
    } finally {
      setLoadingSkus(false);
    }
  };

  const handleSelectSku = (sku: SkuDTO) => {
    setSelectedSku(sku);
    adjustForm.setFieldsValue({ quantity: sku.stock });
  };

  const handleAdjust = async () => {
    if (!selectedSku) return;
    try {
      const values = await adjustForm.validateFields();
      setAdjusting(true);
      await adminStock.adjust({
        skuId: selectedSku.id,
        quantity: values.quantity,
        reason: values.reason || undefined,
      });
      message.success('库存调整成功');
      // Refresh SKU list
      if (selectedProduct) {
        const list = await productApi.skuList(selectedProduct.id);
        setSkus(list);
        const updated = list.find((s) => s.id === selectedSku.id);
        if (updated) setSelectedSku(updated);
      }
      adjustForm.setFieldValue('reason', '');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '调整失败';
      message.error(msg);
    } finally {
      setAdjusting(false);
    }
  };

  const skuColumns = [
    {
      title: '编码',
      dataIndex: 'skuCode',
      key: 'skuCode',
      width: 120,
    },
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
      title: '售价',
      dataIndex: 'price',
      key: 'price',
      width: 90,
      align: 'right' as const,
      render: (v: string) => formatPrice(v),
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      align: 'right' as const,
      render: (stock: number, record: SkuDTO) => (
        <span style={{ color: stock <= (record.lowStock ?? 5) ? '#f5222d' : undefined, fontWeight: 600 }}>
          {stock}
        </span>
      ),
    },
    {
      title: '低库存阈值',
      dataIndex: 'lowStock',
      key: 'lowStock',
      width: 100,
      align: 'right' as const,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 70,
      render: (s: string) => (
        <Tag color={s === 'active' ? 'green' : 'default'}>
          {s === 'active' ? '启用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 80,
      render: (_: unknown, record: SkuDTO) => (
        <Button
          type={selectedSku?.id === record.id ? 'primary' : 'default'}
          size="small"
          onClick={() => handleSelectSku(record)}
        >
          {selectedSku?.id === record.id ? '已选中' : '选择'}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-20 font-bold mb-16 m-0">库存调整</h1>

      {/* Search */}
      <Card title="搜索商品" className="mb-16">
        <AutoComplete
          style={{ width: '100%', maxWidth: 480 }}
          options={searchResults.map((p) => ({
            value: p.id,
            label: (
              <div className="flex items-center gap-8">
                <span>{p.title}</span>
                {p.brand && <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>({p.brand})</span>}
              </div>
            ),
          }))}
          onSearch={handleSearch}
          onSelect={handleSelectProduct}
          placeholder="输入商品名称搜索..."
        >
          <Input prefix={<SearchOutlined />} allowClear />
        </AutoComplete>
      </Card>

      {/* SKU list */}
      {selectedProduct && (
        <Card title={`SKU 列表 — ${selectedProduct.title}`} className="mb-16">
          {loadingSkus ? (
            <div className="flex items-center justify-center py-24"><Spin /></div>
          ) : (
            <Table
              rowKey="id"
              columns={skuColumns}
              dataSource={skus}
              pagination={false}
              scroll={{ x: 600 }}
              locale={{ emptyText: '该商品暂无 SKU' }}
              rowClassName={(record) => selectedSku?.id === record.id ? 'ant-table-row-selected' : ''}
            />
          )}
        </Card>
      )}

      {/* Adjust form */}
      {selectedSku && (
        <Card title="调整库存" style={{ maxWidth: 520 }}>
          <div className="mb-16" style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
            <div className="flex items-center gap-8 mb-4">
              <span className="font-medium">{selectedProduct?.title}</span>
              <Tag>{selectedSku.skuCode}</Tag>
            </div>
            {selectedSku.attributes && Object.keys(selectedSku.attributes).length > 0 && (
              <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
                {Object.entries(selectedSku.attributes).map(([k, v]) => `${k}: ${v}`).join('，')}
              </div>
            )}
            <div className="mt-8">
              当前库存：<span className="font-bold" style={{ fontSize: 16 }}>{selectedSku.stock}</span>
              <span style={{ color: 'rgba(0,0,0,0.45)', marginLeft: 12 }}>
                低库存阈值：{selectedSku.lowStock ?? 5}
              </span>
            </div>
          </div>

          <Form form={adjustForm} layout="vertical" onFinish={handleAdjust}>
            <Form.Item
              name="quantity"
              label="新库存数量"
              rules={[{ required: true, message: '请输入新库存数量' }]}
            >
              <InputNumber min={0} precision={0} className="w-full" placeholder="请输入调整后的库存值" />
            </Form.Item>
            <Form.Item name="reason" label="调整原因">
              <Input.TextArea rows={2} placeholder="请输入调整原因（可选）" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={adjusting}>
              确认调整
            </Button>
          </Form>
        </Card>
      )}
    </div>
  );
}
