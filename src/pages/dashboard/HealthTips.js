import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAdminHealthTips, createHealthTip, updateHealthTip, deleteHealthTip, resetHealthTipStatus
} from '../../redux/HealthTipsSlice';
import Pagination from '../../components/Pagination';
import {
    Plus, Search, Trash2, Edit3, Loader2, X, CheckCircle2, XCircle, AlertTriangle,
    Layers, ImagePlus, ImageOff,
    Settings,
    Copy
} from 'lucide-react';
import toast from '../../components/Toast';
import { useNavigate } from 'react-router-dom';
import { fetchHealthTipCategories } from '../../redux/HealthTipCategorySlice';
import { copyToClipboard } from '../../utils/clipboard';

const DEFAULT_FORM = {
    title: '',
    content: '',
    trimester: '1',
    category_id: '',
    image: '',
    is_active: true
};


// ─── Form ──────────────────────────────────────────────────────────────────────
const HealthTipFormBody = ({modal, formData, setFormData, imageFile, setImageFile,categories }) => {
    const [imagePreview, setImagePreview] = useState(formData.image || null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setFormData({ ...formData, image: '' });
    };

    return (
        <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
                    { modal === "edit" && (
            <div className="col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Health Tip ID</label>
                <div className="relative group">
                    <input
                        type="text"
                        readOnly
                    value={formData.id}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 pr-12 text-sm font-mono text-slate-500 outline-none transition-all cursor-default"
                />
                <button
                    type="button"
                    onClick={() => copyToClipboard(formData.id, "Health Tip ID")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-purple-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-100"
                    title="Copy to clipboard"
                >
                    <Copy size={16} />
                </button>
            </div>
        </div>)}
                <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block tracking-wider">Tip Title</label>
                    <input
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        placeholder="e.g. Benefits of hydration"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block tracking-wider">Trimester</label>
                    <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        value={formData.trimester}
                        onChange={(e) => setFormData({ ...formData, trimester: e.target.value })}
                    >
                        <option value="1">1st Trimester</option>
                        <option value="2">2nd Trimester</option>
                        <option value="3">3rd Trimester</option>
                    </select>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block tracking-wider">Category</label>
                    <select
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    >
                        <option value="">Select Category...</option>
                        {categories?.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block tracking-wider">Health Content</label>
                <textarea
                    required rows="5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                    placeholder="Write the detailed health tip here..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
            </div>

            {/* Image Upload */}
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block tracking-wider">Tip Image</label>

                {imagePreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                        <img
                            src={imagePreview}
                            alt="Tip preview"
                            className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                            <div className="flex gap-2">
                                <label className="cursor-pointer bg-white text-slate-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 shadow-md transition-all">
                                    <ImagePlus size={16} /> Replace
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-red-600 shadow-md transition-all"
                                >
                                    <ImageOff size={16} /> Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-2xl py-8 bg-slate-50 hover:border-purple-400 hover:bg-purple-50/30 transition-all group">
                        <div className="p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-all">
                            <ImagePlus size={24} className="text-slate-400 group-hover:text-purple-500 transition-all" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-slate-600 group-hover:text-purple-600 transition-all">Click to upload image</p>
                            <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5MB</p>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                )}
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                    <p className="text-sm font-bold text-slate-700">Display Status</p>
                    <p className="text-[10px] text-slate-400">Make this tip visible to users immediately</p>
                </div>
                <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${formData.is_active ? 'bg-green-500' : 'bg-slate-300'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_active ? 'left-7' : 'left-1'}`} />
                </button>
            </div>
        </div>
    );
};

// ─── Modal Shell ───────────────────────────────────────────────────────────────
const ModalShell = ({ title, onClose, children }) => createPortal(
    <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
        <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-all">
                    <X size={24} />
                </button>
            </div>
            <div className="overflow-y-auto">{children}</div>
        </div>
    </div>,
    document.body
);

// ─── Main Component ────────────────────────────────────────────────────────────
const HealthTips = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { list, meta, loading, actionLoading, success, error } = useSelector((state) => state.healthTips);
    const { list: categories } = useSelector((state) => state.healthTipCategories);


    const [modal, setModal] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [imageFile, setImageFile] = useState(null);
    const [filters, setFilters] = useState({ page: 1, search: '', is_active: '', trimester: '' });

    useEffect(() => {
        dispatch(fetchAdminHealthTips(filters));
    }, [dispatch, filters]);
    useEffect(() => {
        dispatch(fetchHealthTipCategories());
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            closeModal();
            dispatch(resetHealthTipStatus());
        }
    }, [success, dispatch]);

    const closeModal = () => {
        setModal(null);
        setSelectedItem(null);
        setFormData(DEFAULT_FORM);
        setImageFile(null);
    };

    // Build FormData — converts boolean to 1/0, avoids duplicate image
    const buildPayload = () => {
        const body = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value === null || value === undefined) return;
            // Skip image string if we have a new file
            if (key === 'image' && imageFile) return;
            // Convert boolean to 1/0 for multipart
            if (typeof value === 'boolean') {
                body.append(key, value ? '1' : '0');
                return;
            }
            body.append(key, value);
        });
        if (imageFile) {
            body.append('image', imageFile);
        }
        return body;
    };

    const handleAction = async (e) => {
        if (e) e.preventDefault();
        try {
            if (modal === 'edit') {
                await dispatch(updateHealthTip({ id: selectedItem.id, data: buildPayload() })).unwrap();
                toast.success('Health tip updated successfully!');
            } else {
                await dispatch(createHealthTip(buildPayload())).unwrap();
                toast.success('New health tip added!');
            }
        } catch (err) {
            toast.error(err || 'An error occurred.');
        }
    };

    const handleDelete = async () => {
        try {
            await dispatch(deleteHealthTip(selectedItem.id)).unwrap();
            toast.success('Health tip deleted.');
            closeModal();
        } catch (err) {
            toast.error(err || 'Failed to delete.');
        }
    };

    const openEdit = (item) => {
        setSelectedItem(item);
        setFormData({
            id: item.id,
            title: item.title,
            content: item.content,
            trimester: item.trimester.toString(),
            category_id: item.category?.id,
            image: item.image || '',
            is_active: item.is_active,
        });
        setImageFile(null);
        setModal('edit');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Health Tips</h1>
                    <p className="text-slate-500 text-sm">Manage educational content for mothers.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/dashboard/health-tip-categories')}
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Layers size={20} className="text-purple-500" /> Categories
                    </button>
                    <button
                        onClick={() => setModal('add')}
                        className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                    >
                        <Plus size={20} /> Add New Tip
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search tips..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    />
                </div>
                <select
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
                    onChange={(e) => setFilters({ ...filters, trimester: e.target.value, page: 1 })}
                >
                    <option value="">All Trimesters</option>
                    <option value="1">Trimester 1</option>
                    <option value="2">Trimester 2</option>
                    <option value="3">Trimester 3</option>
                </select>
                <select
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
                    onChange={(e) => setFilters({ ...filters, is_active: e.target.value, page: 1 })}
                >
                    <option value="">All Statuses</option>
                    <option value="1">Active Only</option>
                    <option value="0">Inactive Only</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/80 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Content</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trimester / Category</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="4" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-purple-600" /></td></tr>
                        ) : list.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-6 py-4 max-w-sm">
                                    <div className="flex items-center gap-3">
                                        {/* Thumbnail if image exists */}
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-11 h-11 rounded-xl object-cover border border-slate-100 shrink-0"
                                            />
                                        ) : (
                                            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                                                <ImageOff size={18} className="text-purple-300" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <span className="font-bold text-slate-800 block truncate">{item.title}</span>
                                            <p className="text-xs text-slate-400 line-clamp-1">{item.content}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                   <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold uppercase border border-purple-100">
    T{item.trimester} • {item.category?.name ?? item.category ?? '—'}
</span>
                                </td>
                                <td className="px-6 py-4">
                                    {item.is_active ? (
                                        <div className="flex items-center gap-1.5 text-green-600 font-bold text-[10px] uppercase">
                                            <CheckCircle2 size={14} /> Active
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase">
                                            <XCircle size={14} /> Inactive
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right space-x-1">
                                    <button onClick={() => openEdit(item)} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"><Settings size={18} /></button>
                                    <button onClick={() => { setSelectedItem(item); setModal('delete'); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <Pagination
                    currentPage={filters.page}
                    totalItems={meta?.total || 0}
                    perPage={meta?.per_page || 15}
                    onPageChange={(p) => setFilters({ ...filters, page: p })}
                />
            </div>

            {/* Add / Edit Modal */}
            {(modal === 'add' || modal === 'edit') && (
                <ModalShell title={modal === 'add' ? 'New Health Tip' : 'Edit Health Tip'} onClose={closeModal}>
                    <HealthTipFormBody
                        formData={formData}
                        setFormData={setFormData}
                        imageFile={imageFile}
                        categories={categories}
                        setImageFile={setImageFile}
                        modal={modal}
                    />
                    <div className="px-6 pb-6 flex gap-3">
                        <button onClick={closeModal} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                        <button
                            onClick={handleAction}
                            disabled={actionLoading}
                            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
                        >
                            {actionLoading ? <Loader2 className="animate-spin" size={20} /> : (modal === 'add' ? 'Create Tip' : 'Update Tip')}
                        </button>
                    </div>
                </ModalShell>
            )}

            {/* Delete Modal */}
            {modal === 'delete' && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}>
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center gap-4">
                        <div className="p-4 bg-red-50 rounded-2xl text-red-500"><AlertTriangle size={32} /></div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Delete Health Tip</h3>
                            <p className="text-slate-500 text-sm mt-1">This will permanently remove <span className="font-semibold text-slate-700">"{selectedItem?.title}"</span>.</p>
                        </div>
                        <div className="flex gap-3 w-full pt-2">
                            <button onClick={closeModal} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={handleDelete} disabled={actionLoading} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 flex justify-center items-center gap-2 transition-all">
                                {actionLoading ? <Loader2 className="animate-spin" size={18} /> : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default HealthTips;