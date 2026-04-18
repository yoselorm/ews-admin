import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchAdmins, createAdmin, updateAdmin, deleteAdmin 
} from '../../redux/AdminSlice';
import { 
  Plus, Search, Edit3, Trash2, ShieldCheck, X, 
  Loader2, AlertTriangle, Check, Eye, EyeOff // Added Eye icons
} from 'lucide-react';

import Pagination from '../../components/Pagination'; 
import toast from '../../components/Toast';

const AdminManagement = () => {
  const dispatch = useDispatch();
  const { admins, loading, actionLoading, meta } = useSelector((state) => state.admins);

  // States
  const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetAdmin, setTargetAdmin] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // Added visibility state
  
  // Available roles list
  const availableRoles = [
    'manage_thresholds', 
    'manage_users', 
    'manage_weather', 
    'manage_alerts'
  ];

  const [formData, setFormData] = useState({ 
    first_name: '', last_name: '', email: '', 
    password: '', password_confirmation: '', 
    phone_number: '', gender: 'Male', dob: '', 
    status: 'active', roles: [] 
  });
  
  const [filters, setFilters] = useState({ 
    search: '', status: '', gender: '', page: 1, limit: 10 
  });

  useEffect(() => {
    dispatch(fetchAdmins(filters));
  }, [filters, dispatch]);

  // --- Handlers ---
  const handleToggleRole = (role) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role) 
        ? prev.roles.filter(r => r !== role) 
        : [...prev.roles, role]
    }));
  };

const handleUpsert = async (e) => {
  e.preventDefault();
  
  let payload;
  if (targetAdmin) {
    // If updating, only include password if user typed something
    const { password, password_confirmation, ...profileData } = formData;
    payload = password.trim() !== '' ? formData : profileData;
  } else {
    payload = formData;
  }

  const action = targetAdmin 
    ? updateAdmin({ id: targetAdmin.id, adminData: payload }) 
    : createAdmin(payload);
  
  try {
    await dispatch(action).unwrap();
    toast.success(`Admin ${targetAdmin ? 'updated' : 'created'} successfully!`);
    setIsUpsertModalOpen(false);
  } catch (err) {
    toast.error(err || `Failed to ${targetAdmin ? 'update' : 'create'} admin.`);
  }
};

