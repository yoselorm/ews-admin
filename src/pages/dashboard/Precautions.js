import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPrecautions, createPrecaution, updatePrecaution, deletePrecaution, resetPrecautionStatus
} from '../../redux/PrecautionSlice';
import { fetchThresholds } from '../../redux/ThresholdSlice';
import Pagination from '../../components/Pagination';
import {
    Plus, Search, Trash2, Edit3, Loader2, X, ShieldAlert,
} from 'lucide-react';

const DEFAULT_FORM = {
    threshold_id: '',
    target_role: 'pregnant_woman',
    title: '',
    body: ''
};

const TARGET_ROLES = [
    { value: 'pregnant_woman', label: 'Pregnant Woman' },
    { value: 'lactating_mother', label: 'Lactating Mother' },
    { value: 'health_worker', label: 'Health Worker' },
    { value: 'all', label: 'All Users' },
];

const PrecautionFormBody = ({ formData, setFormData, thresholds, error }) => (
    <div className="p-6 space-y-5">
        {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                <ShieldAlert size={16} />{error}
            </div>
        )}

        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block tracking-wider">Title</label>
                <input
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="e.g. Protect You and Your Baby"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block tracking-wider">Target Role</label>
                <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    value={formData.target_role}
                    onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                >
                    {TARGET_ROLES.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block tracking-wider">Trigger Threshold</label>
                <select
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    value={formData.threshold_id}
                    onChange={(e) => setFormData({ ...formData, threshold_id: e.target.value })}
                >
                    <option value="">Select a threshold...</option>
                    {thresholds?.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.parameter})</option>
                    ))}
                </select>
            </div>
        </div>

        <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block tracking-wider">Message Body</label>
            <textarea
                required rows="4"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Provide clear health advice..."
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            />
        </div>
    </div>
);

const ModalShell = ({ title, onClose, children }) => createPortal(
    <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
        <style>{`@keyframes mIn{from{opacity:0;transform:scale(.95) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}.m-card{animation:mIn .2s ease-out}`}</style>
        <div className="m-card bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
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

const Precautions = () => {
    const dispatch = useDispatch();
    const { list, meta, loading, actionLoading, success, error } = useSelector((state) => state.precautions);
    const { list: thresholds } = useSelector((state) => state.thresholds);

    const [modal, setModal] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({ page: 1, search: '', target_role: '', sort: '-created_at' });

    useEffect(() => {
        dispatch(fetchPrecautions(filters));
    }, [dispatch, filters]);

    useEffect(() => {
        dispatch(fetchThresholds({ limit: 100 }));
    }, [dispatch]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        dispatch(fetchPrecautions(filters));
    };

    useEffect(() => {
        if (success) {
            closeModal();
            dispatch(resetPrecautionStatus());
        }
    }, [success, dispatch]);

    const closeModal = () => {
        setModal(null);
        setSelectedItem(null);
        setFormData(DEFAULT_FORM);
    };


    const handleDelete = async () => {
        if (!selectedItem) return;

        try {
            await dispatch(deletePrecaution(selectedItem.id)).unwrap();

            closeModal();
        } catch (err) {
            console.error("Failed to delete:", err);
        }
    };
    const openEdit = (item) => {
        setSelectedItem(item);
        setFormData({
            threshold_id: item.threshold_id || '',
            target_role: item.target_role,
            title: item.title,
            body: item.body
        });
        setModal('edit');
    };

    const FooterButtons = ({ onSubmit, submitLabel }) => (
        <div className="px-6 pb-6 flex gap-3">
            <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
            <button
                onClick={onSubmit}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
            >
                {actionLoading ? <Loader2 className="animate-spin" size={20} /> : submitLabel}
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Health Precautions</h1>
                    <p className="text-slate-500 text-sm">Automated advice linked to weather triggers.</p>
                </div>
                <button
                    onClick={() => setModal('add')}
                    className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                >
                    <Plus size={20} /> Add Precaution
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search precautions..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    />
                </div>
                <select
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
                    onChange={(e) => setFilters({ ...filters, target_role: e.target.value, page: 1 })}
                >
                    <option value="">All Target Roles</option>
                    {TARGET_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/80 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Message Content</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Target</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Threshold</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="4" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-purple-600" /></td></tr>
                        ) : list.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-6 py-4 max-w-sm">
                                    <span className="font-bold text-slate-800 block truncate">{item.title}</span>
                                    <p className="text-xs text-slate-400 line-clamp-1">{item.body}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold uppercase border border-purple-100">
                                        {item.target_role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                    {item.threshold?.name || '---'}
                                </td>
                                <td className="px-6 py-4 text-right space-x-1">
                                    <button onClick={() => openEdit(item)} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"><Edit3 size={18} /></button>
                                    <button onClick={() => { setSelectedItem(item); setModal('delete'); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <Pagination
                    currentPage={currentPage}
                    totalItems={meta?.total || 0}
                    perPage={meta?.per_page || 15}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* Portals */}
            {modal === 'add' && (
                <ModalShell title="New Health Precaution" onClose={closeModal}>
                    <PrecautionFormBody formData={formData} setFormData={setFormData} thresholds={thresholds} error={error} />
                    <FooterButtons onSubmit={() => dispatch(createPrecaution(formData))} submitLabel="Create Precaution" />
                </ModalShell>
            )}

            {modal === 'edit' && (
                <ModalShell title="Edit Precaution" onClose={closeModal}>
                    <PrecautionFormBody formData={formData} setFormData={setFormData} thresholds={thresholds} error={error} />
                    <FooterButtons onSubmit={() => dispatch(updatePrecaution({ id: selectedItem.id, data: formData }))} submitLabel="Update Precaution" />
                </ModalShell>
            )}

            {modal === 'delete' && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}>
                    <div className="m-card bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center gap-4">
                        <div className="p-4 bg-red-50 rounded-2xl text-red-500"><ShieldAlert size={32} /></div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Delete Precaution</h3>
                            <p className="text-slate-500 text-sm mt-1">Permanently remove <span className="font-semibold text-slate-700">"{selectedItem?.title}"</span>?</p>
                        </div>
                        <div className="flex gap-3 w-full pt-2">
                            <button onClick={closeModal} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button onClick={handleDelete} disabled={actionLoading} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 flex justify-center items-center gap-2">
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

export default Precautions;