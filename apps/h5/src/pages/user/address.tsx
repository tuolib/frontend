/**
 * Address — 地址管理页面 (Step 8e)
 * 地址列表 + 新增/编辑表单
 */

import { useState, type FormEvent } from 'react';
import { useRequest } from '@fe/hooks';
import { address } from '@fe/api-client';
import { useToast, Skeleton } from '@fe/ui';
import type { UserAddress } from '@fe/shared';
import { PageHeader } from '@/components/page-header';
import '@/styles/address.scss';

interface AddressFormData {
  label: string;
  recipient: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  postalCode: string;
  isDefault: boolean;
}

const emptyForm: AddressFormData = {
  label: '',
  recipient: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  address: '',
  postalCode: '',
  isDefault: false,
};

export default function Address() {
  const { toast } = useToast();
  const { data: addresses, loading, run: reload } = useRequest(
    () => address.list(),
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  function openAddForm() {
    setEditingId(null);
    setFormData(emptyForm);
    setFormOpen(true);
  }

  function openEditForm(addr: UserAddress) {
    setEditingId(addr.id);
    setFormData({
      label: addr.label || '',
      recipient: addr.recipient,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      address: addr.address,
      postalCode: addr.postalCode || '',
      isDefault: addr.isDefault,
    });
    setFormOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    if (!formData.recipient.trim() || !formData.phone.trim() ||
        !formData.province.trim() || !formData.city.trim() ||
        !formData.district.trim() || !formData.address.trim()) {
      toast('Please fill in all required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const input = {
        label: formData.label.trim() || undefined,
        recipient: formData.recipient.trim(),
        phone: formData.phone.trim(),
        province: formData.province.trim(),
        city: formData.city.trim(),
        district: formData.district.trim(),
        address: formData.address.trim(),
        postalCode: formData.postalCode.trim() || undefined,
        isDefault: formData.isDefault,
      };

      if (editingId) {
        await address.update({ id: editingId, ...input });
        toast('Address updated', 'success');
      } else {
        await address.create(input);
        toast('Address added', 'success');
      }
      setFormOpen(false);
      reload();
    } catch {
      toast('Failed to save address', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await address.remove(id);
      toast('Address deleted', 'success');
      reload();
    } catch {
      toast('Failed to delete address', 'error');
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await address.update({ id, isDefault: true });
      toast('Default address updated', 'success');
      reload();
    } catch {
      toast('Failed to update', 'error');
    }
  }

  function updateField(field: keyof AddressFormData, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) return (
    <>
      <PageHeader title="Your Addresses" />
      <AddressSkeleton />
    </>
  );

  return (
    <>
      <PageHeader title="Your Addresses" />
      <div className="amz-address">
        <button className="address-add-btn" onClick={openAddForm}>
          <span className="add-icon i-carbon-add" />
          Add a new address
        </button>

        {(!addresses || addresses.length === 0) ? (
          <div className="address-empty">
            <span className="empty-icon i-carbon-location" />
            <div className="empty-title">No addresses yet</div>
            <div className="empty-desc">Add a shipping address to get started</div>
          </div>
        ) : (
          addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              addr={addr}
              onEdit={() => openEditForm(addr)}
              onDelete={() => handleDelete(addr.id)}
              onSetDefault={() => handleSetDefault(addr.id)}
            />
          ))
        )}
      </div>

      {formOpen && (
        <AddressForm
          title={editingId ? 'Edit Address' : 'Add Address'}
          data={formData}
          submitting={submitting}
          onChange={updateField}
          onSubmit={handleSubmit}
          onClose={() => setFormOpen(false)}
        />
      )}
    </>
  );
}

// ── Address Card ──

function AddressCard({
  addr,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  addr: UserAddress;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  const fullAddress = `${addr.province} ${addr.city} ${addr.district} ${addr.address}`;

  return (
    <div className={`address-card ${addr.isDefault ? 'is-default' : ''}`}>
      <div className="address-card-header">
        <span className="address-recipient">{addr.recipient}</span>
        <span className="address-phone">{addr.phone}</span>
        {addr.isDefault && <span className="default-badge">Default</span>}
      </div>
      <div className="address-card-body">
        {addr.label && <span className="address-label">{addr.label}</span>}
        {fullAddress}
      </div>
      <div className="address-card-actions">
        <button onClick={onEdit}>
          <span className="btn-icon i-carbon-edit" />
          Edit
        </button>
        <button className="delete-btn" onClick={onDelete}>
          <span className="btn-icon i-carbon-trash-can" />
          Delete
        </button>
        {!addr.isDefault && (
          <button className="default-btn" onClick={onSetDefault}>
            Set as default
          </button>
        )}
      </div>
    </div>
  );
}

// ── Address Form ──

function AddressForm({
  title,
  data,
  submitting,
  onChange,
  onSubmit,
  onClose,
}: {
  title: string;
  data: AddressFormData;
  submitting: boolean;
  onChange: (field: keyof AddressFormData, value: string | boolean) => void;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <div className="address-form-overlay">
      <div className="address-form-header">
        <button className="form-back-btn" onClick={onClose}>
          <span className="i-carbon-arrow-left" />
        </button>
        <span className="form-title">{title}</span>
      </div>

      <form className="address-form-body" onSubmit={onSubmit}>
        <div className="form-group">
          <label className="form-label">
            Recipient <span className="required">*</span>
          </label>
          <input
            className="form-input"
            value={data.recipient}
            onChange={(e) => onChange('recipient', e.target.value)}
            placeholder="Full name"
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Phone <span className="required">*</span>
          </label>
          <input
            className="form-input"
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="Phone number"
            type="tel"
            maxLength={20}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Region <span className="required">*</span>
          </label>
          <div className="form-row">
            <input
              className="form-input"
              value={data.province}
              onChange={(e) => onChange('province', e.target.value)}
              placeholder="Province"
              maxLength={50}
            />
            <input
              className="form-input"
              value={data.city}
              onChange={(e) => onChange('city', e.target.value)}
              placeholder="City"
              maxLength={50}
            />
            <input
              className="form-input"
              value={data.district}
              onChange={(e) => onChange('district', e.target.value)}
              placeholder="District"
              maxLength={50}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Address <span className="required">*</span>
          </label>
          <input
            className="form-input"
            value={data.address}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder="Street, building, apartment"
            maxLength={200}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Label</label>
          <input
            className="form-input"
            value={data.label}
            onChange={(e) => onChange('label', e.target.value)}
            placeholder='e.g. "Home", "Office"'
            maxLength={50}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Postal Code</label>
          <input
            className="form-input"
            value={data.postalCode}
            onChange={(e) => onChange('postalCode', e.target.value)}
            placeholder="Postal code (optional)"
            maxLength={10}
          />
        </div>

        <label className="form-default-toggle">
          <input
            type="checkbox"
            checked={data.isDefault}
            onChange={(e) => onChange('isDefault', e.target.checked)}
          />
          <span>Set as default address</span>
        </label>

        <button className="form-submit-btn" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Address'}
        </button>
      </form>
    </div>
  );
}

// ── Skeleton ──

function AddressSkeleton() {
  return (
    <div className="amz-address">
      <div className="address-add-btn" style={{ opacity: 0.5, pointerEvents: 'none' }}>
        <span className="add-icon i-carbon-add" />
        Add a new address
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="address-card">
          <Skeleton className="w-3/5 h-16 rounded-4 mb-8" />
          <Skeleton className="w-full h-14 rounded-4 mb-4" />
          <Skeleton className="w-4/5 h-14 rounded-4" />
        </div>
      ))}
    </div>
  );
}
