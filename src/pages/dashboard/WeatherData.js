import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudSun, Search, Calendar, Eye, Download,
  MapPin, Wind, Thermometer, Droplets, Sun, X, Loader2,
  ChevronLeft, ChevronRight, Activity
} from 'lucide-react';
import { fetchWeatherData } from '../../redux/WeatherSlice';
import Pagination from '../../components/Pagination';

const WeatherData = () => {
  const dispatch = useDispatch();
  const { list, loading, meta } = useSelector((state) => state.weather);

  const [selectedEntry, setSelectedEntry] = useState(null);
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

  // Helper to interpret weather codes (WMO standards)
  const getWeatherStatus = (code) => {
    if (code === 0) return { label: 'Clear Sky', color: 'text-orange-500 bg-orange-50', icon: <Sun size={14}/> };
    if (code < 4) return { label: 'Partly Cloudy', color: 'text-blue-500 bg-blue-50', icon: <CloudSun size={14}/> };
    return { label: 'Precipitation', color: 'text-indigo-500 bg-indigo-50', icon: <Droplets size={14}/> };
  };

  return (
    <div className="p-10 bg-[#FBFBFB] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-5">
          <div className="bg-slate-900 p-4 rounded-[24px] shadow-2xl shadow-slate-200 text-white">
            <CloudSun size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Weather Analytics</h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[3px]">Environmental Monitoring</p>
          </div>
        </div>
        <button className="bg-white border-2 border-slate-100 text-slate-900 px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
          <Download size={20} strokeWidth={3}/> Export Dataset
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm mb-8 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[300px] relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors" size={20} />
          <input 
            type="text" placeholder="Search by community or region..."
            className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-purple-500/5 transition-all"
            onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
          />
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-2">
          <Calendar size={18} className="text-slate-400" />
          <input type="date" className="bg-transparent border-none text-xs font-black text-slate-600 outline-none uppercase" onChange={(e) => setFilters({...filters, start_date: e.target.value})} />
          <span className="text-slate-300 font-bold">-</span>
          <input type="date" className="bg-transparent border-none text-xs font-black text-slate-600 outline-none uppercase" onChange={(e) => setFilters({...filters, end_date: e.target.value})} />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Community</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Conditions</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Temperature</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="4" className="px-10 py-8"><div className="h-12 bg-slate-50 rounded-2xl w-full"></div></td>
                </tr>
              ))
            ) : list?.map((item) => {
              const status = getWeatherStatus(item.weather_code);
              return (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 shadow-sm group-hover:border-purple-200 transition-all">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800">{item.community || 'Jamestown'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {new Date(item.forecast_time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Actual</span>
                        <span className="font-black text-slate-700">{item.temperature_2m}°C</span>
                      </div>
                      <div className="flex flex-col border-l border-slate-100 pl-6">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Apparent</span>
                        <span className="font-black text-slate-400">{item.apparent_temperature}°C</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => setSelectedEntry(item)}
                      className="p-3 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-purple-600 hover:border-purple-200 transition-all shadow-sm opacity-0 group-hover:opacity-100"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="p-6 border-t border-slate-50 bg-slate-50/30">
          <Pagination 
            currentPage={meta?.current_page || 1} 
            totalItems={meta?.total || 0} 
            onPageChange={(p) => setFilters({...filters, page: p})} 
          />
        </div>
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden p-12 relative">
              <button onClick={() => setSelectedEntry(null)} className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-full transition-all text-slate-300"><X size={24}/></button>
              
              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900">{selectedEntry.community}</h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-[2px]">Detailed Atmospheric Report</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-6">Thermal Metrics</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between font-black text-sm text-slate-700"><span>Heat Index</span><span>{selectedEntry.heat_index}°</span></div>
                    <div className="flex justify-between font-black text-sm text-slate-700"><span>Humidity</span><span>{selectedEntry.relative_humidity}%</span></div>
                    <div className="flex justify-between font-black text-sm text-orange-500"><span>UV Index</span><span>{selectedEntry.uv_index}</span></div>
                  </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-6">Wind & Rain</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between font-black text-sm text-slate-700"><span>Speed</span><span>{selectedEntry.wind_speed_10m} km/h</span></div>
                    <div className="flex justify-between font-black text-sm text-slate-700"><span>Gusts</span><span>{selectedEntry.wind_gusts_10m} km/h</span></div>
                    <div className="flex justify-between font-black text-sm text-blue-500"><span>Precipitation</span><span>{selectedEntry.precipitation}mm</span></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 border-2 border-dashed border-slate-100 rounded-[24px] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity size={20} className="text-purple-500"/>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Fetched At</span>
                </div>
                <span className="text-xs font-black text-slate-800">{new Date(selectedEntry.fetched_at).toLocaleString()}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WeatherData;