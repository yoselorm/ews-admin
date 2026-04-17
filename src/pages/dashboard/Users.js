import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    fetchUsers, deleteUser, resetUserStatus,
    createPregnantWoman, createLactatingMother, createHealthWorker, createAssemblyOfficial,
    updatePregnantWoman, updateLactatingMother, updateHealthWorker, updateAssemblyOfficial
} from '../../redux/UserSlice';
import { fetchCommunityList } from '../../redux/CommunitySlice';
import Pagination from '../../components/Pagination';
import {
    Search, Plus, Eye, Edit3, Trash2, Filter,
    User, Loader2, X,
    Heart, ShieldCheck, Briefcase, AlertTriangle, UserCheck, Baby
} from 'lucide-react';


const BASE_FIELDS = ['first_name', 'last_name', 'email', 'phone_number', 'dob', 'gender', 'community_id', 'role'];

const ROLE_FIELDS = {
    pregnant_woman:    [...BASE_FIELDS, 'gestational_age_weeks', 'expected_delivery_date', 'gravida', 'parity', 'blood_group', 'anc_facility'],
    lactating_mother:  [...BASE_FIELDS, 'baby_first_name', 'baby_last_name', 'baby_dob', 'birth_weight_kg', 'mode_of_delivery', 'number_of_babies'],
    health_worker:     [...BASE_FIELDS, 'staff_id', 'facility_name', 'facility_type', 'qualification', 'years_of_experience'],
    assembly_official: [...BASE_FIELDS, 'title', 'jurisdiction', 'district_id'],
};

const buildPayload = (formData) => {
    const fields = ROLE_FIELDS[formData.role] || BASE_FIELDS;
    return fields.reduce((acc, key) => {
        if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
            acc[key] = formData[key];
        }
        return acc;
    }, {});
};

