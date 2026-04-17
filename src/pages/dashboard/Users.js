import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchUsers, deleteUser, resetUserStatus,
  createPregnantWoman, createLactatingMother, createHealthWorker, createAssemblyOfficial,
  updatePregnantWoman, updateLactatingMother, updateHealthWorker, updateAssemblyOfficial
} from '../../redux/UserSlice';
import { fetchCommunities } from '../../redux/CommunitySlice';
import Pagination from '../../components/Pagination';
import {
  Search, Plus, Eye, Edit3, Trash2, Filter,
  User, Mail, Phone, Calendar, MapPin, Loader2, X,
  Heart, ShieldCheck, Briefcase, AlertTriangle, UserCheck, Baby
} from 'lucide-react';

// ─── Role config — returns null-safe values ────────────────────────────────────
const getRoleConfig = (role) => {
  const configs = {
    pregnant_woman:   { icon: <Heart size={12}/>,      color: 'bg-rose-50 text-rose-600 border-rose-100',       label: 'Pregnant' },
    lactating_mother: { icon: <Baby size={12}/>,       color: 'bg-blue-50 text-blue-600 border-blue-100',       label: 'Lactating' },
    health_worker:    { icon: <ShieldCheck size={12}/>, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Health Worker' },
    assembly_official:{ icon: <Briefcase size={12}/>,  color: 'bg-amber-50 text-amber-600 border-amber-100',    label: 'Official' },
  };
  // If role is null/undefined/unknown, return a neutral "no role" config
  return configs[role] ?? null;
};

// ─── Labelled detail row used in View modal ────────────────────────────────────
const DetailRow = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[2px]">{label}</p>
    <p className="text-sm font-bold text-slate-700">{value || <span className="text-slate-300 font-normal italic">Not provided</span>}</p>
  </div>
);

const SectionTitle = ({ icon: Icon, label }) => (
  <p className="text-[10px] font-black text-purple-600 uppercase tracking-[3px] flex items-center gap-2 border-b border-slate-100 pb-3">
    <Icon size={13}/> {label}
  </p>
);

