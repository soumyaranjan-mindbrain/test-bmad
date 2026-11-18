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
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Super Admin Top Operational Banner in Light Mode */}
      <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center justify-between text-amber-900 text-xs font-semibold shadow-2xs">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>SUPER ADMIN CONTROL PLANE: Restricted to platform root operators. High-impact tenant actions take effect in real-time.</span>
        </div>
        <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold border border-amber-200">
          ROOT_ENV
        </span>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>TaskFlow Platform</span>
            <span>/</span>
            <span className="text-red-600">Platform Governance</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-red-600" />
            Global Platform Governance & Telemetry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cross-tenant real-time telemetry, subscription MRR distribution, and session revocation.
          </p>
        </div>

        <button 
          onClick={() => alert('Telemetry metrics refreshed!')}
          className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition border border-slate-200 shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          Refresh Metrics
        </button>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Tenants</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{tenants.length}</div>
          <span className="text-[11px] text-emerald-600 font-medium">{activeCount} active, {suspendedCount} suspended</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Active Platform Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">24 Users</div>
          <span className="text-[11px] text-slate-500">Across 8 registered organizations</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Simulated MRR</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">$37.00 USD</div>
          <span className="text-[11px] text-slate-500">1 Pro, 1 Business tenant</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Socket.IO Gateway</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600 mt-2">Online</div>
          <span className="text-[11px] text-purple-600 font-medium">JWT Handshake Active</span>
        </div>
      </div>

      {/* Tenants Table Controls */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by tenant name, slug, or owner..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-red-500 focus:bg-white"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredTenants.length} of {tenants.length} tenants
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{t.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{t.slug}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{t.ownerEmail}</td>
                  <td className="py-3 px-4">
                    <span className="uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                      {t.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">{t.memberCount} seats</td>
                  <td className="py-3 px-4">
                    {t.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-red-200">
                        <PowerOff className="w-3 h-3" /> Suspended
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{t.createdDate}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toggleTenantStatus(t.id)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition ${
                        t.status === 'active'
                          ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
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