const UserManagement = () => {
    const dispatch = useDispatch();

    // Global State
    const { userList, userMeta, usersLoading, userActionLoading, userSuccess } = useSelector(state => state.users);
    const { list } = useSelector(state => state.communities);

    // Local UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [communityFilter, setCommunityFilter] = useState(''); // ← new
    const [currentPage, setCurrentPage] = useState(1);
    const [activeModal, setActiveModal] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const initialForm = {
        first_name: '', last_name: '', email: '', phone_number: '', dob: '',
        gender: 'female', community_id: '', role: 'pregnant_woman',
        // Pregnant
        gestational_age_weeks: '', expected_delivery_date: '', gravida: '', parity: '', blood_group: '', anc_facility: '',
        // Lactating
        baby_first_name: '', baby_last_name: '', baby_dob: '', birth_weight_kg: '', mode_of_delivery: '', number_of_babies: '',
        // Health Worker / Official
        staff_id: '', facility_name: '', facility_type: '', qualification: '', years_of_experience: '', title: '', jurisdiction: '', district_id: ''
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        dispatch(fetchUsers({ limit: 15, search: '', role: '' }));
        dispatch(fetchCommunityList());
    }, [dispatch]);

    useEffect(() => {
        if (userSuccess) {
            setActiveModal(null);
            setFormData(initialForm);
            dispatch(resetUserStatus());
            dispatch(fetchUsers({ page: currentPage, limit: 15, search: searchTerm, role: roleFilter, community_id: communityFilter }));
        }
    }, [userSuccess]);

    const openEdit = (user) => {
        setSelectedUser(user);
        setEditMode(true);
        setFormData({
            ...initialForm,
            ...user,
            ...user.profile,
            community_id: user.community?.id || user.community_id || '',
            role: user.role
        });
        setActiveModal('form');
    };

    const handleFilter = () => {
        setCurrentPage(1);
        dispatch(fetchUsers({ search: searchTerm, role: roleFilter, community_id: communityFilter, limit: 15 }));
    };

    const handlePageChange = (p) => {
        setCurrentPage(p);
        dispatch(fetchUsers({ page: p, limit: 15, search: searchTerm, role: roleFilter, community_id: communityFilter }));
    };

    // ── Sends ONLY the fields relevant to the selected role ──────────────────
    const handleSave = (e) => {
        e.preventDefault();
        const payload = buildPayload(formData);
        const actionMap = {
            pregnant_woman:    editMode ? updatePregnantWoman    : createPregnantWoman,
            lactating_mother:  editMode ? updateLactatingMother  : createLactatingMother,
            health_worker:     editMode ? updateHealthWorker     : createHealthWorker,
            assembly_official: editMode ? updateAssemblyOfficial : createAssemblyOfficial,
        };
        const action = actionMap[formData.role];
        if (!action) return;
        dispatch(action(editMode ? { id: selectedUser.id, data: payload } : payload));
    };

    const getRoleConfig = (role) => {
        const configs = {
            pregnant_woman:    { icon: <Heart size={12}/>,       color: 'bg-rose-50 text-rose-600 border-rose-100',          label: 'Pregnant' },
            lactating_mother:  { icon: <Baby size={12}/>,        color: 'bg-blue-50 text-blue-600 border-blue-100',          label: 'Lactating' },
            health_worker:     { icon: <ShieldCheck size={12}/>, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Health Worker' },
            assembly_official: { icon: <Briefcase size={12}/>,   color: 'bg-amber-50 text-amber-600 border-amber-100',       label: 'Official' }
        };
        return configs[role] ?? null;
    };

    return (
        <div className="p-4 sm:p-6 lg:p-10 bg-[#FBFBFB] min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 sm:mb-10">
                <div className="flex items-center gap-4">
                    <div className="bg-slate-900 p-3 sm:p-4 rounded-3xl text-white shadow-xl shadow-slate-200 shrink-0">
                        <UserCheck size={22} className="sm:hidden" />
                        <UserCheck size={28} className="hidden sm:block" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[3px]">System Directory & Enrollment</p>
                    </div>
                </div>
                <button
                    onClick={() => { setEditMode(false); setFormData(initialForm); setActiveModal('form'); }}
                    className="bg-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 w-full sm:w-auto"
                >
                    <Plus size={20} strokeWidth={3}/> New Registration
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-3 sm:p-4 rounded-[32px] border border-slate-100 shadow-sm mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
                    <input
                        type="text" placeholder="Search by name, phone or email..."
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 sm:py-4 pl-14 pr-6 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-500/10 transition-all"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <select
                        className="bg-slate-50 border-none rounded-2xl px-4 sm:px-6 py-3 sm:py-4 font-bold text-slate-500 outline-none cursor-pointer"
                        value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">All Role Types</option>
                        <option value="pregnant_woman">Pregnant Women</option>
                        <option value="lactating_mother">Lactating Mothers</option>
                        <option value="health_worker">Health Workers</option>
                        <option value="assembly_official">Assembly Officials</option>
                    </select>
                    {/* Community filter — sends community_id as a query param */}
                    <select
                        className="bg-slate-50 border-none rounded-2xl px-4 sm:px-6 py-3 sm:py-4 font-bold text-slate-500 outline-none cursor-pointer"
                        value={communityFilter} onChange={(e) => setCommunityFilter(e.target.value)}
                    >
                        <option value="">All Communities</option>
                        {list?.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleFilter}
                        className="bg-slate-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-black hover:bg-black transition-all"
                    >
                        Filter
                    </button>
                </div>
            </div>

            {/* Table — desktop */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 lg:px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Member Identity</th>
                                <th className="px-6 lg:px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Role Type</th>
                                <th className="px-6 lg:px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Assigned Community</th>
                                <th className="px-6 lg:px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[2px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {usersLoading ? (
                                <tr><td colSpan="4" className="py-32 text-center"><Loader2 className="animate-spin mx-auto text-purple-600" size={32}/></td></tr>
                            ) : userList.length === 0 ? (
                                <tr><td colSpan="4" className="py-32 text-center text-sm font-bold text-slate-300">No users found</td></tr>
                            ) : userList.map(user => {
                                const rc = getRoleConfig(user.role);
                                return (
                                    <tr key={user.id} className="group hover:bg-slate-50/40 transition-all">
                                        <td className="px-6 lg:px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 font-black shrink-0">
                                                    {user.first_name?.[0]}{user.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-extrabold text-slate-800">{user.first_name} {user.last_name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user.phone_number}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 lg:px-10 py-6">
                                            {rc ? (
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider ${rc.color}`}>
                                                    {rc.icon} {rc.label}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-slate-300 italic font-bold">No role</span>
                                            )}
                                        </td>
                                        <td className="px-6 lg:px-10 py-6 text-sm font-bold text-slate-500">
                                            {user.community?.name || <span className="text-slate-300 italic font-normal">Unassigned</span>}
                                        </td>
                                        <td className="px-6 lg:px-10 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => { setSelectedUser(user); setActiveModal('view'); }} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-purple-600 transition-all shadow-sm"><Eye size={18}/></button>
                                                <button onClick={() => openEdit(user)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-blue-600 transition-all shadow-sm"><Edit3 size={18}/></button>
                                                <button onClick={() => { setSelectedUser(user); setActiveModal('delete'); }} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-red-500 transition-all shadow-sm"><Trash2 size={18}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Card list — mobile */}
                <div className="md:hidden divide-y divide-slate-50">
                    {usersLoading ? (
                        <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-purple-600" size={32}/></div>
                    ) : userList.length === 0 ? (
                        <div className="py-16 text-center text-sm font-bold text-slate-300">No users found</div>
                    ) : userList.map(user => {
                        const rc = getRoleConfig(user.role);
                        return (
                            <div key={user.id} className="p-4 flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 font-black shrink-0 text-sm">
                                    {user.first_name?.[0]}{user.last_name?.[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-extrabold text-slate-800 truncate">{user.first_name} {user.last_name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{user.phone_number}</p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        {rc ? (
                                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-black uppercase ${rc.color}`}>
                                                {rc.icon} {rc.label}
                                            </div>
                                        ) : (
                                            <span className="text-[9px] text-slate-300 italic">No role</span>
                                        )}
                                        {user.community?.name && (
                                            <span className="text-[9px] text-slate-400 font-bold">{user.community.name}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button onClick={() => { setSelectedUser(user); setActiveModal('view'); }} className="p-2 rounded-xl text-slate-300 hover:text-purple-600 hover:bg-purple-50 transition-all"><Eye size={17}/></button>
                                    <button onClick={() => openEdit(user)} className="p-2 rounded-xl text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all"><Edit3 size={17}/></button>
                                    <button onClick={() => { setSelectedUser(user); setActiveModal('delete'); }} className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={17}/></button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalItems={userMeta?.total || 0}
                    perPage={userMeta?.per_page || 15}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {/* ── FORM MODAL ─────────────────────────────────────────────────── */}
                {activeModal === 'form' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-6"
                        onMouseDown={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}
                    >
                        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
                            className="bg-white w-full sm:max-w-4xl rounded-t-[40px] sm:rounded-[40px] shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
                        >
                            <div className="p-6 sm:p-8 border-b border-slate-50 flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{editMode ? 'Update Member Profile' : 'Enroll New Member'}</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Please ensure all required fields (*) are filled.</p>
                                </div>
                                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-300"><X size={28}/></button>
                            </div>

                            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 sm:space-y-10 custom-scrollbar">
                                {/* Role Switcher */}
                                <div className="flex flex-wrap sm:flex-nowrap gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                                    {['pregnant_woman', 'lactating_mother', 'health_worker', 'assembly_official'].map(r => (
                                        <button
                                            key={r} type="button" onClick={() => setFormData({...formData, role: r})}
                                            className={`flex-1 min-w-[calc(50%-4px)] sm:min-w-0 py-3 sm:py-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${formData.role === r ? 'bg-white text-purple-600 shadow-sm border border-purple-100' : 'text-slate-400 hover:text-slate-500'}`}
                                        >
                                            {r.replace(/_/g, ' ')}
                                        </button>
                                    ))}
                                </div>

                                {/* Base Info */}
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] flex items-center gap-2"><User size={14}/> Core Identity</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                        {[
                                            { label: 'First Name *', key: 'first_name', type: 'text' },
                                            { label: 'Last Name *',  key: 'last_name',  type: 'text' },
                                            { label: 'Phone Number *', key: 'phone_number', type: 'text' },
                                            { label: 'Date of Birth *', key: 'dob', type: 'date' },
                                            { label: 'Email Address', key: 'email', type: 'email' },
                                        ].map(f => (
                                            <div key={f.key} className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">{f.label}</label>
                                                <input required={f.label.includes('*')} type={f.type} className="premium-input w-full" value={formData[f.key]} onChange={(e) => setFormData({...formData, [f.key]: e.target.value})} />
                                            </div>
                                        ))}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Assigned Community *</label>
                                            <select
                                                required className="premium-input w-full cursor-pointer"
                                                value={formData.community_id}
                                                onChange={(e) => setFormData({...formData, community_id: e.target.value})}
                                            >
                                                <option value="">Select Community...</option>
                                                {list?.map(comm => (
                                                    <option key={comm.id} value={comm.id}>{comm.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Role-specific fields */}
                                <div className="p-6 sm:p-10 bg-slate-50 rounded-[32px] sm:rounded-[40px] border border-slate-100 space-y-8">
                                    <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-[3px] border-b border-slate-200 pb-4 flex items-center gap-2">
                                        <Filter size={14}/> {formData.role?.replace(/_/g, ' ')} Profile Details
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
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
                                            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Staff Identification ID *</label><input required placeholder="ID Number" className="premium-input bg-white w-full" value={formData.staff_id} onChange={(e) => setFormData({...formData, staff_id: e.target.value})} /></div>
                                            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Primary Facility</label><input placeholder="Facility Name" className="premium-input bg-white w-full" value={formData.facility_name} onChange={(e) => setFormData({...formData, facility_name: e.target.value})} /></div>
                                            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Professional Qualification</label><input placeholder="e.g. Registered Nurse" className="premium-input bg-white w-full" value={formData.qualification} onChange={(e) => setFormData({...formData, qualification: e.target.value})} /></div>
                                        </>)}
                                        {formData.role === 'assembly_official' && (<>
                                            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Official Job Title</label><input placeholder="e.g. Assemblyman" className="premium-input bg-white w-full" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /></div>
                                            <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Jurisdiction Area</label><input placeholder="e.g. Ward 4" className="premium-input bg-white w-full" value={formData.jurisdiction} onChange={(e) => setFormData({...formData, jurisdiction: e.target.value})} /></div>
                                        </>)}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button type="button" onClick={() => setActiveModal(null)} className="order-2 sm:order-1 flex-1 py-4 sm:py-5 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-[11px]">Cancel</button>
                                    <button type="submit" disabled={userActionLoading} className="order-1 sm:order-2 flex-1 py-4 sm:py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all flex justify-center items-center gap-2 uppercase tracking-widest text-[11px]">
                                        {userActionLoading ? <Loader2 className="animate-spin" size={20}/> : (editMode ? 'Update Database' : 'Enroll Member')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── VIEW MODAL ──────────────────────────────────────────────────── */}
                {activeModal === 'view' && selectedUser && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-6"
                        onMouseDown={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}
                    >
                        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
                            className="bg-white w-full sm:max-w-xl rounded-t-[40px] sm:rounded-[40px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
                        >
                            <div className="p-6 sm:p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 font-black text-lg shrink-0">
                                        {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{selectedUser.first_name} {selectedUser.last_name}</h2>
                                        {(() => {
                                            const rc = getRoleConfig(selectedUser.role);
                                            return rc
                                                ? <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider mt-1 ${rc.color}`}>{rc.icon}{rc.label}</div>
                                                : <span className="text-[10px] text-slate-300 italic mt-1 block">No role assigned</span>;
                                        })()}
                                    </div>
                                </div>
                                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-300 shrink-0"><X size={24}/></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Phone',     value: selectedUser.phone_number },
                                        { label: 'Email',     value: selectedUser.email },
                                        { label: 'DOB',       value: selectedUser.dob },
                                        { label: 'Gender',    value: selectedUser.gender },
                                        { label: 'Community', value: selectedUser.community?.name },
                                    ].map(({ label, value }) => (
                                        <div key={label}>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[2px] mb-0.5">{label}</p>
                                            <p className="text-sm font-bold text-slate-700">{value || <span className="text-slate-300 italic font-normal text-xs">Not provided</span>}</p>
                                        </div>
                                    ))}
                                </div>
                                {selectedUser.profile && Object.keys(selectedUser.profile).length > 0 && (
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-purple-600 uppercase tracking-[3px] border-b border-slate-100 pb-2">
                                            {selectedUser.role?.replace(/_/g, ' ')} Details
                                        </p>
                                        <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(selectedUser.profile).map(([key, val]) => (
                                                <div key={key}>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[2px] mb-0.5">{key.replace(/_/g, ' ')}</p>
                                                    <p className="text-sm font-bold text-slate-700">{val || <span className="text-slate-300 italic font-normal text-xs">—</span>}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 sm:p-8 border-t border-slate-50 flex gap-3 shrink-0">
                                <button onClick={() => openEdit(selectedUser)} className="flex-1 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">
                                    <Edit3 size={15}/> Edit Profile
                                </button>
                                <button onClick={() => setActiveModal(null)} className="px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all border border-slate-100">Close</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── DELETE MODAL ────────────────────────────────────────────────── */}
                {activeModal === 'delete' && selectedUser && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/80 flex items-end sm:items-center justify-center sm:p-6"
                        onMouseDown={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}
                    >
                        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
                            className="bg-white w-full sm:max-w-md rounded-t-[40px] sm:rounded-[40px] p-10 sm:p-12 text-center shadow-2xl"
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
                                    onClick={() => dispatch(deleteUser(selectedUser.id))}
                                    disabled={userActionLoading}
                                    className="w-full bg-red-500 hover:bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                                >
                                    {userActionLoading ? <><Loader2 className="animate-spin" size={18}/> Deleting...</> : 'Confirm Delete'}
                                </button>
                                <button onClick={() => setActiveModal(null)} disabled={userActionLoading} className="w-full bg-slate-50 text-slate-400 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] disabled:opacity-50">Cancel</button>
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