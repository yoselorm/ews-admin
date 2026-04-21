import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    fetchAudioTranslations, uploadAudioTranslation, deleteAudioTranslation,
} from '../../redux/AudioTranslationSlice';
import { fetchLanguages } from '../../redux/LanguageSlice';
import {
    Plus, Search, Trash2, Mic, Play, Pause, X,
    Loader2, AlertTriangle, Music, Globe,
    Check
} from 'lucide-react';

import Pagination from '../../components/Pagination';
import toast from '../../components/Toast';

const AudioTranslationManagement = () => {
    const dispatch = useDispatch();
    const { audioTranslations, loading, actionLoading, meta } = useSelector((state) => state.audioTranslations);
    const { languages } = useSelector((state) => state.languages);

    const [isRecording, setIsRecording] = useState(false);
    const [recorder, setRecorder] = useState(null);
    const [recordMode, setRecordMode] = useState('upload');

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });

            const file = new File([blob], `recording_${Date.now()}.webm`, {
                type: 'audio/webm'
            });

            setFormData(prev => ({
                ...prev,
                audio_file: file
            }));

            stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorder.start();
        setRecorder(mediaRecorder);
        setIsRecording(true);
    };

    const stopRecording = () => {
        recorder.stop();
        setIsRecording(false);
    };
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

        // 1. Validation check with Toast
        if (!formData.audio_file) {
            toast.warning('Please provide an audio file either by uploading or recording.');
            return;
        }

        const data = new FormData();
        data.append('translatable_type', formData.translatable_type);
        data.append('translatable_id', formData.translatable_id);
        data.append('language_id', formData.language_id);
        data.append('audio_file', formData.audio_file);

        try {
            await dispatch(uploadAudioTranslation(data)).unwrap();

            toast.success("Audio translation uploaded successfully!");

            // 3. Cleanup & Close
            setIsUploadModalOpen(false);
            setFormData({
                translatable_type: 'alert',
                translatable_id: '',
                language_id: '',
                audio_file: null
            });

        } catch (err) {
            toast.error(err || "Failed to upload audio translation.");
        }
    };

    const confirmDelete = async () => {
        if (!targetAudio) return;

        try {
            await dispatch(deleteAudioTranslation(targetAudio.id)).unwrap();

            toast.success("Audio translation deleted successfully");

            setIsDeleteModalOpen(false);
        } catch (err) {
            toast.error(err || "Failed to delete the audio translation");
        }
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
        <div className="bg-[#F9FAFB] min-h-screen">
            <audio id="global-audio-player" onEnded={() => setPlayingId(null)} className="hidden" />

            {/* Header */}
            <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-5">
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                        <Mic className="text-purple-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Audio Vault</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Voice Translation Management</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
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
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    />
                </div>
                <select
                    className="bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-600 outline-none focus:ring-4 focus:ring-purple-500/5 transition-all"
                    onChange={(e) => setFilters({ ...filters, translatable_type: e.target.value, page: 1 })}
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
                    onPageChange={(p) => setFilters({ ...filters, page: p })}
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
                                                    onChange={(e) => setFormData({ ...formData, translatable_type: e.target.value })}
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
                                                    onChange={(e) => setFormData({ ...formData, language_id: e.target.value })}
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
                                                onChange={(e) => setFormData({ ...formData, translatable_id: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audio Content</label>
                                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                                    <button
                                                        type="button"
                                                        onClick={() => setRecordMode('upload')}
                                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${recordMode === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                                                    >Upload</button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setRecordMode('record')}
                                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${recordMode === 'record' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                                                    >Record</button>
                                                </div>
                                            </div>

                                            {recordMode === 'upload' ? (
                                                /* Upload Interface */
                                                <div className="relative group">
                                                    <input
                                                        type="file" required={!formData.audio_file} accept="audio/*"
                                                        className="w-full opacity-0 absolute inset-0 cursor-pointer z-10"
                                                        onChange={(e) => setFormData({ ...formData, audio_file: e.target.files[0] })}
                                                    />
                                                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[20px] p-10 text-center group-hover:bg-slate-100 group-hover:border-purple-200 transition-all">
                                                        <Music className="mx-auto text-slate-300 mb-2" size={32} />
                                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                                            {formData.audio_file ? formData.audio_file.name : 'Click to Browse File'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Recording Interface */
                                                <div className="bg-slate-50 border-2 border-slate-200 rounded-[24px] p-8 flex flex-col items-center justify-center gap-4">
                                                    {isRecording ? (
                                                        <div className="flex flex-col items-center gap-4">
                                                            <div className="flex gap-1 items-center justify-center h-8">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <motion.div
                                                                        key={i}
                                                                        animate={{ height: [8, 24, 8] }}
                                                                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                                                        className="w-1 bg-red-500 rounded-full"
                                                                    />
                                                                ))}
                                                            </div>
                                                            <button
                                                                type="button" onClick={stopRecording}
                                                                className="bg-red-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2"
                                                            >
                                                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> Stop Recording
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-4">
                                                            {formData.audio_file && !isRecording && (
                                                                <div className="flex items-center gap-3 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 mb-2">
                                                                    <Check size={14} strokeWidth={3} />
                                                                    <span className="text-[10px] font-black uppercase">Recording Captured</span>
                                                                </div>
                                                            )}
                                                            <button
                                                                type="button" onClick={startRecording}
                                                                className="bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:border-purple-300 transition-all flex items-center gap-2"
                                                            >
                                                                <Mic className="text-purple-600" size={18} /> Start New Recording
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
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