const UserManagement = () => {
  const dispatch = useDispatch();

  const { userList, userMeta, usersLoading, userActionLoading, userSuccess } = useSelector(s => s.users);
  const { communityList } = useSelector(s => s.communities);

  const [searchTerm, setSearchTerm]   = useState('');
  const [roleFilter, setRoleFilter]   = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [editMode, setEditMode]       = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const initialForm = {
    first_name: '', last_name: '', email: '', phone_number: '', dob: '',
    gender: 'female', community_id: '', role: 'pregnant_woman',
    gestational_age_weeks: '', expected_delivery_date: '', gravida: '', parity: '', blood_group: '', anc_facility: '',
    baby_first_name: '', baby_last_name: '', baby_dob: '', birth_weight_kg: '', mode_of_delivery: '', number_of_babies: '',
    staff_id: '', facility_name: '', facility_type: '', qualification: '', years_of_experience: '',
    title: '', jurisdiction: '', district_id: '',
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    dispatch(fetchUsers({ limit: 15, search: '', role: '' }));
    dispatch(fetchCommunities());
  }, [dispatch]);

  useEffect(() => {
    if (userSuccess) {
      setActiveModal(null);
      setFormData(initialForm);
      dispatch(resetUserStatus());
      // Refresh list after mutation
      dispatch(fetchUsers({ limit: 15, search: searchTerm, role: roleFilter }));
    }
  }, [userSuccess]);

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditMode(true);
    setFormData({ ...initialForm, ...user, ...user.profile, community_id: user.community?.id || user.community_id || '', role: user.role || 'pregnant_woman' });
    setActiveModal('form');
  };

  const openView = (user) => {
    setSelectedUser(user);
    setActiveModal('view');
  };

  const openDelete = (user) => {
    setSelectedUser(user);
    setActiveModal('delete');
  };

  const handleSave = (e) => {
    e.preventDefault();
    const role    = formData.role;
    const payload = editMode ? { id: selectedUser.id, data: formData } : formData;
    const actionMap = {
      pregnant_woman:    editMode ? updatePregnantWoman    : createPregnantWoman,
      lactating_mother:  editMode ? updateLactatingMother  : createLactatingMother,
      health_worker:     editMode ? updateHealthWorker     : createHealthWorker,
      assembly_official: editMode ? updateAssemblyOfficial : createAssemblyOfficial,
    };
    if (actionMap[role]) dispatch(actionMap[role](payload));
  };

  const handleDelete = () => {
    dispatch(deleteUser(selectedUser.id));
  };

  // ── Profile field sets for View modal ─────────────────────────────────────
  const profileFields = (user) => {
    const p = user?.profile || {};
    switch (user?.role) {
      case 'pregnant_woman':
        return [
          { label: 'Gestational Age (weeks)', value: p.gestational_age_weeks },
          { label: 'Expected Delivery Date', value: p.expected_delivery_date },
          { label: 'Gravida', value: p.gravida },
          { label: 'Parity', value: p.parity },
          { label: 'Blood Group', value: p.blood_group },
          { label: 'ANC Facility', value: p.anc_facility },
        ];
      case 'lactating_mother':
        return [
          { label: "Baby's First Name", value: p.baby_first_name },
          { label: "Baby's Last Name", value: p.baby_last_name },
          { label: "Baby's DOB", value: p.baby_dob },
          { label: 'Birth Weight (kg)', value: p.birth_weight_kg },
          { label: 'Mode of Delivery', value: p.mode_of_delivery },
          { label: 'Number of Babies', value: p.number_of_babies },
        ];
      case 'health_worker':
        return [
          { label: 'Staff ID', value: p.staff_id },
          { label: 'Facility Name', value: p.facility_name },
          { label: 'Facility Type', value: p.facility_type },
          { label: 'Qualification', value: p.qualification },
          { label: 'Years of Experience', value: p.years_of_experience },
        ];
      case 'assembly_official':
        return [
          { label: 'Title', value: p.title },
          { label: 'Jurisdiction', value: p.jurisdiction },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="p-10 bg-[#FBFBFB] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-4 rounded-3xl text-white shadow-xl shadow-slate-200">
            <UserCheck size={28}/>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[3px]">System Directory & Enrollment</p>
          </div>
        </div>
        <button
          onClick={() => { setEditMode(false); setFormData(initialForm); setActiveModal('form'); }}
          className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-100"
        >
          <Plus size={20} strokeWidth={3}/> New Registration
        </button>
      </div>

      {/* Search / Filter */}
      <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm mb-8 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
          <input
            type="text" placeholder="Search by name, phone or email..."
            className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-500/10 transition-all"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-500 outline-none cursor-pointer"
          value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Role Types</option>
          <option value="pregnant_woman">Pregnant Women</option>
          <option value="lactating_mother">Lactating Mothers</option>
          <option value="health_worker">Health Workers</option>
          <option value="assembly_official">Assembly Officials</option>
        </select>
        <button
          onClick={() => dispatch(fetchUsers({ search: searchTerm, role: roleFilter }))}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-black transition-all"
        >
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Member Identity</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Role Type</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Assigned Community</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {usersLoading ? (
              <tr><td colSpan="4" className="py-32 text-center"><Loader2 className="animate-spin mx-auto text-purple-600" size={32}/></td></tr>
            ) : userList.map(user => {
              const roleConfig = getRoleConfig(user.role);
              return (
                <tr key={user.id} className="group hover:bg-slate-50/40 transition-all">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 font-black text-sm">
                        {(user.first_name?.[0] || '?')}{(user.last_name?.[0] || '')}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800">{user.first_name} {user.last_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user.phone_number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    {/* ── null-safe role badge ── */}
                    {roleConfig ? (
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider ${roleConfig.color}`}>
                        {roleConfig.icon} {roleConfig.label}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 italic">No role assigned</span>
                    )}
                  </td>
                  <td className="px-10 py-6 text-sm font-bold text-slate-500">
                    {user.community?.name || <span className="text-slate-300 font-normal italic text-xs">Unassigned</span>}
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openView(user)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-purple-600 transition-all shadow-sm"><Eye size={18}/></button>
                      <button onClick={() => openEdit(user)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-blue-600 transition-all shadow-sm"><Edit3 size={18}/></button>
                      <button onClick={() => openDelete(user)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-red-500 transition-all shadow-sm"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination
          currentPage={userMeta?.current_page || 1}
          totalItems={userMeta?.total || 0}
          perPage={userMeta?.per_page || 15}
          onPageChange={(p) => dispatch(fetchUsers({ page: p, limit: 15, search: searchTerm, role: roleFilter }))}
        />
      </div>

      {/* ══════════════════════════════════════════════════════ MODALS */}
      <AnimatePresence>

        {/* ── VIEW MODAL ──────────────────────────────────────────── */}
        {activeModal === 'view' && selectedUser && (
          <motion.div
            key="view"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6"
            onMouseDown={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* Modal header */}
              <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 font-black text-lg">
                    {(selectedUser.first_name?.[0] || '?')}{(selectedUser.last_name?.[0] || '')}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </h2>
                    {(() => {
                      const rc = getRoleConfig(selectedUser.role);
                      return rc ? (
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider mt-1 ${rc.color}`}>
                          {rc.icon} {rc.label}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300 italic mt-1 block">No role assigned</span>
                      );
                    })()}
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-300">
                  <X size={24}/>
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Core identity */}
                <div className="space-y-5">
                  <SectionTitle icon={User} label="Core Identity" />
                  <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                    <DetailRow label="Phone Number"    value={selectedUser.phone_number} />
                    <DetailRow label="Email Address"   value={selectedUser.email} />
                    <DetailRow label="Date of Birth"   value={selectedUser.dob} />
                    <DetailRow label="Gender"          value={selectedUser.gender} />
                    <DetailRow label="Community"       value={selectedUser.community?.name} />
                  </div>
                </div>

                {/* Role-specific profile */}
                {profileFields(selectedUser).length > 0 && (
                  <div className="space-y-5">
                    <SectionTitle icon={Filter} label={`${selectedUser.role?.replace(/_/g, ' ')} Details`} />
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                      {profileFields(selectedUser).map(f => (
                        <DetailRow key={f.label} label={f.label} value={f.value} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-50 shrink-0 flex gap-3">
                <button
                  onClick={() => { openEdit(selectedUser); }}
                  className="flex-1 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  <Edit3 size={15}/> Edit Profile
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all border border-slate-100"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── FORM MODAL (Add / Edit) ──────────────────────────────── */}
        {activeModal === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6"
            onMouseDown={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editMode ? 'Update Member Profile' : 'Enroll New Member'}</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Please ensure all required fields (*) are filled.</p>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-300"><X size={28}/></button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                {/* Role Switcher */}
                <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                  {['pregnant_woman', 'lactating_mother', 'health_worker', 'assembly_official'].map(r => (
                    <button
                      key={r} type="button" onClick={() => setFormData({ ...formData, role: r })}
                      className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${formData.role === r ? 'bg-white text-purple-600 shadow-sm border border-purple-100' : 'text-slate-400 hover:text-slate-500'}`}
                    >
                      {r.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>

                {/* Base Info */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] flex items-center gap-2"><User size={14}/> Core Identity</h4>
                  <div className="grid grid-cols-3 gap-6">
                    {[
                      { label: 'First Name *', key: 'first_name', type: 'text' },
                      { label: 'Last Name *',  key: 'last_name',  type: 'text' },
                      { label: 'Phone Number *', key: 'phone_number', type: 'text' },
                      { label: 'Date of Birth *', key: 'dob', type: 'date' },
                      { label: 'Email Address', key: 'email', type: 'email' },
                    ].map(f => (
                      <div key={f.key} className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">{f.label}</label>
                        <input
                          required={f.label.includes('*')} type={f.type}
                          className="premium-input w-full" value={formData[f.key]}
                          onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                        />
                      </div>
                    ))}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Assigned Community *</label>
                      <select
                        required className="premium-input w-full cursor-pointer"
                        value={formData.community_id}
                        onChange={(e) => setFormData({ ...formData, community_id: e.target.value })}
                      >
                        <option value="">Select Community...</option>
                        {communityList?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Role-specific fields */}
                <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 space-y-8">
                  <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-[3px] border-b border-slate-200 pb-4 flex items-center gap-2">
                    <Filter size={14}/> {formData.role?.replace(/_/g, ' ')} Profile Details
                  </h4>
                  <div className="grid grid-cols-2 gap-8">
                    {formData.role === 'pregnant_woman' && (<>
                      <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Gestational Weeks</label><input placeholder="Weeks" className="premium-input bg-white w-full" value={formData.gestational_age_weeks} onChange={(e) => setFormData({...formData, gestational_age_weeks: e.target.value})} /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">EDD (Expected Delivery)</label><input type="date" className="premium-input bg-white w-full" value={formData.expected_delivery_date} onChange={(e) => setFormData({...formData, expected_delivery_date: e.target.value})} /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Gravida</label><input placeholder="No. of Pregnancies" className="premium-input bg-white w-full" value={formData.gravida} onChange={(e) => setFormData({...formData, gravida: e.target.value})} /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">ANC Facility Name</label><input placeholder="e.g. Ridge Hospital" className="premium-input bg-white w-full" value={formData.anc_facility} onChange={(e) => setFormData({...formData, anc_facility: e.target.value})} /></div>
                    </>)}
                    {formData.role === 'lactating_mother' && (<>
                      <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Baby's First Name *</label><input placeholder="Baby First Name" className="premium-input bg-white w-full" value={formData.baby_first_name} onChange={(e) => setFormData({...formData, baby_first_name: e.target.value})} /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Baby's Last Name *</label><input placeholder="Baby Last Name" className="premium-input bg-white w-full" value={formData.baby_last_name} onChange={(e) => setFormData({...formData, baby_last_name: e.target.value})} /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Birth Weight (kg)</label><input placeholder="e.g. 3.5" className="premium-input bg-white w-full" value={formData.birth_weight_kg} onChange={(e) => setFormData({...formData, birth_weight_kg: e.target.value})} /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Mode of Delivery</label><input placeholder="e.g. CS or Vaginal" className="premium-input bg-white w-full" value={formData.mode_of_delivery} onChange={(e) => setFormData({...formData, mode_of_delivery: e.target.value})} /></div>
                    </>)}
                    {formData.role === 'health_worker' && (<>
                      <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Staff ID *</label><input required placeholder="ID Number" className="premium-input bg-white w-full" value={formData.staff_id} onChange={(e) => setFormData({...formData, staff_id: e.target.value})} /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Primary Facility</label><input placeholder="Facility Name" className="premium-input bg-white w-full" value={formData.facility_name} onChange={(e) => setFormData({...formData, facility_name: e.target.value})} /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Professional Qualification</label><input placeholder="e.g. Registered Nurse" className="premium-input bg-white w-full" value={formData.qualification} onChange={(e) => setFormData({...formData, qualification: e.target.value})} /></div>
                    </>)}
                    {formData.role === 'assembly_official' && (<>
                      <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Official Job Title</label><input placeholder="e.g. Assemblyman" className="premium-input bg-white w-full" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Jurisdiction Area</label><input placeholder="e.g. Ward 4" className="premium-input bg-white w-full" value={formData.jurisdiction} onChange={(e) => setFormData({...formData, jurisdiction: e.target.value})} /></div>
                    </>)}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setActiveModal(null)} className="flex-1 py-5 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-[11px]">Cancel</button>
                  <button type="submit" disabled={userActionLoading} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-[11px] disabled:opacity-60">
                    {userActionLoading ? <Loader2 className="animate-spin" size={20}/> : (editMode ? 'Update Database' : 'Enroll Member')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* ── DELETE MODAL ─────────────────────────────────────────── */}
        {activeModal === 'delete' && selectedUser && (
          <motion.div
            key="delete"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/80 flex items-center justify-center p-6"
            onMouseDown={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-[40px] p-12 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-100">
                <AlertTriangle size={40}/>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Revoke Access?</h2>
              <p className="text-slate-500 font-bold text-xs mb-10 px-4 leading-relaxed uppercase tracking-tighter">
                You are removing <span className="text-slate-800">{selectedUser.first_name} {selectedUser.last_name}</span>. This action cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDelete}
                  disabled={userActionLoading}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                >
                  {userActionLoading
                    ? <><Loader2 className="animate-spin" size={18}/> Deleting...</>
                    : 'Confirm Delete'
                  }
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  disabled={userActionLoading}
                  className="w-full bg-slate-50 text-slate-400 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] disabled:opacity-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>

      <style jsx>{`
        .premium-input {
          background: #F8FAFC;
          border: 1.5px solid #F1F5F9;
          border-radius: 18px;
          padding: 1.1rem 1.4rem;
          font-weight: 800;
          color: #1E293B;
          font-size: 0.85rem;
          outline: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .premium-input:focus {
          background: #FFFFFF;
          border-color: #A855F7;
          box-shadow: 0 0 0 5px rgba(168, 85, 247, 0.08);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default UserManagement;