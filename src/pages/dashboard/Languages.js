import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchLanguages, createLanguage, updateLanguage, deleteLanguage 
} from '../../redux/LanguageSlice';
import { 
  Plus, Search, Edit3, Trash2, Languages, Check, X, 
  Loader2, AlertTriangle, Globe
} from 'lucide-react';

import Pagination from '../../components/Pagination'; 

const LanguageManagement = () => {
  const dispatch = useDispatch();
  const { languages, loading, actionLoading, meta } = useSelector((state) => state.languages);

  // States
  const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetLang, setTargetLang] = useState(null); // Used for both Edit and Delete
  const [formData, setFormData] = useState({ name: '', code: '', is_active: true });
  
  const [filters, setFilters] = useState({ search: '', is_active: '', page: 1, limit: 10 });

  useEffect(() => {
    dispatch(fetchLanguages(filters));
  }, [filters, dispatch]);

  // --- Handlers ---
  const handleUpsert = async (e) => {
    e.preventDefault();
    const action = targetLang 
      ? updateLanguage({ id: targetLang.id, langData: formData }) 
      : createLanguage(formData);
    
    const result = await dispatch(action);
    if (!result.error) setIsUpsertModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!targetLang) return;
    const result = await dispatch(deleteLanguage(targetLang.id));
    if (!result.error) setIsDeleteModalOpen(false);
  };

  const openUpsert = (lang = null) => {
    setTargetLang(lang);
    setFormData(lang ? { name: lang.name, code: lang.code, is_active: lang.is_active } : { name: '', code: '', is_active: true });
    setIsUpsertModalOpen(true);
  };

  const openDelete = (lang) => {
    setTargetLang(lang);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="p-10 bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
            <Languages className="text-purple-600" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Languages</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Global Localization Hub</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => openUpsert()}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          Add Language
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-[28px] border border-white shadow-sm mb-8 flex items-center gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search language name or code..."
            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all"
            onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
          />
        </div>
        <select 
          className="bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-600 outline-none focus:ring-4 focus:ring-purple-500/5 transition-all"
          onChange={(e) => setFilters({...filters, is_active: e.target.value, page: 1})}
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-auto">
        <table className="w-full">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Language</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Code</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Visibility</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[3px] text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="4" className="py-32 text-center"><Loader2 className="animate-spin mx-auto text-purple-600" size={40} /></td></tr>
            ) : languages.map((lang) => (
              <tr key={lang.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-10 py-7">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 font-black">
                      {lang.code.toUpperCase()}
                    </div>
                    <span className="font-extrabold text-slate-800 text-lg">{lang.name}</span>
                  </div>
                </td>
                <td className="px-10 py-7">
                  <span className="text-sm font-black text-slate-400 font-mono tracking-widest">{lang.code}</span>
                </td>
                <td className="px-10 py-7">
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${lang.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${lang.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {lang.is_active ? 'Active' : 'Disabled'}
                  </div>
                </td>
                <td className="px-10 py-7 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button onClick={() => openUpsert(lang)} className="p-3 bg-white shadow-sm border border-slate-100 rounded-xl text-slate-400 hover:text-purple-600 hover:border-purple-100 transition-all">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => openDelete(lang)} className="p-3 bg-white shadow-sm border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-100 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination 
          currentPage={meta.current_page} 
          totalItems={meta.total} 
          perPage={filters.limit} 
          onPageChange={(p) => setFilters({...filters, page: p})} 
        />
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {/* Backdrop for both modals */}
        {(isUpsertModalOpen || isDeleteModalOpen) && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            {/* 1. Upsert Modal */}
            {isUpsertModalOpen && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }}
                className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden relative"
              >
                <div className="p-12">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{targetLang ? 'Edit Language' : 'New Language'}</h2>
                    <button onClick={() => setIsUpsertModalOpen(false)} className="p-3 bg-slate-50 rounded-full text-slate-400 hover:rotate-90 transition-all"><X size={20} /></button>
                  </div>

                  <form onSubmit={handleUpsert} className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Display Name</label>
                      <input 
                        required placeholder="e.g. English" value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-[24px] p-6 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">ISO-639-1 Code</label>
                      <input 
                        required maxLength={2} placeholder="en" value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value.toLowerCase()})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-[24px] p-6 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all uppercase"
                      />
                    </div>

                    <div 
                      onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                      className={`flex items-center justify-between p-7 rounded-[32px] border-2 cursor-pointer transition-all ${formData.is_active ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}
                    >
                      <span className={`font-black text-sm uppercase tracking-wider ${formData.is_active ? 'text-emerald-700' : 'text-slate-500'}`}>Status: {formData.is_active ? 'Enabled' : 'Disabled'}</span>
                      <div className={`w-14 h-8 rounded-full p-1 ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <motion.div animate={{ x: formData.is_active ? 24 : 0 }} className="w-6 h-6 bg-white rounded-full shadow-md" />
                      </div>
                    </div>

                    <button disabled={actionLoading} type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                      {actionLoading ? <Loader2 className="animate-spin" size={24} /> : (targetLang ? 'Save Changes' : 'Create Language')}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* 2. Delete Confirmation Modal */}
            {isDeleteModalOpen && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }}
                className="bg-white w-full max-w-md rounded-[48px] shadow-2xl overflow-hidden text-center"
              >
                <div className="p-12">
                  <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-red-100">
                    <AlertTriangle className="text-red-500" size={48} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Are you sure?</h2>
                  <p className="text-slate-500 font-medium leading-relaxed mb-10 px-4">
                    You are about to delete <span className="text-slate-900 font-bold underline decoration-red-200 decoration-4 underline-offset-4">{targetLang?.name}</span>. This action is irreversible.
                  </p>
                  
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={confirmDelete} 
                      disabled={actionLoading}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-6 rounded-[28px] font-black shadow-xl shadow-red-100 transition-all flex items-center justify-center gap-3"
                    >
                      {actionLoading ? <Loader2 className="animate-spin" size={24} /> : 'Yes, Delete Permanently'}
                    </button>
                    <button 
                      onClick={() => setIsDeleteModalOpen(false)} 
                      className="w-full bg-slate-50 text-slate-500 py-6 rounded-[28px] font-black hover:bg-slate-100 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageManagement;