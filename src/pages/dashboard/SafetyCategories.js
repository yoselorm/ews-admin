import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; 
import { fetchCategories, createCategory, updateCategory, deleteCategory, resetStatus } from '../../redux/SafetyCategorySlice';
import { Plus, Edit3, Trash2, X, Loader2, ShieldAlert, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

const DEFAULT_FORM = { name: '', icon_name: 'thermometer', is_active: true };


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


const SafetyCategories = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  const { list, loading, actionLoading, success, error } = useSelector((state) => state.safetyCategories);
  
  const [modal, setModal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  useEffect(() => {
    if (success) {
      closeModal();
      dispatch(fetchCategories());
      dispatch(resetStatus());
    }
  }, [success, dispatch]);

  const closeModal = () => { 
    setModal(null); 
    setSelectedItem(null); 
    setFormData(DEFAULT_FORM); 
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setFormData({ name: item.name, icon_name: item.icon_name, is_active: item.is_active });
    setModal('edit');
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteCategory(selectedItem.id)).unwrap();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">

          <button
            onClick={() => navigate('/dashboard/safety-guides')}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">Guide Categories</h1>
            <p className="text-slate-500 text-sm">Organize safety guides by topic.</p>
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
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Category Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Icon Reference</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="4" className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-purple-600" /></td></tr>
            ) : list.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                <td className="px-6 py-4 text-sm text-slate-500"><code>{item.icon_name}</code></td>
                <td className="px-6 py-4">
                  {item.is_active ? 
                    <span className="text-emerald-600 text-xs font-bold flex items-center gap-1"><CheckCircle size={14}/> Active</span> :
                    <span className="text-slate-400 text-xs font-bold flex items-center gap-1"><XCircle size={14}/> Inactive</span>
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
        <ModalShell title={modal === 'add' ? "New Category" : "Edit Category"} closeModal={closeModal}>
          <div className="p-6 space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-center gap-2"><ShieldAlert size={14}/>{error}</div>}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Name</label>
              <input 
                className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500" 
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Icon Name (Lucide/CSS)</label>
              <input 
                className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500" 
                value={formData.icon_name} onChange={(e) => setFormData({...formData, icon_name: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="cat_active" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 accent-purple-600" />
              <label htmlFor="cat_active" className="text-sm font-bold text-slate-700">Category is active</label>
            </div>
          </div>
          <div className="p-6 pt-0 flex gap-3">
            <button onClick={closeModal} className="flex-1 py-3 border rounded-xl font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button 
              onClick={() => modal === 'add' ? dispatch(createCategory(formData)) : dispatch(updateCategory({id: selectedItem.id, data: formData}))}
              disabled={actionLoading}
              className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 flex justify-center items-center gap-2"
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
              <h3 className="text-lg font-bold">Delete Category?</h3>
              <p className="text-sm text-slate-500">This will remove <span className="font-bold">"{selectedItem?.name}"</span>. This action cannot be undone.</p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <button onClick={closeModal} className="flex-1 py-3 border rounded-xl font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleDelete} disabled={actionLoading} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold flex justify-center items-center gap-2">
                {actionLoading ? <Loader2 className="animate-spin" size={18} /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  );
};

export default SafetyCategories;