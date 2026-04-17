import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminAlerts, resolveAlert, deleteAlert } from '../../redux/AlertSlice';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Filter, 
  Clock, 
  MapPin, 
  Activity,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import moment from 'moment';

const AlertsManagement = () => {
  const dispatch = useDispatch();
  const { alerts, loading, actionLoading, meta } = useSelector((state) => state.alerts);
  
  const [filters, setFilters] = useState({
    risk_level: '',
    is_resolved: '',
    page: 1
  });

  useEffect(() => {
    dispatch(fetchAdminAlerts(filters));
  }, [filters, dispatch]);

  const handleResolve = (id) => {
    dispatch(resolveAlert(id));
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-100';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'moderate': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      {/* Header Area */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Alert Management</h1>
          <p className="text-slate-500 mt-1">System-wide climate risk monitoring</p>
        </div>
        <button 
          onClick={() => dispatch(fetchAdminAlerts(filters))}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filter Bar - Based on Swagger Params */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-6 items-center">
        <div className="flex items-center gap-2 border-r border-slate-100 pr-6">
          <Filter size={18} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Filters</span>
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Risk Level</label>
          <select 
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-purple-500/20"
            onChange={(e) => setFilters({...filters, risk_level: e.target.value})}
          >
            <option value="">All Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Resolution Status</label>
          <select 
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-purple-500/20"
            onChange={(e) => setFilters({...filters, is_resolved: e.target.value})}
          >
            <option value="">All Status</option>
            <option value="false">Active Only</option>
            <option value="true">Resolved Only</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-tighter">Severity</th>
              <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-tighter">Event Details</th>
              <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-tighter">Community</th>
              <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-tighter">Reading</th>
              <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-tighter">Status</th>
              <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-tighter text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-24 text-slate-400 font-medium">Fetching real-time data...</td></tr>
            ) : alerts.map((alert) => (
              <tr key={alert.id} className="hover:bg-slate-50/30 transition-colors">
                <td className="px-6 py-5">
                  <div className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase ${getRiskColor(alert.risk_level)}`}>
                    {alert.risk_level}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">{alert.title}</span>
                    <span className="text-xs text-slate-500 mt-0.5 max-w-[200px] truncate">{alert.message}</span>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Clock size={12} className="text-slate-300" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{moment(alert.created_at).fromNow()}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <div className="p-1.5 bg-slate-100 rounded-md">
                      <MapPin size={14} className="text-slate-500" />
                    </div>
                    {alert.community?.name || 'Central District'}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-end gap-1">
                    <span className="text-base font-black text-slate-700">{alert.triggered_value}</span>
                    <span className="text-[10px] font-bold text-slate-400 mb-1">
                      {alert.parameter === 'temperature_2m' ? '°C' : 'UNITS'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  {alert.is_resolved ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                      <CheckCircle2 size={14} /> Resolved
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-orange-500 font-bold text-xs">
                      <AlertTriangle size={14} /> Active
                    </div>
                  )}
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-3">
                    {!alert.is_resolved && (
                      <button 
                        onClick={() => handleResolve(alert.id)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                        title="Mark as Resolved"
                      >
                        <CheckCircle2 size={20} />
                      </button>
                    )}
                    <button 
                      onClick={() => dispatch(deleteAlert(alert.id))}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Alert"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Professional Pagination */}
      <div className="mt-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <Activity size={16} className="text-purple-500" />
           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
             Total Records: {meta.total}
           </p>
        </div>
        <div className="flex gap-2">
          <button 
            disabled={meta.current_page === 1}
            onClick={() => setFilters({...filters, page: filters.page - 1})}
            className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center px-4 bg-white border border-slate-200 rounded-xl">
             <span className="text-xs font-bold text-slate-700">{meta.current_page} / {meta.last_page}</span>
          </div>
          <button 
            disabled={meta.current_page === meta.last_page}
            onClick={() => setFilters({...filters, page: filters.page + 1})}
            className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertsManagement;