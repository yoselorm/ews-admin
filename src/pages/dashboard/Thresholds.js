import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchThresholds, createThreshold, updateThreshold, deleteThreshold, resetThresholdStatus
} from '../../redux/ThresholdSlice';
import {
  Plus, AlertTriangle, Trash2, Edit3,
  CheckCircle, XCircle, Loader2, X, ShieldAlert
} from 'lucide-react';
import Pagination from '../../components/Pagination';

// ─── Constants ─────────────────────────────────────────────────────────────────
const PARAMETERS = [
  { value: 'temperature_2m',       label: 'Temperature (2m)' },
  { value: 'apparent_temperature', label: 'Apparent Temperature' },
  { value: 'relative_humidity_2m', label: 'Relative Humidity (2m)' },
  { value: 'precipitation',        label: 'Precipitation' },
  { value: 'rain',                 label: 'Rain' },
  { value: 'wind_speed_10m',       label: 'Wind Speed (10m)' },
  { value: 'wind_gusts_10m',       label: 'Wind Gusts (10m)' },
  { value: 'uv_index',             label: 'UV Index' },
  { value: 'heat_index',           label: 'Heat Index' },
  { value: 'weather_code',         label: 'Weather Code' },
];

const DEFAULT_FORM = {
  name: '',
  parameter: 'temperature_2m',
  operator: 'gte',
  threshold_value: '',
  unit: '°C',
  risk_level: 'critical',
  gestational_age_min_weeks: 0,
  gestational_age_max_weeks: 0,
  description: '',
  is_active: true,
};

const getRiskBadge = (level) => {
  const styles = {
    critical: 'bg-red-50 text-red-600 border-red-100',
    high:     'bg-orange-50 text-orange-600 border-orange-100',
    moderate: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    low:      'bg-blue-50 text-blue-600 border-blue-100',
  };
  return `px-3 py-1 rounded-full text-xs font-bold border ${styles[level] || styles.low}`;
};

// ─── Shared Form Body ──────────────────────────────────────────────────────────
const ThresholdFormBody = ({ formData, setFormData, error }) => (
  <div className="p-6 space-y-4">
    {error && (
      <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
        <AlertTriangle size={16} />{error}
      </div>
    )}

    <div className="grid grid-cols-2 gap-4">
      {/* Name */}
      <div className="col-span-2">
        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Threshold Name</label>
        <input
          required
          value={formData.name}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          placeholder="e.g. Extreme Heat"
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      {/* Parameter */}
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Parameter</label>
        <select
          value={formData.parameter}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          onChange={(e) => setFormData({ ...formData, parameter: e.target.value })}
        >
          {PARAMETERS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Risk Level */}
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Risk Level</label>
        <select
          value={formData.risk_level}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
        >
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="moderate">Moderate</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Operator */}
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Operator</label>
        <select
          value={formData.operator}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
        >
          <option value="gte">Greater than or equal (≥)</option>
          <option value="lte">Less than or equal (≤)</option>
          <option value="gt">Greater than (&gt;)</option>
          <option value="lt">Less than (&lt;)</option>
        </select>
      </div>

      {/* Value + Unit */}
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Value & Unit</label>
        <div className="flex gap-2">
          <input
            type="number"
            required
            value={formData.threshold_value}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            placeholder="35"
            onChange={(e) => setFormData({ ...formData, threshold_value: Number(e.target.value) })}
          />
          <input
            value={formData.unit}
            className="w-20 text-center bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-500 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            placeholder="°C"
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Status</label>
        <select
          value={formData.is_active ? 'true' : 'false'}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Gestational Age Range */}
      <div className="col-span-2">
        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Gestational Age Range (weeks)</label>
        <div className="flex gap-2 items-center">
          <input
            type="number" min="0"
            value={formData.gestational_age_min_weeks}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            placeholder="Min"
            onChange={(e) => setFormData({ ...formData, gestational_age_min_weeks: Number(e.target.value) })}
          />
          <span className="text-slate-400 font-bold shrink-0">to</span>
          <input
            type="number" min="0"
            value={formData.gestational_age_max_weeks}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            placeholder="Max"
            onChange={(e) => setFormData({ ...formData, gestational_age_max_weeks: Number(e.target.value) })}
          />
        </div>
      </div>
    </div>

    {/* Description */}
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Description</label>
      <textarea
        rows="2"
        value={formData.description}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
        placeholder="What should happen when this triggers?"
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
    </div>
  </div>
);