const confirmDelete = async () => {
  if (!targetAdmin) return;

  try {
    await dispatch(deleteAdmin(targetAdmin.id)).unwrap();
    toast.success("Admin deleted successfully");
    setIsDeleteModalOpen(false);
  } catch (err) {
    toast.error(err || "Failed to delete admin");
  }
};

  const openUpsert = (admin = null) => {
    setTargetAdmin(admin);
    setShowPassword(false);
    if (admin) {
      setFormData({ 
        ...admin, 
        password: '', 
        password_confirmation: '',
        roles: admin.roles || [] 
      });
    } else {
      setFormData({ 
        first_name: '', last_name: '', email: '', 
        password: '', password_confirmation: '', 
        phone_number: '', gender: 'Male', dob: '', 
        status: 'active', roles: [] 
      });
    }
    setIsUpsertModalOpen(true);
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
            <ShieldCheck className="text-purple-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Administrators</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Access Control & Governance</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => openUpsert()}
          className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
        >
          <Plus size={20} strokeWidth={3} />
          Create Admin
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-[28px] border border-white shadow-sm mb-8 flex items-center gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" placeholder="Search by name, email or phone..."
            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-purple-500/5 transition-all"
            onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
          />
        </div>
        <select 
          className="bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-600 outline-none focus:ring-4 focus:ring-purple-500/5 transition-all"
          onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-auto">
        <table className="w-full">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Administrator</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Roles</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Status</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[3px] text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="4" className="py-32 text-center"><Loader2 className="animate-spin mx-auto text-purple-600" size={40} /></td></tr>
            ) : admins.map((admin) => (
              <tr key={admin.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-10 py-7">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 font-black text-lg">
                      {admin.first_name[0]}{admin.last_name[0]}
                    </div>
                    <div>
                      <span className="block font-extrabold text-slate-800 text-lg">{admin.first_name} {admin.last_name}</span>
                      <span className="text-xs text-slate-400 font-bold">{admin.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-7">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {admin.roles?.map(role => (
                      <span key={role} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter">
                        {role.replace('manage_', '').replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-10 py-7">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${admin.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                    {admin.status}
                  </span>
                </td>
                <td className="px-10 py-7 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button onClick={() => openUpsert(admin)} className="p-3 bg-white shadow-sm border border-slate-100 rounded-xl text-slate-400 hover:text-purple-600 hover:border-purple-100 transition-all">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => { setTargetAdmin(admin); setIsDeleteModalOpen(true); }} className="p-3 bg-white shadow-sm border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-100 transition-all">
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
          onPageChange={(p) => setFilters({...filters, page: p})} 
        />
      </div>

      {/* --- UPSERT MODAL --- */}
      <AnimatePresence>
        {isUpsertModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
            <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl my-10 relative">
              <div className="p-12">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{targetAdmin ? 'Update Profile' : 'New Administrator'}</h2>
                  <button onClick={() => setIsUpsertModalOpen(false)} className="p-3 bg-slate-50 rounded-full text-slate-400 hover:rotate-90 transition-all"><X size={20} /></button>
                </div>

                <form onSubmit={handleUpsert} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                      <input required value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-[20px] p-4 font-bold text-slate-800 outline-none focus:border-purple-500 transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                      <input required value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-[20px] p-4 font-bold text-slate-800 outline-none focus:border-purple-500 transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-[20px] p-4 font-bold text-slate-800 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                      <input value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-[20px] p-4 font-bold text-slate-800 outline-none" />
                    </div>
                  </div>

                  {/* Password Section - Now shown for both with Eye Toggle */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        {targetAdmin ? 'New Password (Optional)' : 'Password'}
                      </label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          required={!targetAdmin} 
                          value={formData.password} 
                          onChange={(e) => setFormData({...formData, password: e.target.value})} 
                          placeholder={targetAdmin ? "••••••••" : ""}
                          className="w-full bg-slate-50 border border-slate-100 rounded-[20px] p-4 font-bold text-slate-800 outline-none focus:border-purple-500 transition-all" 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required={!targetAdmin && formData.password !== ''} 
                        value={formData.password_confirmation} 
                        onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})} 
                        placeholder={targetAdmin ? "••••••••" : ""}
                        className="w-full bg-slate-50 border border-slate-100 rounded-[20px] p-4 font-bold text-slate-800 outline-none focus:border-purple-500 transition-all" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                      <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-[20px] p-4 font-bold text-slate-800 outline-none">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">DOB</label>
                      <input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-[20px] p-4 font-bold text-slate-800 outline-none" />
                    </div>
                  </div>

                  {/* Role Selector */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Permissions</label>
                    <div className="flex flex-wrap gap-2">
                      {availableRoles.map(role => (
                        <button
                          key={role} type="button"
                          onClick={() => handleToggleRole(role)}
                          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center gap-2
                            ${formData.roles.includes(role) 
                              ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-100' 
                              : 'bg-white border-slate-100 text-slate-400 hover:border-purple-200'}`}
                        >
                          {formData.roles.includes(role) && <Check size={12} />}
                          {role.replace('manage_', '').replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button disabled={actionLoading} type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3">
                    {actionLoading ? <Loader2 className="animate-spin" size={24} /> : (targetAdmin ? 'Save Changes' : 'Register Administrator')}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- DELETE CONFIRMATION --- */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-[48px] p-12 text-center shadow-2xl">
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-500 border border-red-100">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Remove Admin?</h2>
              <p className="text-slate-500 font-medium mb-10">You are about to revoke all access for <span className="text-slate-900 font-bold">{targetAdmin?.first_name}</span>. This action is irreversible.</p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmDelete} className="w-full bg-red-500 text-white py-5 rounded-3xl font-black shadow-lg shadow-red-100">Delete Account</button>
                <button onClick={() => setIsDeleteModalOpen(false)} className="w-full bg-slate-50 text-slate-400 py-5 rounded-3xl font-black">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminManagement;