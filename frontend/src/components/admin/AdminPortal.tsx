import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Building2, 
  DollarSign, 
  Search, 
  CheckCircle, 
  PowerOff, 
  Activity,
  RefreshCw
} from 'lucide-react';

interface TenantItem {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'business';
  ownerEmail: string;
  memberCount: number;
  status: 'active' | 'suspended';
  createdDate: string;
}

export const AdminPortal: React.FC = () => {
  const [tenants, setTenants] = useState<TenantItem[]>([
    {
      id: 'tenant-1',
      name: 'Sprint Org',
      slug: 'sprint-org',
      plan: 'pro',
      ownerEmail: 'dev@taskflow.local',
      memberCount: 5,
      status: 'active',
      createdDate: '2026-11-18',
    },
    {
      id: 'tenant-2',
      name: 'Gantt Labs',
      slug: 'gantt-labs',
      plan: 'business',
      ownerEmail: 'ceo@ganttlabs.io',
      memberCount: 14,
      status: 'active',
      createdDate: '2026-11-17',
    },
    {
      id: 'tenant-3',
      name: 'Media Corp',
      slug: 'media-corp',
      plan: 'free',
      ownerEmail: 'lead@mediacorp.com',
      memberCount: 3,
      status: 'active',
      createdDate: '2026-11-16',
    },
    {
      id: 'tenant-4',
      name: 'Risk Advisory LLC',
      slug: 'risk-advisory',
      plan: 'free',
      ownerEmail: 'compliance@riskadv.net',
      memberCount: 2,
      status: 'suspended',
      createdDate: '2026-11-14',
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const toggleTenantStatus = (tenantId: string) => {
    setTenants(tenants.map(t => {
      if (t.id === tenantId) {
        const nextStatus = t.status === 'active' ? 'suspended' : 'active';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = tenants.filter(t => t.status === 'active').length;
  const suspendedCount = tenants.filter(t => t.status === 'suspended').length;

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      {/* Super Admin Top Operational Banner */}
      <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-amber-300 text-xs font-semibold">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>SUPER ADMIN CONTROL PLANE: Restricted to platform root operators. High-impact tenant actions take effect in real-time.</span>
        </div>
        <span className="font-mono text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-200">
          ROOT_ENV
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-red-500" />
            Global Platform Governance & Telemetry
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time cross-tenant telemetry, subscription analytics, and session revocation.
          </p>
        </div>

        <button 
          onClick={() => alert('Telemetry refreshed!')}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Metrics
        </button>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Total Tenants</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{tenants.length}</div>
          <span className="text-[11px] text-emerald-400">{activeCount} active, {suspendedCount} suspended</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Active Platform Users</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">24 Users</div>
          <span className="text-[11px] text-slate-500">Across 8 registered organizations</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Simulated MRR</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">$37.00 USD</div>
          <span className="text-[11px] text-slate-500">1 Pro, 1 Business tenant</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Socket.IO Gateway</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300 mt-2">Online</div>
          <span className="text-[11px] text-purple-400">JWT Handshake Auth Active</span>
        </div>
      </div>

      {/* Tenants Table Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by tenant name, slug, or owner..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="text-xs text-slate-400">
            Showing {filteredTenants.length} of {tenants.length} tenants
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Owner Email</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Members</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{t.name}</div>
                    <div className="text-[11px] font-mono text-slate-500">{t.slug}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{t.ownerEmail}</td>
                  <td className="py-3 px-4">
                    <span className="uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-indigo-300">
                      {t.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4">{t.memberCount} seats</td>
                  <td className="py-3 px-4">
                    {t.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-0.5 rounded text-[11px] font-semibold border border-red-500/20">
                        <PowerOff className="w-3 h-3" /> Suspended
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{t.createdDate}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toggleTenantStatus(t.id)}
                      className={`px-3 py-1 rounded text-[11px] font-semibold transition ${
                        t.status === 'active'
                          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {t.status === 'active' ? 'Suspend Tenant' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
