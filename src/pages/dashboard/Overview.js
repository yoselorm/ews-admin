import React, { useEffect } from 'react';
import { Users, Activity, AlertTriangle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuditLogs, fetchDashboardStats } from '../../redux/StatsSlice';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon size={24} color="white" />
      </div>
      <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">
        {trend}
      </span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

const Overview = () => {
  const dispatch = useDispatch();
  const { loading, stats, auditLogs } = useSelector((state) => state.stats);
  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchAuditLogs({ limit: 5, sort: '-created_at' }));
  }, [dispatch]);

  if (loading && !stats) return (
    <div className="flex items-center justify-center h-64 text-slate-400 font-medium">
      Refreshing dashboard data...
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm">Real-time performance and system health.</p>
      </div>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <StatCard 
          title="Pregnant Women" 
          value={stats?.total_pregnant_women?.toLocaleString() || '0'} 
          trend="In District" 
          icon={Users} color="bg-blue-500" 
        />
        <StatCard 
          title="Health Workers" 
          value={stats?.total_health_workers || '0'} 
          trend="Active" 
          icon={Activity} color="bg-purple-500" 
        />
        <StatCard 
          title="Active Alerts" 
          value={stats?.active_alerts_count || '0'} 
          trend="Pending" 
          icon={AlertTriangle} color="bg-orange-500" 
        />
        <StatCard 
          title="High Risk Cases" 
          value={stats?.high_risk_count || '0'} 
          trend="Urgent" 
          icon={CheckCircle} color="bg-red-500" 
        />
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Clock size={18} className="text-purple-500" />
            Recent System Activity
          </h2>
          <Link to="audit-logs" className="text-purple-600 text-sm font-bold hover:underline flex items-center gap-1">
            View All <ExternalLink size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">Event</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">Admin/User</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase">IP Address</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {auditLogs?.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-700">{log.action}</span>
                    <p className="text-xs text-slate-400 truncate max-w-[200px]">{log.description}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {`${log.user?.first_name} ${log.user?.last_name}`}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">
                    {log.ip_address || '0.0.0.0'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 text-right">
                    {log.created_at ? new Date(log.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
              {(!auditLogs || auditLogs.length === 0) && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-400 italic">
                    No recent logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Overview;