import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchSafetyGuides, createSafetyGuide, updateSafetyGuide, deleteSafetyGuide, resetSafetyGuideStatus
} from '../../redux/SafetyGuideSlice';
import { fetchThresholds } from '../../redux/ThresholdSlice';
import { fetchCategories } from '../../redux/SafetyCategorySlice';
import Pagination from '../../components/Pagination';
import {
    Plus, Search, Trash2, Edit3, BookOpen,
    Loader2, X, ShieldAlert, CheckCircle, XCircle, Tag, Layers,
    ImagePlus, ImageOff,
    Settings,
    Copy
} from 'lucide-react';
import toast from '../../components/Toast';
import { copyToClipboard } from '../../utils/clipboard';

const DEFAULT_FORM = {
    threshold_id: '',
    target_role: 'all',
    category_id: '',
    title: '',
    content: '',
    icon_name: 'info',
    sort_order: 0,
    is_active: true,
    image: '',
};

// --- Form Component ---
const GuideFormBody = ({ modal, formData, setFormData, thresholds, categories, error, imageFile, setImageFile }) => {
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
        <div className="p-6 space-y-4">
            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                    <ShieldAlert size={16} />{error}
                </div>
            )}

            {modal === "edit" && (
                <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Safety Guide ID</label>
                    <div className="relative group">
                        <input
                            type="text"
                            readOnly 
                            value={formData.id}
                            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 pr-12 text-sm font-mono text-slate-500 outline-none transition-all cursor-default"
                            placeholder="e.g. THRESHOLD_001"
                        />
                        <button
                            type="button"
                            onClick={() => copyToClipboard(formData.id, "Safety Guide ID")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-purple-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-slate-100"
                            title="Copy to clipboard"
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                </div>)}

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block tracking-wider">Guide Title</label>
                    <input
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        placeholder="e.g. Heatwave Preparation"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
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

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block tracking-wider">Target Role</label>
                    <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        value={formData.target_role}
                        onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                    >
                        <option value="all">All Users</option>
                        <option value="pregnant_woman">Pregnant Woman</option>
                        <option value="lactating_mother">Lactating Mother</option>
                        <option value="health_worker">Health Worker</option>
                    </select>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block tracking-wider">Link Threshold</label>
                    <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        value={formData.threshold_id}
                        onChange={(e) => setFormData({ ...formData, threshold_id: e.target.value })}
                    >
                        <option value="">No specific trigger</option>
                        {thresholds?.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block tracking-wider">Sort Order</label>
                    <input
                        type="number"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        value={formData.sort_order}
                        onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    />
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block tracking-wider">Guide Content</label>
                <textarea
                    required
                    rows="4"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                    placeholder="Provide detailed instructions..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
            </div>

            {/* Image Upload */}
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block tracking-wider">Guide Image</label>

                {imagePreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                        <img
                            src={imagePreview}
                            alt="Guide preview"
                            className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                            <div className="flex gap-2">
                                {/* Replace */}
                                <label className="cursor-pointer bg-white text-slate-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 shadow-md transition-all">
                                    <ImagePlus size={16} /> Replace
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                                {/* Remove */}
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

            <div className="flex items-center gap-2 py-2">
                <input
                    type="checkbox"
                    id="is_active"
                    className="w-4 h-4 accent-purple-600 rounded"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active" className="text-sm font-bold text-slate-700 cursor-pointer">Make this guide active</label>
            </div>
        </div>
    );
};

// --- Modal Wrapper ---
const ModalShell = ({ title, onClose, children }) => createPortal(
    <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
        <style>{`@keyframes mIn{from{opacity:0;transform:scale(.95) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}.m-card{animation:mIn .2s ease-out}`}</style>
        <div className="m-card bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-all"><X size={24} /></button>
            </div>
            <div className="overflow-y-auto">{children}</div>
        </div>
    </div>,
    document.body
);

// --- Main Component ---
const SafetyGuides = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { list, meta, loading, actionLoading, success, error } = useSelector((state) => state.safetyGuides);
    const { list: thresholds } = useSelector((state) => state.thresholds);
    const { list: categories } = useSelector((state) => state.safetyCategories);

    const [modal, setModal] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [imageFile, setImageFile] = useState(null); // the actual File object
    const [filters, setFilters] = useState({ page: 1, search: '', sort: '-created_at' });

    useEffect(() => { dispatch(fetchSafetyGuides(filters)); }, [dispatch, filters]);
    useEffect(() => {
        dispatch(fetchThresholds({ limit: 100 }));
        dispatch(fetchCategories());
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            closeModal();
            dispatch(resetSafetyGuideStatus());
        }
    }, [success, dispatch]);

    const closeModal = () => {
        setModal(null);
        setSelectedItem(null);
        setFormData(DEFAULT_FORM);
        setImageFile(null);
    };

    const openEdit = (item) => {
        setSelectedItem(item);
        setFormData({
            ...item,
            threshold_id: item.threshold_id || '',
            category_id: item.category?.id || '',
            image: item.image || '',
        });
        setImageFile(null); // reset file — preview will show existing image
        setModal('edit');
    };

    // Build FormData payload — appends image file if user picked one
    const buildPayload = () => {
        const body = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
            if (value === null || value === undefined) return;
            if (key === 'image' && imageFile) return;

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

    const handleDelete = async () => {
        if (!selectedItem) return;
        try {
            await dispatch(deleteSafetyGuide(selectedItem.id)).unwrap();
            toast.success('Guide deleted successfully!');
            closeModal();
        } catch (err) {
            toast.error(err || 'Failed to delete guide.');
        }
    };

    const handleCreate = async () => {
        try {
            await dispatch(createSafetyGuide(buildPayload())).unwrap();
            toast.success('Guide created successfully!');
        } catch (err) {
            toast.error(err || 'Failed to create guide.');
        }
    };

    const handleUpdate = async () => {
        if (!selectedItem) return;
        try {
            await dispatch(updateSafetyGuide({ id: selectedItem.id, data: buildPayload() })).unwrap();
            toast.success('Guide updated successfully!');
        } catch (err) {
            toast.error(err || 'Failed to update guide.');
        }
    };

    const FooterButtons = ({ onSubmit, submitLabel }) => (
        <div className="px-6 pb-6 flex gap-3">
            <button onClick={closeModal} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
            <button onClick={onSubmit} disabled={actionLoading} className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 flex justify-center items-center gap-2 transition-all">
                {actionLoading ? <Loader2 className="animate-spin" size={20} /> : submitLabel}
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Safety Guides</h1>
                    <p className="text-slate-500 text-sm">Educational content for different weather conditions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/dashboard/safety-categories')}
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Layers size={20} className="text-purple-500" /> Categories
                    </button>
                    <button onClick={() => setModal('add')} className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all">
                        <Plus size={20} /> Add Guide
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text" placeholder="Search guides..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/80 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Guide</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Category</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="4" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-purple-600" /></td></tr>
                        ) : list?.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex gap-3 items-center">
                                        {/* Show thumbnail if image exists, else icon */}
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-11 h-11 rounded-xl object-cover border border-slate-100 shrink-0"
                                            />
                                        ) : (
                                            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                                                <BookOpen size={20} />
                                            </div>
                                        )}
                                        <div>
                                            <span className="font-bold text-slate-800 block leading-tight">{item.title}</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5 block">Order: {item.sort_order}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-100/50 w-fit px-3 py-1.5 rounded-lg border border-slate-200/50">
                                        <Tag size={14} className="text-purple-500" />
                                        {item.category?.name || 'General'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {item.is_active
                                        ? <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100"><CheckCircle size={14} /> Active</span>
                                        : <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-xs font-bold border border-slate-200"><XCircle size={14} /> Inactive</span>
                                    }
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
                    currentPage={meta?.current_page || 1}
                    totalItems={meta?.total || 0}
                    perPage={meta?.per_page || 15}
                    onPageChange={(p) => setFilters({ ...filters, page: p })}
                />
            </div>

            {/* Add Modal */}
            {modal === 'add' && (
                <ModalShell title="New Safety Guide" onClose={closeModal}>
                    <GuideFormBody
                        formData={formData} setFormData={setFormData}
                        thresholds={thresholds} categories={categories}
                        error={error} imageFile={imageFile} setImageFile={setImageFile}
                    />
                    <FooterButtons onSubmit={handleCreate} submitLabel="Create Guide" />
                </ModalShell>
            )}

            {/* Edit Modal */}
            {modal === 'edit' && (
                <ModalShell title="Update Safety Guide" onClose={closeModal}>
                    <GuideFormBody
                        modal="edit"
                        formData={formData} setFormData={setFormData}
                        thresholds={thresholds} categories={categories}
                        error={error} imageFile={imageFile} setImageFile={setImageFile}
                    />
                    <FooterButtons onSubmit={handleUpdate} submitLabel="Save Changes" />
                </ModalShell>
            )}

            {/* Delete Modal */}
            {modal === 'delete' && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}>
                    <div className="m-card bg-white w-full max-w-sm rounded-3xl p-8 flex flex-col items-center text-center gap-4 shadow-2xl">
                        <div className="p-4 bg-red-50 rounded-2xl text-red-500"><ShieldAlert size={32} /></div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Delete Guide?</h3>
                            <p className="text-sm text-slate-500 mt-1">Permanently remove <span className="font-bold text-slate-700">"{selectedItem?.title}"</span>?</p>
                        </div>
                        <div className="flex gap-3 w-full mt-2">
                            <button onClick={closeModal} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button onClick={handleDelete} disabled={actionLoading} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-red-700 transition-all">
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

export default SafetyGuides;