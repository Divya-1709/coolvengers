import React, { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { AuditLog } from '../types/index.js';
import { api } from '../services/api.js';

export const AuditTrailView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getAuditLogs({
        search: search || undefined,
        entityType: entityFilter !== 'ALL' ? entityFilter : undefined,
      });
      setLogs(res.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, entityFilter]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-rose-700">
              SECURITY AUDIT &middot; COMPLIANCE LOGS
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">System Audit Trail</h2>
          <p className="text-xs text-slate-600 mt-1">
            Immutable log of all referral leads, service verifications, and manual payout transactions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search details, actor, ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-sky-500 w-64"
            />
          </div>

          <select
            value={entityFilter}
            onChange={e => setEntityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Entities</option>
            <option value="PAYOUT">Payout Transactions</option>
            <option value="REFERRAL">Referral Leads</option>
            <option value="USER">User / Account</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Total Logs: <strong className="text-slate-900 font-mono">{logs.length}</strong>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-[11px] font-semibold border-b border-slate-200">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Entity ID</th>
              <th className="py-3 px-4">Audit Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-900">{log.actorName}</div>
                  <div className="text-[10px] text-slate-500">{log.actorRole}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-mono text-sky-800 font-semibold text-[11px]">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-800">
                  {log.entityId}
                </td>
                <td className="py-3 px-4 text-slate-700 max-w-md">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
