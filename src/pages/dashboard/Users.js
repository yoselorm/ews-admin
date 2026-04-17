import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchUsers, deleteUser, resetUserStatus,
    createPregnantWoman, createLactatingMother, createHealthWorker, createAssemblyOfficial,
    updatePregnantWoman, updateLactatingMother, updateHealthWorker, updateAssemblyOfficial 
} from '../../redux/UserSlice';
import { fetchRegions } from '../../redux/RegionSlice';
import { fetchDistricts } from '../../redux/DistrictSlice';
import { fetchCommunities } from '../../redux/CommunitySlice';
import Pagination from '../../components/Pagination';
import { 
    Search, Plus, Eye, Edit3, Trash2, Filter, 
    User, Mail, Phone, Calendar, MapPin, Loader2, X, MoreHorizontal 
} from 'lucide-react';

const UserManagement = () => {
    const dispatch = useDispatch();
    
    // Global State
    const { userList, userMeta, usersLoading, userActionLoading, userSuccess } = useSelector(state => state.users);
    const { regionList } = useSelector(state => state.regions);
    const { districtList } = useSelector(state => state.districts);
    const { communityList } = useSelector(state => state.communities);

    // Local UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [activeModal, setActiveModal] = useState(null); // 'form', 'view', 'delete'
    const [editMode, setEditMode] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Dynamic Form State
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', phone_number: '', dob: '', 
        gender: '', community_id: '', role: 'pregnant_woman'
    });

    // 1. Initial Data Fetch
    useEffect(() => {
        dispatch(fetchUsers({ limit: 10 }));
        dispatch(fetchRegions());
    }, [dispatch]);

    // 2. Handle Success
    useEffect(() => {
        if (userSuccess) {
            setActiveModal(null);
            setSelectedUser(null);
            dispatch(resetUserStatus());
        }
    }, [userSuccess, dispatch]);

    // 3. Search & Filter Logic
    const handleSearch = (e) => {
        e.preventDefault();
        dispatch(fetchUsers({ search: searchTerm, role: roleFilter, limit: 15 }));
    };

    // 4. Form Submission Logic
    const handleSave = () => {
        const role = formData.role;
        if (editMode) {
            const payload = { id: selectedUser.id, data: formData };
            if (role === 'pregnant_woman') dispatch(updatePregnantWoman(payload));
            if (role === 'lactating_mother') dispatch(updateLactatingMother(payload));
            if (role === 'health_worker') dispatch(updateHealthWorker(payload));
            if (role === 'assembly_official') dispatch(updateAssemblyOfficial(payload));
        } else {
            if (role === 'pregnant_woman') dispatch(createPregnantWoman(formData));
            if (role === 'lactating_mother') dispatch(createLactatingMother(formData));
            if (role === 'health_worker') dispatch(createHealthWorker(formData));
            if (role === 'assembly_official') dispatch(createAssemblyOfficial(formData));
        }
    };

    // Helper for table badges
    const RoleBadge = ({ role }) => {
        const colors = {
            pregnant_woman: 'bg-pink-50 text-pink-600 border-pink-100',
            lactating_mother: 'bg-blue-50 text-blue-600 border-blue-100',
            health_worker: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            assembly_official: 'bg-amber-50 text-amber-600 border-amber-100'
        };
        return <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${colors[role]}`}>{role?.replace('_', ' ')}</span>;
    };

    return (
        <div className="space-y-6">
            {/* Header & Stats */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                    <p className="text-slate-500 text-sm">Create and manage different types of mobile users.</p>
                </div>
                <button 
                    onClick={() => { setEditMode(false); setFormData({role: 'pregnant_woman'}); setActiveModal('form'); }}
                    className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100"
                >
                    <Plus size={20}/> Add New User
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
                <form onSubmit={handleSearch} className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input 
                        type="text" placeholder="Search by name, email or phone..."
                        className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3 outline-none ring-2 ring-transparent focus:ring-purple-500/20 transition-all"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>
                <select 
                    className="bg-slate-50 border-none rounded-2xl px-4 py-3 outline-none font-bold text-slate-600"
                    value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="">All Roles</option>
                    <option value="pregnant_woman">Pregnant Women</option>
                    <option value="lactating_mother">Lactating Mothers</option>
                    <option value="health_worker">Health Workers</option>
                    <option value="assembly_official">Assembly Officials</option>
                </select>
                <button onClick={handleSearch} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all">Filter</button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="p-5 text-xs font-bold text-slate-500 uppercase">User</th>
                            <th className="p-5 text-xs font-bold text-slate-500 uppercase">Role</th>
                            <th className="p-5 text-xs font-bold text-slate-500 uppercase">Community</th>
                            <th className="p-5 text-xs font-bold text-slate-500 uppercase">Status</th>
                            <th className="p-5 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {usersLoading ? (
                            <tr><td colSpan="5" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-purple-600" size={40}/></td></tr>
                        ) : userList.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">{user.first_name[0]}{user.last_name[0]}</div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{user.first_name} {user.last_name}</p>
                                            <p className="text-xs text-slate-400">{user.email || user.phone_number}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5"><RoleBadge role={user.role}/></td>
                                <td className="p-5">
                                    <p className="text-sm font-medium text-slate-600">{user.community?.name || 'N/A'}</p>
                                </td>
                                <td className="p-5">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{user.status}</span>
                                </td>
                                <td className="p-5 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => { setSelectedUser(user); setActiveModal('view'); }} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"><Eye size={18}/></button>
                                        <button onClick={() => { setSelectedUser(user); setEditMode(true); setFormData({...user, ...user.profile}); setActiveModal('form'); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={18}/></button>
                                        <button onClick={() => { setSelectedUser(user); setActiveModal('delete'); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                    <Pagination 
                        currentPage={userMeta?.current_page || 1} totalItems={userMeta?.total || 0} perPage={userMeta?.per_page || 10}
                        onPageChange={(p) => dispatch(fetchUsers({ page: p, limit: 10, search: searchTerm, role: roleFilter }))}
                    />
                </div>
            </div>

            {/* --- VIEW USER MODAL --- */}
            {activeModal === 'view' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl">
                        <div className="relative h-32 bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex justify-between items-start">
                            <button onClick={() => setActiveModal(null)} className="absolute right-6 top-6 text-white/50 hover:text-white"><X size={24}/></button>
                            <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-3xl shadow-lg">
                                <div className="w-24 h-24 rounded-[20px] bg-slate-100 flex items-center justify-center text-3xl font-bold text-purple-600">
                                    {selectedUser.first_name[0]}{selectedUser.last_name[0]}
                                </div>
                            </div>
                        </div>
                        <div className="pt-16 px-8 pb-8 space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">{selectedUser.first_name} {selectedUser.last_name}</h2>
                                    <div className="flex gap-2 mt-1"><RoleBadge role={selectedUser.role}/></div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Member Since</p>
                                    <p className="text-sm font-bold text-slate-600">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 border-t pt-6">
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-800 text-sm border-b pb-2">Contact Details</h4>
                                    <div className="flex items-center gap-3 text-slate-600 text-sm"><Mail size={16}/> {selectedUser.email || 'No email provided'}</div>
                                    <div className="flex items-center gap-3 text-slate-600 text-sm"><Phone size={16}/> {selectedUser.phone_number}</div>
                                    <div className="flex items-center gap-3 text-slate-600 text-sm"><Calendar size={16}/> DOB: {selectedUser.dob}</div>
                                    <div className="flex items-center gap-3 text-slate-600 text-sm"><MapPin size={16}/> {selectedUser.community?.name}, {selectedUser.community?.district?.name}</div>
                                </div>
                                <div className="space-y-4 bg-slate-50 p-4 rounded-2xl">
                                    <h4 className="font-bold text-purple-800 text-sm border-b border-purple-100 pb-2">Profile Information</h4>
                                    {Object.entries(selectedUser.profile || {}).map(([key, value]) => (
                                        <div key={key} className="flex justify-between text-xs">
                                            <span className="text-slate-400 uppercase font-bold">{key?.replace(/_/g, ' ')}</span>
                                            <span className="text-slate-700 font-bold">{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ADD/EDIT DYNAMIC FORM MODAL --- */}
            {activeModal === 'form' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-3xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-bold">{editMode ? 'Update User' : 'Register New User'}</h3>
                            <button onClick={() => setActiveModal(null)}><X size={24}/></button>
                        </div>
                        <div className="p-8 overflow-y-auto space-y-8">
                            {/* Role Switcher - Critical */}
                            <div className="grid grid-cols-4 gap-2 p-1 bg-slate-100 rounded-2xl">
                                {['pregnant_woman', 'lactating_mother', 'health_worker', 'assembly_official'].map(r => (
                                    <button 
                                        key={r} onClick={() => setFormData({...formData, role: r})}
                                        className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase transition-all ${formData.role === r ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {r.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>

                            {/* Section 1: Basic Info */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                                    <input className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500/20" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                                    <input className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500/20" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                                    <input className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500/20" value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Date of Birth</label>
                                    <input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500/20" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
                                </div>
                            </div>

                            {/* Section 2: Role-Specific Profile Fields */}
                            <div className="p-6 bg-purple-50/50 rounded-3xl border border-purple-100 space-y-6">
                                <h4 className="text-sm font-bold text-purple-900 border-b border-purple-100 pb-2 flex items-center gap-2">
                                    <Filter size={16}/> {formData.role?.replace('_', ' ').toUpperCase()} DETAILS
                                </h4>
                                
                                <div className="grid grid-cols-2 gap-6">
                                    {formData.role === 'pregnant_woman' && (
                                        <>
                                            <input type="number" placeholder="Gestational Age (Weeks)" className="form-input-custom" onChange={(e) => setFormData({...formData, gestational_age_weeks: e.target.value})} />
                                            <input type="date" placeholder="EDD" className="form-input-custom" onChange={(e) => setFormData({...formData, expected_delivery_date: e.target.value})} />
                                            <input type="number" placeholder="Gravida" className="form-input-custom" onChange={(e) => setFormData({...formData, gravida: e.target.value})} />
                                            <input type="text" placeholder="ANC Facility" className="form-input-custom" onChange={(e) => setFormData({...formData, anc_facility: e.target.value})} />
                                        </>
                                    )}
                                    {formData.role === 'health_worker' && (
                                        <>
                                            <input type="text" placeholder="Staff ID" className="form-input-custom" onChange={(e) => setFormData({...formData, staff_id: e.target.value})} />
                                            <input type="text" placeholder="Qualification" className="form-input-custom" onChange={(e) => setFormData({...formData, qualification: e.target.value})} />
                                            <input type="text" placeholder="Facility Name" className="form-input-custom" onChange={(e) => setFormData({...formData, facility_name: e.target.value})} />
                                            <input type="number" placeholder="Years of Experience" className="form-input-custom" onChange={(e) => setFormData({...formData, years_of_experience: e.target.value})} />
                                        </>
                                    )}
                                    {/* Add similar conditional blocks for Mother and Assembly Official... */}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t bg-slate-50/50 flex gap-4">
                            <button onClick={() => setActiveModal(null)} className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-white">Cancel</button>
                            <button onClick={handleSave} className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-100 flex justify-center items-center">
                                {userActionLoading ? <Loader2 className="animate-spin" size={24}/> : 'Register User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;