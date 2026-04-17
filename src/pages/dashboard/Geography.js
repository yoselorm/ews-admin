import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchRegions, createRegion, updateRegion, deleteRegion, resetRegionStatus 
} from '../../redux/RegionSlice';
import { 
    fetchDistricts, createDistrict, updateDistrict, deleteDistrict, resetDistrictStatus, clearDistricts 
} from '../../redux/DistrictSlice';
import { 
    fetchCommunities, createCommunity, updateCommunity, deleteCommunity, resetCommunityStatus, clearCommunities 
} from '../../redux/CommunitySlice';
import Pagination from '../../components/Pagination';
import { 
    Plus, MapPin, Building2, Home, ChevronRight, 
    Edit3, Trash2, Loader2, X, ShieldAlert, Search, Globe 
} from 'lucide-react';

const GeographyPage = () => {
    const dispatch = useDispatch();

    // Redux States
    const { regionList, regionMeta, regionsLoading, regionActionLoading, regionSuccess, regionError } = useSelector(state => state.regions);
    const { districtList, districtMeta, districtsLoading, districtActionLoading, districtSuccess, districtError } = useSelector(state => state.districts);
    const { communityList, communityMeta, communitiesLoading, communityActionLoading, communitySuccess, communityError } = useSelector(state => state.communities);

    // Selection & UI States
    const [activeRegion, setActiveRegion] = useState(null);
    const [activeDistrict, setActiveDistrict] = useState(null);
    const [modal, setModal] = useState(null); // 'region', 'district', 'community'
    const [mode, setMode] = useState('add'); // 'add', 'edit', 'delete'
    const [selectedItem, setSelectedItem] = useState(null);

    // Form States
    const [formData, setFormData] = useState({});

    // 1. Initial Load
    useEffect(() => { dispatch(fetchRegions({ limit: 10 })); }, [dispatch]);

    // 2. Handle Success & Close Modals
    useEffect(() => {
        if (regionSuccess || districtSuccess || communitySuccess) {
            setModal(null);
            setSelectedItem(null);
            setFormData({});
            dispatch(resetRegionStatus());
            dispatch(resetDistrictStatus());
            dispatch(resetCommunityStatus());
        }
    }, [regionSuccess, districtSuccess, communitySuccess, dispatch]);

    // --- Navigation Logic ---
    const handleRegionSelect = (region) => {
        setActiveRegion(region);
        setActiveDistrict(null);
        dispatch(clearDistricts());
        dispatch(clearCommunities());
        dispatch(fetchDistricts({ region_id: region.id, limit: 10 }));
    };

    const handleDistrictSelect = (district) => {
        setActiveDistrict(district);
        dispatch(clearCommunities());
        dispatch(fetchCommunities({ district_id: district.id, limit: 10 }));
    };

    const openModal = (type, action, item = null) => {
        setModal(type);
        setMode(action);
        setSelectedItem(item);
        if (action === 'edit' && item) {
            setFormData(item);
        } else {
            if (type === 'district') setFormData({ region_id: activeRegion.id });
            if (type === 'community') setFormData({ district_id: activeDistrict.id });
        }
    };

    const handleSubmit = () => {
        if (modal === 'region') {
            mode === 'add' ? dispatch(createRegion(formData)) : dispatch(updateRegion({ id: selectedItem.id, data: formData }));
        } else if (modal === 'district') {
            mode === 'add' ? dispatch(createDistrict(formData)) : dispatch(updateDistrict({ id: selectedItem.id, data: formData }));
        } else if (modal === 'community') {
            mode === 'add' ? dispatch(createCommunity(formData)) : dispatch(updateCommunity({ id: selectedItem.id, data: formData }));
        }
    };

    const handleDelete = () => {
        if (modal === 'region') dispatch(deleteRegion(selectedItem.id));
        if (modal === 'district') dispatch(deleteDistrict(selectedItem.id));
        if (modal === 'community') dispatch(deleteCommunity(selectedItem.id));
    };

    const ColumnHeader = ({ title, icon: Icon, onAdd, count, showAdd = true }) => (
        <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white rounded-lg shadow-sm text-purple-600"><Icon size={18}/></div>
                <div>
                    <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{count || 0} Total</p>
                </div>
            </div>
            {showAdd && (
                <button onClick={onAdd} className="p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm">
                    <Plus size={16}/>
                </button>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Geography Control</h1>
                    <p className="text-slate-500 text-sm">Manage administrative levels and boundaries.</p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-220px)] min-h-[650px]">
                
                <div className="col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                    <ColumnHeader title="Regions" icon={Globe} onAdd={() => openModal('region', 'add')} count={regionMeta?.total} />
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {regionsLoading ? <Loader2 className="animate-spin mx-auto mt-20 text-purple-600" /> : 
                        regionList.map(r => (
                            <div key={r.id} className="group relative">
                                <button 
                                    onClick={() => handleRegionSelect(r)}
                                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all ${activeRegion?.id === r.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' : 'hover:bg-slate-50 text-slate-600'}`}
                                >
                                    <div className="text-left">
                                        <span className="font-bold text-sm block">{r.name}</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${activeRegion?.id === r.id ? 'text-purple-200' : 'text-slate-400'}`}>{r.code}</span>
                                    </div>
                                    <ChevronRight size={16} className={activeRegion?.id === r.id ? 'opacity-100' : 'opacity-0'} />
                                </button>
                                <div className={`absolute right-8 top-1/2 -translate-y-1/2 flex gap-1 transition-opacity ${activeRegion?.id === r.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    <button onClick={(e) => { e.stopPropagation(); openModal('region', 'edit', r); }} className={`p-1.5 rounded-md ${activeRegion?.id === r.id ? 'hover:bg-purple-500 text-white' : 'hover:bg-white text-slate-400'}`}><Edit3 size={14}/></button>
                                    <button onClick={(e) => { e.stopPropagation(); openModal('region', 'delete', r); }} className={`p-1.5 rounded-md ${activeRegion?.id === r.id ? 'hover:bg-purple-500 text-white' : 'hover:bg-white text-slate-400'}`}><Trash2 size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-2 border-t bg-slate-50/30">
                        <Pagination 
                            small currentPage={regionMeta?.current_page || 1} totalItems={regionMeta?.total || 0} perPage={regionMeta?.per_page || 10} 
                            onPageChange={(p) => dispatch(fetchRegions({ page: p, limit: 10 }))}
                        />
                    </div>
                </div>

                <div className="col-span-4 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                    <ColumnHeader title="Districts" icon={Building2} showAdd={!!activeRegion} onAdd={() => openModal('district', 'add')} count={districtMeta?.total} />
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {!activeRegion ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 p-8 text-center">
                                <div className="p-4 bg-slate-50 rounded-full mb-3"><MapPin size={32} className="opacity-20"/></div>
                                <p className="text-xs font-bold uppercase tracking-widest">Select a Region</p>
                            </div>
                        ) : districtsLoading ? <Loader2 className="animate-spin mx-auto mt-20 text-purple-600" /> :
                        districtList.map(d => (
                            <div key={d.id} className="group relative">
                                <button 
                                    onClick={() => handleDistrictSelect(d)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeDistrict?.id === d.id ? 'bg-slate-800 text-white' : 'hover:bg-slate-50 text-slate-600 border border-transparent hover:border-slate-100'}`}
                                >
                                    <div className="text-left">
                                        <span className="font-bold text-sm block">{d.name}</span>
                                        <span className="text-[10px] font-medium opacity-60 italic">{activeRegion.name}</span>
                                    </div>
                                    <ChevronRight size={16} className={activeDistrict?.id === d.id ? 'opacity-100' : 'opacity-0'} />
                                </button>
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openModal('district', 'edit', d)} className="p-1.5 bg-white shadow-sm rounded-md text-slate-400 hover:text-purple-600"><Edit3 size={14}/></button>
                                    <button onClick={() => openModal('district', 'delete', d)} className="p-1.5 bg-white shadow-sm rounded-md text-slate-400 hover:text-red-600"><Trash2 size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {activeRegion && (
                        <div className="p-2 border-t bg-slate-50/30">
                            <Pagination 
                                small currentPage={districtMeta?.current_page || 1} totalItems={districtMeta?.total || 0} perPage={districtMeta?.per_page || 10} 
                                onPageChange={(p) => dispatch(fetchDistricts({ region_id: activeRegion.id, page: p, limit: 10 }))}
                            />
                        </div>
                    )}
                </div>

                <div className="col-span-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                    <ColumnHeader title="Communities" icon={Home} showAdd={!!activeDistrict} onAdd={() => openModal('community', 'add')} count={communityMeta?.total} />
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {!activeDistrict ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 p-8 text-center">
                                <div className="p-4 bg-slate-50 rounded-full mb-3"><Building2 size={32} className="opacity-20"/></div>
                                <p className="text-xs font-bold uppercase tracking-widest">Select a District</p>
                            </div>
                        ) : communitiesLoading ? <Loader2 className="animate-spin mx-auto mt-20 text-purple-600" /> :
                        communityList.map(c => (
                            <div key={c.id} className="p-4 rounded-2xl border border-slate-100 hover:border-purple-200 transition-all flex justify-between items-start group relative">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{c.name}</h4>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">LAT: {c.latitude}</span>
                                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">LNG: {c.longitude}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openModal('community', 'edit', c)} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl"><Edit3 size={16}/></button>
                                    <button onClick={() => openModal('community', 'delete', c)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {activeDistrict && (
                        <div className="p-2 border-t bg-slate-50/30">
                            <Pagination 
                                small currentPage={communityMeta?.current_page || 1} totalItems={communityMeta?.total || 0} perPage={communityMeta?.per_page || 10} 
                                onPageChange={(p) => dispatch(fetchCommunities({ district_id: activeDistrict.id, page: p, limit: 10 }))}
                            />
                        </div>
                    )}
                </div>
            </div>

            {(modal && mode !== 'delete') && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900 capitalize">{mode} {modal}</h3>
                            <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Name</label>
                                <input 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                                    value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            {modal !== 'community' && (
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Code</label>
                                    <input 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                                        value={formData.code || ''} onChange={(e) => setFormData({...formData, code: e.target.value})}
                                    />
                                </div>
                            )}
                            {modal === 'community' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Latitude</label>
                                        <input 
                                            type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                                            value={formData.latitude || ''} onChange={(e) => setFormData({...formData, latitude: Number(e.target.value)})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Longitude</label>
                                        <input 
                                            type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                                            value={formData.longitude || ''} onChange={(e) => setFormData({...formData, longitude: Number(e.target.value)})}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 pt-0 flex gap-3">
                            <button onClick={() => setModal(null)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button 
                                onClick={handleSubmit}
                                disabled={regionActionLoading || districtActionLoading || communityActionLoading}
                                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 flex justify-center items-center gap-2"
                            >
                                {(regionActionLoading || districtActionLoading || communityActionLoading) ? <Loader2 size={20} className="animate-spin"/> : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {mode === 'delete' && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-8 flex flex-col items-center text-center gap-4 shadow-2xl">
                        <div className="p-4 bg-red-50 rounded-2xl text-red-500"><ShieldAlert size={32} /></div>
                        <h3 className="text-lg font-bold">Delete {modal}?</h3>
                        <p className="text-sm text-slate-500">This will permanently remove "{selectedItem?.name}". This action cannot be undone.</p>
                        <div className="flex gap-3 w-full">
                            <button onClick={() => setMode('add')} className="flex-1 py-3 border rounded-xl font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default GeographyPage;