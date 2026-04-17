import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAdminAlerts, resolveAlert, deleteAlert } from '../../redux/AlertSlice';
import { 
  AlertTriangle, CheckCircle2, Trash2, Filter, 
  Clock, MapPin, Activity, Loader2, ShieldCheck, Map
} from 'lucide-react';
import moment from 'moment';

import Pagination from '../../components/Pagination';
import { fetchCommunityList } from '../../redux/CommunitySlice';

const AlertsManagement = () => {
  const dispatch = useDispatch();
  const { alerts, loading, actionLoading, meta } = useSelector((state) => state.alerts);
  // Assuming your community slice stores the array in list or list
  const { list } = useSelector((state) => state.communities);

  // Modals & Target State
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetAlert, setTargetAlert] = useState(null);
  
  const [filters, setFilters] = useState({ risk_level: '', is_resolved: '', page: 1, limit: 10 , community_id: ''});

  useEffect(() => {
    dispatch(fetchAdminAlerts(filters));
  }, [filters, dispatch]);

   useEffect(() => {
          dispatch(fetchCommunityList());
      }, [dispatch])

  const handleConfirmResolve = async () => {
    if (!targetAlert) return;
    const result = await dispatch(resolveAlert(targetAlert.id));
    if (!result.error) setIsResolveModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!targetAlert) return;
    const result = await dispatch(deleteAlert(targetAlert.id));
    if (!result.error) setIsDeleteModalOpen(false);
  };

  const getRiskStyle = (level) => {
    switch (level) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-100 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'moderate': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end mb-12">
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-[28px] shadow-sm border border-slate-100">
            <Activity className="text-purple-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Climate Alerts</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[3px] mt-1">Real-time Emergency Monitoring</p>
          </div>
        </div>
        
        <div className="bg-white px-6 py-4 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-sm font-black text-slate-700">{meta.total} Active Triggers</span>
        </div>
      </div>

      {/* Glassmorphism Filters */}
      <div className="bg-white/70 backdrop-blur-xl p-5 rounded-[32px] border border-white shadow-sm mb-8 flex flex-wrap gap-6 items-center">
        <div className="flex items-center gap-3 border-r border-slate-100 pr-6">
          <Filter size={20} className="text-slate-400" />
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Global Triage</span>
        </div>
        
        {/* NEW: Community Filter Dropdown */}
        <div className="relative">
           <select 
            className="bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-3.5 font-bold text-slate-600 outline-none focus:ring-4 focus:ring-purple-500/5 transition-all appearance-none"
            value={filters.community_id}
            onChange={(e) => setFilters({...filters, community_id: e.target.value, page: 1})}
          >
            <option value="">All Communities</option>
            {list?.map((community) => (
              <option key={community.id} value={community.id}>
                {community.name}
              </option>
            ))}
          </select>
          <Map size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <select 
          className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3.5 font-bold text-slate-600 outline-none focus:ring-4 focus:ring-purple-500/5 transition-all"
          onChange={(e) => setFilters({...filters, risk_level: e.target.value, page: 1})}
        >
          <option value="">All Severities</option>
          <option value="critical">Critical Only</option>
          <option value="high">High Risk</option>
          <option value="moderate">Moderate</option>
        </select>

        <select 
          className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3.5 font-bold text-slate-600 outline-none focus:ring-4 focus:ring-purple-500/5 transition-all"
          onChange={(e) => setFilters({...filters, is_resolved: e.target.value, page: 1})}
        >
          <option value="">All Statuses</option>
          <option value="false">Unresolved</option>
          <option value="true">Resolved</option>
        </select>
      </div>

      {/* Alert Table */}
      <div className="bg-white rounded-[44px] shadow-sm border border-slate-100 overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-50">
            <tr>
              <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Severity</th>
              <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Trigger Detail</th>
              <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Location</th>
              <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Status</th>
              <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[3px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="5" className="py-40 text-center"><Loader2 className="animate-spin mx-auto text-purple-600" size={40} /></td></tr>
            ) : alerts.map((alert) => (
              <tr key={alert.id} className="group hover:bg-slate-50/50 transition-all">
                <td className="px-10 py-8">
                  <div className={`inline-flex px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider ${getRiskStyle(alert.risk_level)}`}>
                    {alert.risk_level}
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex flex-col">
                    <span className="text-base font-black text-slate-800">{alert.title}</span>
                    <span className="text-xs text-slate-400 mt-1 font-medium">{alert.message}</span>
                    <div className="flex items-center gap-2 mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Clock size={12} /> {moment(alert.created_at).fromNow()}
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                    <div className="p-2 bg-slate-100 rounded-xl"><MapPin size={16} /></div>
                    {alert.community?.name || 'Unknown Location'}
                  </div>
                </td>
                <td className="px-10 py-8">
                  {alert.is_resolved ? (
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-[11px] uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                      <ShieldCheck size={14} /> System Resolved
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-500 font-black text-[11px] uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 animate-pulse">
                      <AlertTriangle size={14} /> Immediate Action
                    </div>
                  )}
                </td>
                <td className="px-10 py-8 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    {!alert.is_resolved && (
                      <button 
                        onClick={() => { setTargetAlert(alert); setIsResolveModalOpen(true); }}
                        className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-600 transition-all"
                      >
                        <CheckCircle2 size={20} />
                      </button>
                    )}
                    <button 
                      onClick={() => { setTargetAlert(alert); setIsDeleteModalOpen(true); }}
                      className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={20} />
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

      {/* Modals remain unchanged */}
      <AnimatePresence>
        {(isResolveModalOpen || isDeleteModalOpen) && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            {/* 1. Resolve Confirmation */}
            {isResolveModalOpen && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }}
                className="bg-white w-full max-w-md rounded-[48px] shadow-2xl overflow-hidden p-12 text-center"
              >
                <div className="w-24 h-24 bg-emerald-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-emerald-100 text-emerald-500">
                  <ShieldCheck size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Resolve Alert?</h2>
                <p className="text-slate-500 font-medium mb-10 px-6">
                  This will notify the community that the <span className="text-slate-900 font-bold">{targetAlert?.title}</span> risk has passed.
                </p>
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={handleConfirmResolve} disabled={actionLoading}
                    className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-[28px] font-black shadow-xl shadow-slate-200 transition-all"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" size={24} /> : 'Confirm Resolution'}
                  </button>
                  <button onClick={() => setIsResolveModalOpen(false)} className="w-full bg-slate-50 text-slate-400 py-6 rounded-[28px] font-black">Cancel</button>
                </div>
              </motion.div>
            )}

            {/* 2. Delete Confirmation */}
            {isDeleteModalOpen && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }}
                className="bg-white w-full max-w-md rounded-[48px] shadow-2xl overflow-hidden p-12 text-center"
              >
                <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-red-100 text-red-500">
                  <AlertTriangle size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Delete Permanently?</h2>
                <p className="text-slate-500 font-medium mb-10 px-6">
                  Deleting this alert record is irreversible and will remove it from system logs.
                </p>
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={handleConfirmDelete} disabled={actionLoading}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-6 rounded-[28px] font-black shadow-xl shadow-red-100 transition-all"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" size={24} /> : 'Yes, Delete Entry'}
                  </button>
                  <button onClick={() => setIsDeleteModalOpen(false)} className="w-full bg-slate-50 text-slate-400 py-6 rounded-[28px] font-black">Nevermind</button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlertsManagement;