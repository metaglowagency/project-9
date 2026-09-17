import { useState, useRef } from 'react';
import { supabase } from '../hooks/useProducts';
import { formatPrice } from '../utils';
import { uploadProductImage } from '../utils/image-upload';
import { CsvImportModal } from '../components/CsvImportModal';
import type { Product, VariantOption } from '../types';
import { Plus, Pencil, Trash2, X, Search, Star, Image as ImageIcon, Package, Upload, FileSpreadsheet, Loader2 } from 'lucide-react';

interface ProductAdminProps {
  products: Product[];
  refetch: () => void;
  adminKey: string;
}

interface EditForm {
  handle: string;
  title: string;
  description: string;
  category: string;
  price: string;
  compareAtPrice: string;
  sku: string;
  images: string;
  tags: string;
  featured: boolean;
  variants: VariantOption[];
  variantRows: { options: { name: string; value: string }[]; sku: string; price: number; image?: string }[];
}

const emptyForm: EditForm = {
  handle: '',
  title: '',
  description: '',
  category: '',
  price: '',
  compareAtPrice: '',
  sku: '',
  images: '',
  tags: '',
  featured: false,
  variants: [],
  variantRows: [],
};

export function ProductAdmin({ products, refetch, adminKey }: ProductAdminProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [...new Set(products.map((p) => p.category))].sort();

  const filtered = products.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q);
    }
    return true;
  });

  const startAdd = () => {
    setEditForm(emptyForm);
    setEditId(null);
    setEditing(true);
    setError('');
    setSuccessMsg('');
  };

  const startEdit = (p: Product) => {
    setEditForm({
      handle: p.handle,
      title: p.title,
      description: p.description,
      category: p.category,
      price: String(p.price),
      compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : '',
      sku: p.sku,
      images: p.images.join('\n'),
      tags: p.tags.join(', '),
      featured: p.featured ?? false,
      variants: p.variants,
      variantRows: p.variantRows,
    });
    setEditId(p.handle);
    setEditing(true);
    setError('');
    setSuccessMsg('');
  };

  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true);
    setError('');
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadProductImage(file);
        newUrls.push(url);
      }
      const existing = editForm.images.split('\n').map((s) => s.trim()).filter(Boolean);
      const combined = [...existing, ...newUrls].join('\n');
      setEditForm((f) => ({ ...f, images: combined }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not upload image.';
      setError(msg);
    }
    setUploadingImages(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    const images = editForm.images.split('\n').map((s) => s.trim()).filter(Boolean);
    images.splice(index, 1);
    setEditForm((f) => ({ ...f, images: images.join('\n') }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const images = editForm.images.split('\n').map((s) => s.trim()).filter(Boolean);
    const tags = editForm.tags.split(',').map((s) => s.trim()).filter(Boolean);
    const price = parseFloat(editForm.price);
    const compareAt = editForm.compareAtPrice ? parseFloat(editForm.compareAtPrice) : null;

    if (!editForm.title || !editForm.handle || !editForm.category || !editForm.sku || isNaN(price)) {
      setError('Title, handle, category, SKU, and price are required.');
      setSaving(false);
      return;
    }

    if (images.length === 0) {
      setError('At least one image is required. Upload a file or paste an image URL.');
      setSaving(false);
      return;
    }

    const payload = {
      handle: editForm.handle,
      title: editForm.title,
      description: editForm.description,
      category: editForm.category,
      tags,
      price,
      compare_at_price: compareAt,
      sku: editForm.sku,
      images,
      variants: editForm.variants,
      variant_rows: editForm.variantRows,
      featured: editForm.featured,
    };

    try {
      const { error } = await supabase.rpc('admin_upsert_product', {
        p_password: adminKey,
        p_payload: payload,
        p_handle: editId,
      });
      if (error) throw error;
      await refetch();
      setEditing(false);
      setSuccessMsg(editId ? 'Product updated successfully.' : 'Product added successfully.');
    } catch (err: unknown) {
      console.error('Failed to save product:', err);
      setError('Could not save this product. Please check the details and try again.');
    }
    setSaving(false);
  };

  const handleDelete = async (handle: string) => {
    setDeleting(true);
    setError('');
    try {
      const { error } = await supabase.rpc('admin_delete_product', {
        p_password: adminKey,
        p_handle: handle,
      });
      if (error) throw error;
      await refetch();
      setConfirmDelete(null);
      setSuccessMsg('Product deleted successfully.');
    } catch (err: unknown) {
      console.error('Failed to delete product:', err);
      setError('Could not delete this product. Please try again.');
    }
    setDeleting(false);
  };

  const addVariant = () => {
    setEditForm((f) => ({
      ...f,
      variants: [...f.variants, { name: '', values: [] }],
    }));
  };

  const updateVariant = (idx: number, name: string, valuesStr: string) => {
    setEditForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) =>
        i === idx ? { name, values: valuesStr.split(',').map((s) => s.trim()).filter(Boolean) } : v
      ),
    }));
  };

  const removeVariant = (idx: number) => {
    setEditForm((f) => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== idx),
    }));
  };

  const imageList = editForm.images.split('\n').map((s) => s.trim()).filter(Boolean);

  if (editing) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            {editId ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={() => setEditing(false)} className="w-9 h-9 rounded-full hover:bg-stone-100 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-900 mb-1.5">Product Title *</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-900 mb-1.5">URL Handle *</label>
              <input
                type="text"
                value={editForm.handle}
                onChange={(e) => setEditForm({ ...editForm, handle: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') })}
                placeholder="e.g. darwin-7-seater-corner-set"
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-sm font-mono focus:outline-none focus:border-green-700"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-900 mb-1.5">Description *</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-700"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-900 mb-1.5">Category *</label>
              <input
                type="text"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                list="cat-list"
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-700"
                required
              />
              <datalist id="cat-list">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-900 mb-1.5">Price (£) *</label>
              <input
                type="number"
                step="0.01"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-900 mb-1.5">Compare-at Price (£)</label>
              <input
                type="number"
                step="0.01"
                value={editForm.compareAtPrice}
                onChange={(e) => setEditForm({ ...editForm, compareAtPrice: e.target.value })}
                placeholder="Original price (for sales)"
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-900 mb-1.5">SKU *</label>
              <input
                type="text"
                value={editForm.sku}
                onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-sm font-mono focus:outline-none focus:border-green-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-900 mb-1.5">Tags (comma-separated)</label>
              <input
                type="text"
                value={editForm.tags}
                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                placeholder="garden, rattan, outdoor"
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-700"
              />
            </div>
          </div>

          {/* Images section: upload + URL paste */}
          <div>
            <label className="block text-sm font-semibold text-stone-900 mb-1.5">Product Images *</label>

            {/* Upload button */}
            <div className="flex items-center gap-3 mb-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImages}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-stone-300 rounded-lg text-sm font-medium text-stone-600 hover:border-green-700 hover:text-green-800 transition-colors disabled:opacity-50"
              >
                {uploadingImages ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Upload from computer</>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) handleImageUpload(e.target.files);
                }}
              />
              <span className="text-xs text-stone-400">Files are hosted on your own site</span>
            </div>

            {/* Uploaded/added images preview */}
            {imageList.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-3">
                {imageList.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-stone-200" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* URL paste textarea */}
            <label className="block text-xs text-stone-500 mb-1">Or paste image URLs (one per line):</label>
            <textarea
              value={editForm.images}
              onChange={(e) => setEditForm({ ...editForm, images: e.target.value })}
              rows={3}
              placeholder="https://example.com/product-image.jpg"
              className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-sm font-mono focus:outline-none focus:border-green-700"
            />
          </div>

          {/* Variants editor */}
          <div className="border border-stone-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-stone-900">Variants (optional)</label>
              <button type="button" onClick={addVariant} className="flex items-center gap-1 text-xs font-medium text-green-800 hover:text-green-900">
                <Plus className="w-3.5 h-3.5" /> Add Variant
              </button>
            </div>
            {editForm.variants.length === 0 ? (
              <p className="text-xs text-stone-500">No variants. Products with no variants have a single price.</p>
            ) : (
              <div className="space-y-3">
                {editForm.variants.map((v, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => updateVariant(idx, e.target.value, v.values.join(', '))}
                      placeholder="Option name (e.g. Color)"
                      className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-700"
                    />
                    <input
                      type="text"
                      value={v.values.join(', ')}
                      onChange={(e) => updateVariant(idx, v.name, e.target.value)}
                      placeholder="Values (comma-separated)"
                      className="flex-[2] px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-700"
                    />
                    <button type="button" onClick={() => removeVariant(idx)} className="w-9 h-9 rounded-lg hover:bg-red-50 flex items-center justify-center shrink-0">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.featured}
                onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })}
                className="w-4 h-4 accent-green-800"
              />
              <span className="text-sm font-medium text-stone-900 flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500" /> Featured (show on homepage)
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-stone-200">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-green-800 text-white rounded-full font-semibold text-sm hover:bg-green-900 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : editId ? 'Save Changes' : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-6 py-2.5 text-stone-600 rounded-full font-semibold text-sm hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-green-600 hover:text-green-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <CsvImportModal
        open={showCsvImport}
        onClose={() => setShowCsvImport(false)}
        adminKey={adminKey}
        onDone={() => { void refetch(); setShowCsvImport(false); setSuccessMsg('Products imported successfully.'); }}
        existingHandles={products.map((p) => p.handle)}
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU, or handle..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-700"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-stone-300 text-sm bg-white focus:outline-none focus:border-green-700 cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={() => setShowCsvImport(true)}
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 border border-green-800 text-green-800 rounded-lg font-semibold text-sm hover:bg-green-50 transition-colors whitespace-nowrap"
        >
          <FileSpreadsheet className="w-4 h-4" /> Import CSV
        </button>
        <button
          onClick={startAdd}
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-green-800 text-white rounded-lg font-semibold text-sm hover:bg-green-900 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Products grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500 text-lg mb-2">No products found</p>
          <button onClick={startAdd} className="text-green-800 font-medium text-sm hover:underline">
            Add your first product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const hasDiscount = p.compareAtPrice && p.compareAtPrice > p.price;
            return (
              <div key={p.handle} className="bg-white rounded-xl border border-stone-200 overflow-hidden group">
                <div className="flex gap-3 p-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-stone-50 shrink-0">
                    {p.images[0] ? (
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-stone-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-500 mb-0.5">{p.category}</p>
                    <h3 className="text-sm font-semibold text-stone-900 line-clamp-2 leading-snug mb-1">{p.title}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold text-stone-900">{formatPrice(p.price)}</span>
                      {hasDiscount && (
                        <span className="text-xs text-stone-400 line-through">{formatPrice(p.compareAtPrice!)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-stone-400 font-mono">{p.sku}</span>
                      {p.featured && (
                        <span className="flex items-center gap-0.5 text-xs text-amber-600 font-medium">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex border-t border-stone-100">
                  <button
                    onClick={() => startEdit(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <div className="w-px bg-stone-100" />
                  <button
                    onClick={() => setConfirmDelete(p.handle)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !deleting && setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">Delete this product?</h3>
            <p className="text-sm text-stone-600 mb-5">
              This will permanently remove the product from your store. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-full font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : 'Delete'}
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="flex-1 py-2.5 text-stone-600 rounded-full font-semibold text-sm hover:bg-stone-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
