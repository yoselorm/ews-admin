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
  Edit3, Trash2, Loader2, X, ShieldAlert, Globe, ArrowLeft
} from 'lucide-react';
import toast from '../../components/Toast';

const CountBadge = ({ count }) => (
  <span className="ml-auto text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full tabular-nums">
    {count ?? 0}
  </span>
);

const Column = ({ icon: Icon, title, count, onAdd, showAdd, loading, empty, emptyIcon: EmptyIcon, emptyLabel, children, footer }) => (
  <div className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full">
    {/* Header */}
    <div className="shrink-0 flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
      <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="font-bold text-slate-800 text-sm leading-tight">{title}</p>
      </div>
      <CountBadge count={count} />
      {showAdd && (
        <button
          onClick={onAdd}
          className="ml-1 shrink-0 p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm shadow-purple-200"
        >
          <Plus size={14} />
        </button>
      )}
    </div>

    {/* Body */}
    <div className="flex-1 overflow-y-auto">
      {loading ? (
        <div className="flex items-center justify-center h-full py-16">
          <Loader2 className="animate-spin text-purple-500" size={24} />
        </div>
      ) : empty ? (
        <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
          <div className="p-4 bg-slate-50 rounded-2xl mb-3 text-slate-300">
            <EmptyIcon size={28} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-300">{emptyLabel}</p>
        </div>
      ) : (
        <div className="p-2 space-y-0.5">{children}</div>
      )}
    </div>

    {/* Footer pagination */}
    {footer && (
      <div className="shrink-0 border-t border-slate-100 bg-slate-50/40">
        {footer}
      </div>
    )}
  </div>
);

const RegionRow = ({ item, active, onClick, onEdit, onDelete }) => (
  <div className="group relative">
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
        active
          ? 'bg-purple-600 text-white shadow-md shadow-purple-100'
          : 'hover:bg-slate-50 text-slate-700'
      }`}
    >
      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
        active ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-500'
      }`}>
        {item.code?.slice(0, 2) || item.name?.slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate leading-tight">{item.name}</p>
        <p className={`text-[10px] font-mono uppercase tracking-wider ${active ? 'text-purple-200' : 'text-slate-400'}`}>
          {item.code}
        </p>
      </div>
      <ChevronRight size={14} className={`shrink-0 transition-transform ${active ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 group-hover:opacity-50 group-hover:translate-x-0'}`} />
    </button>
    {/* action buttons float over */}
    <div className={`absolute right-7 top-1/2 -translate-y-1/2 flex gap-0.5 transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className={`p-1.5 rounded-md transition-colors ${active ? 'hover:bg-purple-500 text-white' : 'hover:bg-white hover:shadow-sm text-slate-400'}`}
      >
        <Edit3 size={12} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className={`p-1.5 rounded-md transition-colors ${active ? 'hover:bg-purple-500 text-white' : 'hover:bg-white hover:shadow-sm text-slate-400 hover:text-red-500'}`}
      >
        <Trash2 size={12} />
      </button>
    </div>
  </div>
);

const DistrictRow = ({ item, active, onClick, onEdit, onDelete }) => (
  <div className="group relative">
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
        active
          ? 'bg-slate-800 text-white shadow-md'
          : 'hover:bg-slate-50 text-slate-700 border border-transparent hover:border-slate-100'
      }`}
    >
      <div className={`shrink-0 w-2 h-2 rounded-full mt-0.5 ${active ? 'bg-emerald-400' : 'bg-slate-300'}`} />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate leading-tight">{item.name}</p>
        <p className={`text-[10px] font-mono uppercase ${active ? 'text-slate-400' : 'text-slate-400'}`}>{item.code}</p>
      </div>
      <ChevronRight size={14} className={`shrink-0 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`} />
    </button>
    <div className="absolute right-7 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 bg-white shadow-sm rounded-md text-slate-400 hover:text-purple-600 transition-colors"><Edit3 size={12} /></button>
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 bg-white shadow-sm rounded-md text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
    </div>
  </div>
);