// ─── Modal Shell (portal) ──────────────────────────────────────────────────────
const ModalShell = ({ title, onClose, children }) => createPortal(
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}
    onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <style>{`@keyframes mIn{from{opacity:0;transform:scale(.95) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}.m-card{animation:mIn .2s ease-out}`}</style>
    <div className="m-card bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-all">
          <X size={24} />
        </button>
      </div>
      <div className="overflow-y-auto">{children}</div>
    </div>
  </div>,
  document.body
);

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────
const DeleteModal = ({ item, onConfirm, onCancel, actionLoading }) => createPortal(
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}
    onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
  >
    <style>{`@keyframes mIn{from{opacity:0;transform:scale(.95) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}.m-card{animation:mIn .2s ease-out}`}</style>
    <div className="m-card bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
      <div className="p-8 flex flex-col items-center text-center gap-4">
        <div className="p-4 bg-red-50 rounded-2xl text-red-500">
          <ShieldAlert size={32} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Delete Threshold</h3>
          <p className="text-slate-500 text-sm mt-1">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-slate-700">"{item?.name}"</span>?
            This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 w-full pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={actionLoading}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
          >
            {actionLoading ? <Loader2 className="animate-spin" size={18} /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  </div>,
  document.body
);

// ─── Main Component ────────────────────────────────────────────────────────────
const Thresholds = () => {
  const dispatch = useDispatch();
  const { list, loading, actionLoading, success, error, meta } = useSelector((state) => state.thresholds);

  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'delete'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchThresholds({ sort: '-created_at', page: 1 }));
  }, [dispatch]);

  // Close modal & reset on success
  useEffect(() => {
    if (success) {
      setModal(null);
      setSelectedItem(null);
      setFormData(DEFAULT_FORM);
      dispatch(resetThresholdStatus());
    }
  }, [success, dispatch]);

  const closeModal = () => {
    setModal(null);
    setSelectedItem(null);
    setFormData(DEFAULT_FORM);
    dispatch(resetThresholdStatus());
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      parameter: item.parameter,
      operator: item.operator,
      threshold_value: item.threshold_value,
      unit: item.unit,
      risk_level: item.risk_level,
      gestational_age_min_weeks: item.gestational_age_min_weeks ?? 0,
      gestational_age_max_weeks: item.gestational_age_max_weeks ?? 0,
      description: item.description || '',
      is_active: item.is_active,
    });
    setModal('edit');
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    dispatch(fetchThresholds({ sort: '-created_at', page: newPage }));
  };

  const FooterButtons = ({ onSubmit, submitLabel }) => (
    <div className="px-6 pb-6 flex gap-3">
      <button
        type="button"
        onClick={closeModal}
        className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={actionLoading}
        className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
      >
        {actionLoading ? <Loader2 className="animate-spin" size={20} /> : submitLabel}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Weather Thresholds</h1>
          <p className="text-slate-500 text-sm">Define environmental limits that trigger health alerts.</p>
        </div>
        <button
          onClick={() => { setFormData(DEFAULT_FORM); setModal('add'); }}
          className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
        >
          <Plus size={20} />
          Add Threshold
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Threshold Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Condition</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Risk Level</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-16">
                  <Loader2 className="animate-spin mx-auto text-purple-500" size={28} />
                </td>
              </tr>
            ) : list?.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-16 text-slate-400 text-sm">
                  No thresholds found. Add one to get started.
                </td>
              </tr>
            ) : list?.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-700 block">{item.name}</span>
                  <span className="text-xs text-slate-400">{item.description || 'No description'}</span>
                </td>
                <td className="px-6 py-4">
                  <code className="bg-slate-100 px-2 py-1 rounded text-purple-600 text-xs font-mono">
                    {item.parameter} {item.operator} {item.threshold_value}{item.unit}
                  </code>
                </td>
                <td className="px-6 py-4">
                  <span className={getRiskBadge(item.risk_level)}>{item.risk_level}</span>
                </td>
                <td className="px-6 py-4">
                  {item.is_active ? (
                    <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                      <CheckCircle size={14} /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400 text-sm font-medium">
                      <XCircle size={14} /> Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-1">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => { setSelectedItem(item); setModal('delete'); }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
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

      {/* Add Modal */}
      {modal === 'add' && (
        <ModalShell title="New Weather Threshold" onClose={closeModal}>
          <ThresholdFormBody formData={formData} setFormData={setFormData} error={error} />
          <FooterButtons
            onSubmit={() => dispatch(createThreshold(formData))}
            submitLabel="Save Threshold"
          />
        </ModalShell>
      )}

      {/* Edit Modal */}
      {modal === 'edit' && (
        <ModalShell title="Edit Threshold" onClose={closeModal}>
          <ThresholdFormBody formData={formData} setFormData={setFormData} error={error} />
          <FooterButtons
            onSubmit={() => dispatch(updateThreshold({ id: selectedItem.id, data: formData }))}
            submitLabel="Update Threshold"
          />
        </ModalShell>
      )}

      {/* Delete Confirm */}
      {modal === 'delete' && (
        <DeleteModal
          item={selectedItem}
          onConfirm={() => dispatch(deleteThreshold(selectedItem.id))}
          onCancel={closeModal}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default Thresholds;