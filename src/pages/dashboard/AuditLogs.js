import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuditLogs } from '../../redux/StatsSlice';
import { Search, Shield, Globe } from 'lucide-react';
import Pagination from '../../components/Pagination';

const AuditLogs = () => {
  const dispatch = useDispatch();
  const { auditLogs, loading, meta } = useSelector((state) => state.stats);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
    dispatch(fetchAuditLogs({ page: 1, search , sort: '-created_at' })); 
  }, [dispatch, search]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    dispatch(fetchAuditLogs({ page: newPage, search , sort: '-created_at' })); 
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">System Audit Logs</h1>
          <p className="text-slate-500 text-sm">Monitor all administrative and system-level actions.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by action or user..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Action</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">User</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Contact</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">IP Source</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {auditLogs?.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/30 transition-all group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                      <Shield size={16} />
                    </div>
                    <span className="font-bold text-slate-700 capitalize">{log.action}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={log.user?.avatar_url}
                      alt="avatar"
                      className="w-7 h-7 rounded-full bg-slate-200 border border-white shadow-sm"
                    />
                    <span className="text-sm text-slate-600 font-medium">
                      {log.user ? `${log.user.first_name} ${log.user.last_name}` : 'System'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-slate-400 block">{log.user?.email}</span>
                  <span className="text-xs text-slate-400 block">{log.user?.phone_number}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
                    <Globe size={12} />
                    {log.ip_address}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-xs font-semibold text-slate-400">
                    {log.created_at ? new Date(log.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination
          currentPage={currentPage}
          totalItems={meta?.total || 0}
          perPage={meta?.per_page || 15}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default AuditLogs;