const CommunityCard = ({ item, onEdit, onDelete }) => (
  <div className="group flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-sm bg-white transition-all">
    <div className="shrink-0 p-2 bg-purple-50 rounded-lg text-purple-500 mt-0.5">
      <Home size={14} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-slate-800 text-sm truncate">{item.name}</p>
      {(item.latitude || item.longitude) && (
        <div className="flex gap-2 mt-1 flex-wrap">
          {item.latitude && (
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-500">
              {Number(item.latitude).toFixed(4)}°N
            </span>
          )}
          {item.longitude && (
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-500">
              {Number(item.longitude).toFixed(4)}°E
            </span>
          )}
        </div>
      )}
    </div>
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
      <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"><Edit3 size={14} /></button>
      <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
    </div>
  </div>
);

const ModalShell = ({ title, onClose, children }) => createPortal(
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    style={{ backgroundColor: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(6px)' }}
    onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <style>{`@keyframes mIn{from{opacity:0;transform:scale(.96) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}.m-ani{animation:mIn .2s cubic-bezier(.16,1,.3,1)}`}</style>
    <div className="m-ani bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
        <h3 className="font-bold text-slate-900 text-base">{title}</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><X size={20} /></button>
      </div>
      {children}
    </div>
  </div>,
  document.body
);

const DeleteModal = ({ label, itemName, onConfirm, onCancel, loading }) => createPortal(
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    style={{ backgroundColor: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(6px)' }}
    onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
  >
    <style>{`@keyframes mIn{from{opacity:0;transform:scale(.96) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}.m-ani{animation:mIn .2s cubic-bezier(.16,1,.3,1)}`}</style>
    <div className="m-ani bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-100 p-8 flex flex-col items-center text-center gap-4">
      <div className="p-4 bg-red-50 rounded-2xl text-red-500"><ShieldAlert size={28} /></div>
      <div>
        <p className="font-bold text-slate-900 text-lg">Delete {label}?</p>
        <p className="text-sm text-slate-500 mt-1">
          <span className="font-semibold text-slate-700">"{itemName}"</span> will be permanently removed.
        </p>
      </div>
      <div className="flex gap-3 w-full">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors text-sm">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50">
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Delete'}
        </button>
      </div>
    </div>
  </div>,
  document.body
);

const GeographyPage = () => {
  const dispatch = useDispatch();

  const { regionList, regionMeta, regionsLoading, regionActionLoading, regionSuccess, regionError } = useSelector(s => s.regions);
  const { districtList, districtMeta, districtsLoading, districtActionLoading, districtSuccess, districtError } = useSelector(s => s.districts);
  const { communityList, communityMeta, communitiesLoading, communityActionLoading, communitySuccess, communityError } = useSelector(s => s.communities);

  const [activeRegion, setActiveRegion] = useState(null);
  const [activeDistrict, setActiveDistrict] = useState(null);

  const [modalState, setModalState] = useState(null);
  const [formData, setFormData] = useState({});

  const [mobileView, setMobileView] = useState('regions'); 

  useEffect(() => {
    dispatch(fetchRegions({ limit: 10 }));
  }, [dispatch]);

  useEffect(() => {
    if (regionSuccess || districtSuccess || communitySuccess) {
      setModalState(null);
      setFormData({});
      dispatch(resetRegionStatus());
      dispatch(resetDistrictStatus());
      dispatch(resetCommunityStatus());
    }
  }, [regionSuccess, districtSuccess, communitySuccess, dispatch]);

  const handleRegionSelect = (region) => {
    setActiveRegion(region);
    setActiveDistrict(null);
    dispatch(clearDistricts());
    dispatch(clearCommunities());
    dispatch(fetchDistricts({ region_id: region.id, limit: 10 }));
    setMobileView('districts');
  };

  const handleDistrictSelect = (district) => {
    setActiveDistrict(district);
    dispatch(clearCommunities());
    dispatch(fetchCommunities({ district_id: district.id, limit: 10 }));
    setMobileView('communities');
  };

  const openModal = (type, mode, item = null) => {
    setModalState({ type, mode, item });
    if (mode === 'edit' && item) {
      setFormData(item);
    } else if (mode === 'add') {
      const base = {};
      if (type === 'district') base.region_id = activeRegion?.id;
      if (type === 'community') base.district_id = activeDistrict?.id;
      setFormData(base);
    }
  };

  const closeModal = () => {
    setModalState(null);
    setFormData({});
    dispatch(resetRegionStatus());
    dispatch(resetDistrictStatus());
    dispatch(resetCommunityStatus());
  };

 const handleSubmit = async (e) => {
  if (e) e.preventDefault();
  const { type, mode, item } = modalState;

  try {
    let resultAction;

    if (type === 'region') {
      resultAction = mode === 'add' 
        ? dispatch(createRegion(formData)) 
        : dispatch(updateRegion({ id: item.id, data: formData }));
    } 
    else if (type === 'district') {
      resultAction = mode === 'add' 
        ? dispatch(createDistrict(formData)) 
        : dispatch(updateDistrict({ id: item.id, data: formData }));
    } 
    else if (type === 'community') {
      resultAction = mode === 'add' 
        ? dispatch(createCommunity(formData)) 
        : dispatch(updateCommunity({ id: item.id, data: formData }));
    }
    await resultAction.unwrap();
    const actionLabel = mode === 'add' ? 'created' : 'updated';
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} ${actionLabel} successfully!`);
    closeModal(); 
  } catch (err) {
    toast.error(err || `Failed to ${mode} ${type}.`);
  }
};
const handleDelete = async () => {
  const { type, item } = modalState;
  if (!item?.id) return;

  try {
    let resultAction;

    if (type === 'region') resultAction = dispatch(deleteRegion(item.id));
    if (type === 'district') resultAction = dispatch(deleteDistrict(item.id));
    if (type === 'community') resultAction = dispatch(deleteCommunity(item.id));

    await resultAction.unwrap();
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
  } catch (err) {
    toast.error(err || `Could not delete this ${type}.`);
  }
};

  const actionLoading = regionActionLoading || districtActionLoading || communityActionLoading;
  const formError = regionError || districtError || communityError;

  // Modal labels
  const typeLabel = { region: 'Region', district: 'District', community: 'Community' };

  const MobileBreadcrumb = () => (
    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 lg:hidden bg-white rounded-xl px-4 py-2.5 border border-slate-100 shadow-sm">
      <button onClick={() => setMobileView('regions')} className={mobileView === 'regions' ? 'text-purple-600' : 'hover:text-slate-800'}>Regions</button>
      {activeRegion && (
        <>
          <ChevronRight size={12} className="text-slate-300" />
          <button onClick={() => setMobileView('districts')} className={mobileView === 'districts' ? 'text-purple-600' : 'hover:text-slate-800'}>
            {activeRegion.name}
          </button>
        </>
      )}
      {activeDistrict && (
        <>
          <ChevronRight size={12} className="text-slate-300" />
          <button onClick={() => setMobileView('communities')} className={mobileView === 'communities' ? 'text-purple-600' : 'hover:text-slate-800'}>
            {activeDistrict.name}
          </button>
        </>
      )}
    </div>
  );


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Geography Control</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage administrative regions, districts, and communities.</p>
        </div>
      </div>

      <MobileBreadcrumb />

      {/* Mobile back buttons */}
      {mobileView !== 'regions' && (
        <button
          onClick={() => {
            if (mobileView === 'communities') setMobileView('districts');
            else setMobileView('regions');
          }}
          className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-purple-600 transition-colors lg:hidden"
        >
          <ArrowLeft size={16} /> Back
        </button>
      )}

      {/* Three-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ minHeight: 'min(calc(100vh - 260px), 700px)' }}>

        {/* ── Regions ── */}
        <div className={`lg:col-span-3 ${mobileView === 'regions' ? 'flex' : 'hidden lg:flex'} flex-col`} style={{ minHeight: '500px' }}>
          <Column
            icon={Globe}
            title="Regions"
            count={regionMeta?.total}
            showAdd
            onAdd={() => openModal('region', 'add')}
            loading={regionsLoading}
            empty={!regionsLoading && regionList.length === 0}
            emptyIcon={Globe}
            emptyLabel="No regions yet"
            footer={
              regionMeta?.total > (regionMeta?.per_page || 10) ? (
                <Pagination
                  small
                  currentPage={regionMeta?.current_page || 1}
                  totalItems={regionMeta?.total || 0}
                  perPage={regionMeta?.per_page || 10}
                  onPageChange={(p) => dispatch(fetchRegions({ page: p, limit: 10 }))}
                />
              ) : null
            }
          >
            {regionList.map(r => (
              <RegionRow
                key={r.id}
                item={r}
                active={activeRegion?.id === r.id}
                onClick={() => handleRegionSelect(r)}
                onEdit={() => openModal('region', 'edit', r)}
                onDelete={() => openModal('region', 'delete', r)}
              />
            ))}
          </Column>
        </div>

        {/* ── Districts ── */}
        <div className={`lg:col-span-4 ${mobileView === 'districts' ? 'flex' : 'hidden lg:flex'} flex-col`} style={{ minHeight: '500px' }}>
          <Column
            icon={Building2}
            title="Districts"
            count={districtMeta?.total}
            showAdd={!!activeRegion}
            onAdd={() => openModal('district', 'add')}
            loading={districtsLoading}
            empty={!districtsLoading && (!activeRegion || districtList.length === 0)}
            emptyIcon={Building2}
            emptyLabel={!activeRegion ? 'Select a region first' : 'No districts yet'}
            footer={
              activeRegion && districtMeta?.total > (districtMeta?.per_page || 10) ? (
                <Pagination
                  small
                  currentPage={districtMeta?.current_page || 1}
                  totalItems={districtMeta?.total || 0}
                  perPage={districtMeta?.per_page || 10}
                  onPageChange={(p) => dispatch(fetchDistricts({ region_id: activeRegion.id, page: p, limit: 10 }))}
                />
              ) : null
            }
          >
            {districtList.map(d => (
              <DistrictRow
                key={d.id}
                item={d}
                active={activeDistrict?.id === d.id}
                onClick={() => handleDistrictSelect(d)}
                onEdit={() => openModal('district', 'edit', d)}
                onDelete={() => openModal('district', 'delete', d)}
              />
            ))}
          </Column>
        </div>

        {/* ── Communities ── */}
        <div className={`lg:col-span-5 ${mobileView === 'communities' ? 'flex' : 'hidden lg:flex'} flex-col`} style={{ minHeight: '500px' }}>
          <Column
            icon={Home}
            title="Communities"
            count={communityMeta?.total}
            showAdd={!!activeDistrict}
            onAdd={() => openModal('community', 'add')}
            loading={communitiesLoading}
            empty={!communitiesLoading && (!activeDistrict || communityList.length === 0)}
            emptyIcon={MapPin}
            emptyLabel={!activeDistrict ? 'Select a district first' : 'No communities yet'}
            footer={
              activeDistrict && communityMeta?.total > (communityMeta?.per_page || 10) ? (
                <Pagination
                  small
                  currentPage={communityMeta?.current_page || 1}
                  totalItems={communityMeta?.total || 0}
                  perPage={communityMeta?.per_page || 10}
                  onPageChange={(p) => dispatch(fetchCommunities({ district_id: activeDistrict.id, page: p, limit: 10 }))}
                />
              ) : null
            }
          >
            <div className="p-2 space-y-2">
              {communityList.map(c => (
                <CommunityCard
                  key={c.id}
                  item={c}
                  onEdit={() => openModal('community', 'edit', c)}
                  onDelete={() => openModal('community', 'delete', c)}
                />
              ))}
            </div>
          </Column>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {modalState && modalState.mode !== 'delete' && (
        <ModalShell
          title={`${modalState.mode === 'add' ? 'New' : 'Edit'} ${typeLabel[modalState.type]}`}
          onClose={closeModal}
        >
          <div className="p-6 space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">{formError}</div>
            )}

            {/* Name */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Name</label>
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all"
                placeholder={`${typeLabel[modalState.type]} name`}
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Code (region & district only) */}
            {modalState.type !== 'community' && (
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Code</label>
                <input
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all"
                  placeholder="e.g. GH-AS"
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
            )}

            {/* Lat/Lng (community only) */}
            {modalState.type === 'community' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Latitude</label>
                  <input
                    type="number"
                    step="any"
    
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="5.6037"
                    value={formData.latitude || ''}
                    onChange={(e) => setFormData({ ...formData, latitude:(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="-0.1870"
                    value={formData.longitude || ''}
                    onChange={(e) => setFormData({ ...formData, longitude: (e.target.value) })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button onClick={closeModal} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors text-sm">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={actionLoading}
              className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {actionLoading ? <Loader2 size={16} className="animate-spin" /> : modalState.mode === 'add' ? 'Create' : 'Save Changes'}
            </button>
          </div>
        </ModalShell>
      )}

      {/* ── Delete Modal ── */}
      {modalState?.mode === 'delete' && (
        <DeleteModal
          label={typeLabel[modalState.type]}
          itemName={modalState.item?.name}
          onConfirm={handleDelete}
          onCancel={closeModal}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default GeographyPage;