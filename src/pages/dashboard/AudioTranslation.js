import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchAudioTranslations, uploadAudioTranslation, deleteAudioTranslation, clearAudioStatus 
} from '../../redux/AudioTranslationSlice';
import { fetchLanguages } from '../../redux/LanguageSlice';
import { 
  Plus, Search, Trash2, Mic, Play, Pause, X, 
  Loader2, AlertTriangle, Music, Filter, Globe
} from 'lucide-react';

import Pagination from '../../components/Pagination'; 

const AudioTranslationManagement = () => {
  const dispatch = useDispatch();
  const { audioTranslations, loading, actionLoading, meta } = useSelector((state) => state.audioTranslations);
  const { languages } = useSelector((state) => state.languages);

  // States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetAudio, setTargetAudio] = useState(null);
  const [playingId, setPlayingId] = useState(null); // Simple audio player state
  
  const [formData, setFormData] = useState({ 
    translatable_type: 'alert', 
    translatable_id: '', 
    language_id: '', 
    audio_file: null 
  });
  
  const [filters, setFilters] = useState({ 
    search: '', 
    translatable_type: '', 
    language_id: '', 
    page: 1, 
    limit: 10 
  });

  useEffect(() => {
    dispatch(fetchAudioTranslations(filters));
    dispatch(fetchLanguages({ limit: 100 })); // Get all languages for the dropdown
  }, [filters, dispatch]);

  // --- Handlers ---
  const handleUpload = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('translatable_type', formData.translatable_type);
    data.append('translatable_id', formData.translatable_id);
    data.append('language_id', formData.language_id);
    data.append('audio_file', formData.audio_file);

    const result = await dispatch(uploadAudioTranslation(data));
    if (!result.error) {
      setIsUploadModalOpen(false);
      setFormData({ translatable_type: 'alert', translatable_id: '', language_id: '', audio_file: null });
    }
  };

  const confirmDelete = async () => {
    if (!targetAudio) return;
    const result = await dispatch(deleteAudioTranslation(targetAudio.id));
    if (!result.error) setIsDeleteModalOpen(false);
  };

  const togglePlayback = (id, url) => {
    const player = document.getElementById('global-audio-player');
    if (playingId === id) {
      player.pause();
      setPlayingId(null);
    } else {
      player.src = url;
      player.play();
      setPlayingId(id);
    }
  };

  return (
    <div className="p-10 bg-[#F9FAFB] min-h-screen">
      <audio id="global-audio-player" onEnded={() => setPlayingId(null)} className="hidden" />

      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
            <Mic className="text-purple-600" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Audio Vault</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Voice Translation Management</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          Upload Translation
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-[28px] border border-white shadow-sm mb-8 flex items-center gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" placeholder="Search by ID..."
            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-purple-500/5 transition-all"
            onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
          />
        </div>
        <select 
          className="bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-600 outline-none focus:ring-4 focus:ring-purple-500/5 transition-all"
          onChange={(e) => setFilters({...filters, translatable_type: e.target.value, page: 1})}
        >
          <option value="">All Types</option>
          <option value="alert">Alerts</option>
          <option value="health_tip">Health Tips</option>
          <option value="precaution">Precautions</option>
          <option value="safety_guide">Safety Guides</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-auto">
        <table className="w-full">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Content Ref</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Language</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Playback</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[3px] text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="4" className="py-32 text-center"><Loader2 className="animate-spin mx-auto text-purple-600" size={40} /></td></tr>
            ) : audioTranslations.map((audio) => (
              <tr key={audio.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-10 py-7">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                      <Music size={20} />
                    </div>
                    <div>
                      <span className="block font-black text-slate-800 text-sm uppercase tracking-wider">{audio.translatable_type.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] font-bold text-slate-400">ID: {audio.translatable_id}</span>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-7">
                  <div className="flex items-center gap-2">
                    <Globe size={14} className="text-slate-300" />
                    <span className="font-black text-slate-600 uppercase text-xs tracking-widest">{audio.language?.name || 'Unknown'}</span>
                  </div>
                </td>
                <td className="px-10 py-7">
                  <button 
                    onClick={() => togglePlayback(audio.id, audio.audio_url)}
                    className={`flex items-center gap-3 px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${playingId === audio.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {playingId === audio.id ? <Pause size={14} fill="white" /> : <Play size={14} fill="currentColor" />}
                    {playingId === audio.id ? 'Playing...' : `Listen (${audio.duration_seconds}s)`}
                  </button>
                </td>
                <td className="px-10 py-7 text-right">
                  <button 
                    onClick={() => { setTargetAudio(audio); setIsDeleteModalOpen(true); }}
                    className="p-3 bg-white shadow-sm border border-slate-100 rounded-xl text-slate-300 hover:text-red-500 hover:border-red-100 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination 
          currentPage={meta.current_page} 
          totalItems={meta.total} 
          onPageChange={(p) => setFilters({...filters, page: p})} 
        />
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {(isUploadModalOpen || isDeleteModalOpen) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6">
            
            {/* Upload Modal */}
            {isUploadModalOpen && (
              <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }} className="bg-white w-full max-w-xl rounded-[48px] shadow-2xl overflow-hidden">
                <div className="p-12">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Upload Audio</h2>
                    <button onClick={() => setIsUploadModalOpen(false)} className="p-3 bg-slate-50 rounded-full text-slate-400"><X size={20} /></button>
                  </div>

                  <form onSubmit={handleUpload} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                        <select 
                          className="w-full bg-slate-50 border border-slate-100 rounded-[20px] p-5 font-bold text-slate-800 outline-none focus:border-purple-500"
                          value={formData.translatable_type}
                          onChange={(e) => setFormData({...formData, translatable_type: e.target.value})}
                        >
                          <option value="alert">Alert</option>
                          <option value="health_tip">Health Tip</option>
                          <option value="precaution">Precaution</option>
                          <option value="safety_guide">Safety Guide</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Language</label>
                        <select 
                          required
                          className="w-full bg-slate-50 border border-slate-100 rounded-[20px] p-5 font-bold text-slate-800 outline-none focus:border-purple-500"
                          value={formData.language_id}
                          onChange={(e) => setFormData({...formData, language_id: e.target.value})}
                        >
                          <option value="">Select...</option>
                          {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Translatable ID</label>
                      <input 
                        required placeholder="The UUID or ID of the content"
                        className="w-full bg-slate-50 border border-slate-100 rounded-[20px] p-5 font-bold text-slate-800 outline-none focus:border-purple-500"
                        value={formData.translatable_id}
                        onChange={(e) => setFormData({...formData, translatable_id: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Audio File (.mp3, .wav)</label>
                      <div className="relative group">
                        <input 
                          type="file" required accept="audio/*"
                          className="w-full opacity-0 absolute inset-0 cursor-pointer z-10"
                          onChange={(e) => setFormData({...formData, audio_file: e.target.files[0]})}
                        />
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[20px] p-10 text-center group-hover:bg-slate-100 group-hover:border-purple-200 transition-all">
                          <Music className="mx-auto text-slate-300 mb-2" size={32} />
                          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                            {formData.audio_file ? formData.audio_file.name : 'Click to Browse File'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button disabled={actionLoading} type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[24px] font-black shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3">
                      {actionLoading ? <Loader2 className="animate-spin" size={24} /> : 'Sync with Database'}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white w-full max-w-md rounded-[48px] shadow-2xl p-12 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-[30px] flex items-center justify-center mx-auto mb-8">
                  <AlertTriangle className="text-red-500" size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-10 tracking-tight">Remove this audio asset?</h2>
                <div className="flex flex-col gap-3">
                  <button onClick={confirmDelete} disabled={actionLoading} className="w-full bg-red-500 text-white py-5 rounded-[20px] font-black hover:bg-red-600 transition-all">
                    {actionLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Delete asset'}
                  </button>
                  <button onClick={() => setIsDeleteModalOpen(false)} className="w-full bg-slate-50 text-slate-400 py-5 rounded-[20px] font-black">Nevermind</button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AudioTranslationManagement;