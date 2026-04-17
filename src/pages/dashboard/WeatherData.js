import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  CloudSun, Search, Filter, Calendar, 
  ChevronLeft, ChevronRight, Eye, Download,
  MapPin, Wind, Thermometer
} from 'lucide-react';
import { fetchWeatherData } from '../../redux/WeatherSlice';

const WeatherData = () => {
  const dispatch = useDispatch();
  const { list, loading, pagination } = useSelector((state) => state.weather);

  // Filter States (Matching your API parameters)
  const [filters, setFilters] = useState({
    page: 1,
    search: '',
    community_id: '',
    start_date: '',
    end_date: '',
    sort: '-forecast_time'
  });

  useEffect(() => {
    dispatch(fetchWeatherData(filters));
  }, [dispatch, filters]);

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Weather Analytics</h1>
          <p className="text-slate-500 text-sm">Monitor environmental conditions across communities.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search weather data..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        
        <select 
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-purple-500"
          onChange={(e) => setFilters({...filters, community_id: e.target.value})}
        >
          <option value="">All Communities</option>
          <option value="comm_01">Central Region</option>
          <option value="comm_02">Northern District</option>
        </select>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
          <Calendar size={16} className="text-slate-400" />
          <input 
            type="date" 
            className="bg-transparent border-none text-xs text-slate-600 outline-none"
            onChange={(e) => setFilters({...filters, start_date: e.target.value})}
          />
          <span className="text-slate-300">-</span>
          <input 
            type="date" 
            className="bg-transparent border-none text-xs text-slate-600 outline-none"
            onChange={(e) => setFilters({...filters, end_date: e.target.value})}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Community</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Temperature</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Humidity</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Forecast Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-6 py-4 bg-slate-50/50 h-16"></td>
                  </tr>
                ))
              ) : list?.length > 0 ? (
                list.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                          <MapPin size={16} />
                        </div>
                        <span className="font-semibold text-slate-700">{item.community_name || 'General'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Thermometer size={16} className="text-orange-400" />
                        {item.temperature}°C
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-1 text-slate-600">
                        <Wind size={16} className="text-sky-400" />
                        {item.humidity}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(item.forecast_time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-purple-50 text-slate-400 hover:text-purple-600 rounded-lg transition-all">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No weather data found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Page <b>{filters.page}</b>
          </span>
          <div className="flex gap-2">
            <button 
              disabled={filters.page === 1}
              onClick={() => handlePageChange(filters.page - 1)}
              className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => handlePageChange(filters.page + 1)}
              className="p-2 border border-slate-200 rounded-lg hover:bg-white transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherData;