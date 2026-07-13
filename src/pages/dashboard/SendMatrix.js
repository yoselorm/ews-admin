// pages/SendMatrix.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
    Zap, MapPin, Loader2, AlertTriangle, RotateCcw, Smartphone, Bell
} from 'lucide-react';
import { fetchThresholds } from '../../redux/ThresholdSlice';
import { fetchCommunityList } from '../../redux/CommunitySlice';
import { generateSendMatrix, resetSendMatrix } from '../../redux/SendMatrixSlice';
import toast from '../../components/Toast';

const TIER_ORDER = ['low', 'moderate', 'high'];

const TIER_META = {
    low: { label: 'LOW', badge: 'bg-blue-50 text-blue-600 border-blue-100' },
    moderate: { label: 'MODERATE', badge: 'bg-amber-50 text-amber-600 border-amber-100' },
    high: { label: 'HIGH', badge: 'bg-red-50 text-red-600 border-red-100' },
};

// Order + styling for the role columns in each send grid — kept in line with the
// purple/slate palette used across Thresholds & Precautions
const ROLE_META = {
    pregnant_woman: { label: 'Pregnant Woman', dot: 'bg-sky-500', badge: 'bg-sky-50 text-sky-600 border-sky-100' },
    lactating_mother: { label: 'Lactating Mother', dot: 'bg-violet-500', badge: 'bg-violet-50 text-violet-600 border-violet-100' },
    health_worker: { label: 'Health Worker', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    assembly_official: { label: 'Assembly Official', dot: 'bg-yellow-500', badge: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
    all: { label: 'Community (All)', dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
};
const ROLE_ORDER = ['pregnant_woman', 'lactating_mother', 'health_worker', 'assembly_official', 'all'];

const STATUS_META = {
    dispatched: { dot: 'bg-emerald-500', label: 'Dispatched', badge: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    pending: { dot: 'bg-amber-500', label: 'Pending', badge: 'bg-amber-50 text-amber-600 border-amber-100' },
    failed: { dot: 'bg-red-500', label: 'Failed', badge: 'bg-red-50 text-red-600 border-red-100' },
    simulation: { dot: 'bg-slate-400', label: 'Simulation only', badge: 'bg-slate-100 text-slate-500 border-slate-200' },
};

const formatDatePart = (iso) => {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
    } catch {
        return iso;
    }
};

const formatTimePart = (iso) => {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
        return iso;
    }
};

// Derived from scheduled_for's hour + whether the label indicates the eve-of-forecast send.
// The API doesn't return a distinct "phase" field, so this is inferred on the frontend —
// adjust the hour mapping here if your backend's schedule slots ever change.
const derivePhase = (send) => {
    const isEve = send.label?.toLowerCase().includes('on eve');
    if (isEve) return 'Evening before';

    const hour = new Date(send.scheduled_for).getUTCHours();
    if (hour === 8) return 'Morning';
    if (hour === 11) return 'Peak danger';
    if (hour === 12) return 'Peak heat';
    if (hour === 14) return 'Afternoon';
    return '';
};

const getSendStatus = (dispatch) => {
    if (!dispatch) return { key: 'simulation', text: 'No schedule found' };
    if (dispatch.status === 'dispatched') {
        return { key: 'dispatched', text: `Dispatched at ${formatTimePart(dispatch.dispatched_at)}` };
    }
    if (dispatch.status === 'pending') return { key: 'pending', text: 'Pending' };
    if (dispatch.status === 'failed') return { key: 'failed', text: 'Failed' };
    return { key: 'simulation', text: 'No schedule found' };
};

const StatusPill = ({ dispatch }) => {
    const status = getSendStatus(dispatch);
    const meta = STATUS_META[status.key];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${meta.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {status.text}
        </span>
    );
};

const RoleCard = ({ role, message }) => {
    const meta = ROLE_META[role] || ROLE_META.all;
    const [view, setView] = useState('body'); // 'body' | 'sms'
    const hasSms = !!message.sms_body;

    return (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2.5">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${meta.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                </span>
                {hasSms && (
                    <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden shrink-0 bg-white">
                        <button
                            onClick={() => setView('body')}
                            className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide transition-all ${
                                view === 'body' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            Full
                        </button>
                        <button
                            onClick={() => setView('sms')}
                            className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide transition-all ${
                                view === 'sms' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            SMS
                        </button>
                    </div>
                )}
            </div>

            <p className="text-sm font-bold text-slate-800 mb-1.5 leading-snug">{message.title}</p>

            <div className="flex items-start gap-1.5">
                {view === 'sms' ? (
                    <Smartphone size={12} className="text-slate-400 mt-0.5 shrink-0" />
                ) : (
                    <Bell size={12} className="text-slate-400 mt-0.5 shrink-0" />
                )}
                <p className="text-xs text-slate-500 leading-relaxed">
                    {view === 'sms' ? message.sms_body : message.body}
                </p>
            </div>
        </div>
    );
};

const SendRow = ({ tierLabel, send }) => {
    const phase = derivePhase(send);
    const messages = send.messages || [];
    // Sort messages into the fixed role order so columns stay consistent send-to-send
    const orderedMessages = ROLE_ORDER
        .map((role) => ({ role, message: messages.find((m) => m.role === role) }))
        .filter((entry) => entry.message);

    return (
        <div className="mb-5 last:mb-0">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-500 font-mono">
                        {tierLabel} #{send.send_number}
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                        {formatDatePart(send.scheduled_for)} · {formatTimePart(send.scheduled_for)}
                    </span>
                    {phase && <span className="text-xs text-slate-400">— {phase}</span>}
                </div>
                <StatusPill dispatch={send.dispatch} />
            </div>

            {orderedMessages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3">
                    {orderedMessages.map(({ role, message }) => (
                        <RoleCard key={role} role={role} message={message} />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center">
                    <p className="text-xs text-slate-400">No precaution content configured for this send yet.</p>
                </div>
            )}
        </div>
    );
};

const TierSection = ({ tier, tierData }) => {
    const meta = TIER_META[tier] || TIER_META.low;
    const tierLabel = tier.charAt(0).toUpperCase();

    return (
        <div className="rounded-3xl border border-slate-100 bg-white p-5 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-black tracking-widest border ${meta.badge}`}>
                    {meta.label}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {tierData.total_sends} send{tierData.total_sends !== 1 ? 's' : ''}
                </span>
            </div>

            {tierData.sends?.map((send) => (
                <SendRow key={send.send_number} tierLabel={tierLabel} send={send} />
            ))}
        </div>
    );
};

const SendMatrix = () => {
    const dispatch = useDispatch();
    const { threshold_id } = useParams();

    const { list: thresholds } = useSelector((state) => state.thresholds);
    const { list: communities } = useSelector((state) => state.communities) || {};
    const { data, loading, error } = useSelector((state) => state.sendMatrix);

    console.log(communities);

    const [thresholdId, setThresholdId] = useState(threshold_id || '');
    const [communityId, setCommunityId] = useState('');
    const [forecastDate, setForecastDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        dispatch(fetchThresholds({ limit: 100 }));
        dispatch(fetchCommunityList({ limit: 100 }));
    }, [dispatch]);

    useEffect(() => {
        if (threshold_id) setThresholdId(threshold_id);
    }, [threshold_id]);

    // Auto-fetch as soon as we have a threshold_id, on mount and whenever the URL param changes
    useEffect(() => {
        if (!threshold_id) return;
        dispatch(generateSendMatrix({
            threshold_id,
            community_id: communityId || undefined,
            forecast_date: forecastDate || undefined,
        })).unwrap().catch((err) => {
            toast.error(err || 'Failed to load send matrix.');
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [threshold_id, dispatch]);

    const handleApply = async () => {
        if (!thresholdId) {
            toast.error('Please select a threshold.');
            return;
        }
        try {
            await dispatch(generateSendMatrix({
                threshold_id: thresholdId,
                community_id: communityId || undefined,
                forecast_date: forecastDate || undefined,
            })).unwrap();
        } catch (err) {
            toast.error(err || 'Failed to generate send matrix.');
        }
    };

    const handleReset = () => {
        dispatch(resetSendMatrix());
    };

    const totalMessages = data
        ? TIER_ORDER.reduce((sum, tier) => {
            const sends = data.tiers?.[tier]?.sends || [];
            return sum + sends.reduce((s, send) => s + (send.messages?.length || 0), 0);
        }, 0)
        : 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Send Matrix Preview</h1>
                <p className="text-slate-500 text-sm">
                    View the full scheduled send plan for a threshold. Adjust community or date and apply to refine.
                </p>
            </div>

            {/* Parameter panel */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Threshold</label>
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            value={thresholdId}
                            onChange={(e) => setThresholdId(e.target.value)}
                        >
                            <option value="">Select threshold...</option>
                            {thresholds?.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Community</label>
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            value={communityId}
                            onChange={(e) => setCommunityId(e.target.value)}
                        >
                            <option value="">All communities (simulation)</option>
                            {communities?.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Forecast Date</label>
                        <input
                            type="date"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            value={forecastDate}
                            onChange={(e) => setForecastDate(e.target.value)}
                        />
                    </div>

                    <div className="flex items-end gap-2">
                        <button
                            onClick={handleApply}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                            Apply
                        </button>
                        {data && (
                            <button
                                onClick={handleReset}
                                className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all"
                                title="Clear results"
                            >
                                <RotateCcw size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                        <AlertTriangle size={16} />{error}
                    </div>
                )}
            </div>

            {loading && !data && (
                <div className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-purple-600" size={28} />
                </div>
            )}

            {data && (
                <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                    {/* Top meta bar */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3 bg-slate-50/50">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-slate-900 font-black text-lg">{data.threshold?.name}</h2>
                            <span className="px-2.5 py-0.5 rounded-full border border-purple-200 bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider">
                                Send Matrix
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                            <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-mono">
                                {data.threshold?.parameter}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-mono">
                                ≥ {data.threshold?.threshold_value}{data.threshold?.unit}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200">
                                forecast: {formatDatePart(data.forecast_date)}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200">
                                detection eve: {formatDatePart(data.alert_detection_date)}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200">
                                {totalMessages} messages total
                            </span>
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 border border-purple-100 text-purple-600 font-bold">
                                <MapPin size={11} />
                                {data.community?.name || 'All communities'}
                            </span>
                        </div>
                    </div>

                    {/* Status legend */}
                    <div className="px-6 py-2.5 border-b border-slate-100 flex items-center justify-end gap-4 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        {Object.entries(STATUS_META).map(([key, meta]) => (
                            <span key={key} className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                                {meta.label}
                            </span>
                        ))}
                    </div>

                    {/* Role legend */}
                    <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-5 flex-wrap">
                        {ROLE_ORDER.map((role) => {
                            const meta = ROLE_META[role];
                            return (
                                <span key={role} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                                    <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                                    {meta.label}
                                </span>
                            );
                        })}
                    </div>

                    {/* Tiers */}
                    <div className="p-6 bg-slate-50/30">
                        {TIER_ORDER.filter((tier) => data.tiers?.[tier]).map((tier) => (
                            <TierSection key={tier} tier={tier} tierData={data.tiers[tier]} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SendMatrix;