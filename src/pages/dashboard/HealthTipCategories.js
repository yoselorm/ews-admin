import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchHealthTipCategories, createHealthTipCategory,
    updateHealthTipCategory, deleteHealthTipCategory, resetCategoryStatus
} from '../../redux/HealthTipCategorySlice';
import { Plus, Edit3, Trash2, X, Loader2, ShieldAlert, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import toast from '../../components/Toast';

const DEFAULT_FORM = { name: '', icon_name: '', is_active: true };

const ModalShell = ({ title, children, closeModal }) => createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}>
        <style>{`@keyframes mIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}.m-card{animation:mIn .2s ease-out}`}</style>
        <div className="m-card bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            {children}
        </div>
    </div>, document.body
);

const HealthTipCategories = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { list, loading, actionLoading, success, error } = useSelector((state) => state.healthTipCategories);

    const [modal, setModal] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState(DEFAULT_FORM);

    useEffect(() => {
        dispatch(fetchHealthTipCategories());

    }, [dispatch]);

    useEffect(() => {
        if (success) {
            closeModal();
            dispatch(fetchHealthTipCategories());
            dispatch(resetCategoryStatus());
        }
    }, [success, dispatch]);

    const closeModal = () => {
        setModal(null);
        setSelectedItem(null);
        setFormData(DEFAULT_FORM);
    };

    const openEdit = (item) => {
        setSelectedItem(item);
        setFormData({ name: item.name, icon_name: item.icon_name || '', is_active: item.is_active });
        setModal('edit');
    };

    const handleAction = async () => {
        try {
            if (modal === 'add') {
                await dispatch(createHealthTipCategory(formData)).unwrap();
                toast.success("Category created successfully!");
            } else {
                await dispatch(updateHealthTipCategory({ id: selectedItem.id, data: formData })).unwrap();
                toast.success("Category updated successfully!");
            }
        } catch (err) {
            toast.error(err || "Action failed. Please check your inputs.");
        }
    };

    const handleDelete = async () => {
        try {
            await dispatch(deleteHealthTipCategory(selectedItem.id)).unwrap();
            toast.success("Category removed.");
            closeModal();
        } catch (err) {
            toast.error(err || "Failed to delete.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/dashboard/health-tips')}
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Health Tip Categories</h1>
                        <p className="text-slate-500 text-sm">Categorize educational content for mothers.</p>
                    </div>
                </div>

                <button onClick={() => setModal('add')} className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all">
                    <Plus size={20} /> Add Category
                </button>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">icon_name</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="4" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-purple-600" /></td></tr>
                        ) : list?.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{item.icon_name || '—'}</td>
                                <td className="px-6 py-4">
                                    {item.is_active ?
                                        <span className="text-emerald-600 text-[10px] font-black uppercase flex items-center gap-1.5"><CheckCircle size={14} /> Active</span> :
                                        <span className="text-slate-400 text-[10px] font-black uppercase flex items-center gap-1.5"><XCircle size={14} /> Inactive</span>
                                    }
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => openEdit(item)} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"><Edit3 size={18} /></button>
                                    <button onClick={() => { setSelectedItem(item); setModal('delete'); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add / Edit Modal */}
            {(modal === 'add' || modal === 'edit') && (
                <ModalShell title={modal === 'add' ? "New Health Category" : "Edit Health Category"} closeModal={closeModal}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Category Name</label>
                            <input
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Nutrition"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">icon_name (Optional)</label>
                            <input
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                                value={formData.icon_name} onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                                placeholder=""
                            />
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <input
                                type="checkbox" id="cat_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-5 h-5 accent-purple-600 rounded-lg"
                            />
                            <label htmlFor="cat_active" className="text-sm font-bold text-slate-700">Set as Active</label>
                        </div>
                    </div>
                    <div className="p-6 pt-0 flex gap-3">
                        <button onClick={closeModal} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                        <button
                            onClick={handleAction}
                            disabled={actionLoading}
                            className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 flex justify-center items-center gap-2 transition-all shadow-lg shadow-purple-100"
                        >
                            {actionLoading ? <Loader2 className="animate-spin" size={20} /> : 'Save Category'}
                        </button>
                    </div>
                </ModalShell>
            )}

            {/* Delete Modal */}
            {modal === 'delete' && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}>
                    <div className="m-card bg-white w-full max-w-sm rounded-3xl p-8 flex flex-col items-center text-center gap-4 shadow-2xl">
                        <div className="p-4 bg-red-50 rounded-2xl text-red-500"><ShieldAlert size={32} /></div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Delete Category?</h3>
                            <p className="text-sm text-slate-500 mt-1">This will remove <span className="font-bold text-slate-700">"{selectedItem?.name}"</span>. This action is permanent.</p>
                        </div>
                        <div className="flex gap-3 w-full mt-4">
                            <button onClick={closeModal} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={handleDelete} disabled={actionLoading} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-red-700 transition-all">
                                {actionLoading ? <Loader2 className="animate-spin" size={18} /> : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>, document.body
            )}
        </div>
    );
};

export default HealthTipCategories;