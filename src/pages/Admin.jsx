import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = (url, options = {}) => axios({
  url: `${import.meta.env.VITE_API_URL}${url}`,
  withCredentials: true,
  ...options,
});

/* ── SVG Icons ───────────────────────────────────────────── */
const Icon = ({ name, className = 'w-4 h-4', style }) => {
  const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    kyc:       <><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4"/><path d="M14 4l6 6-3 3-6-6 3-3z"/><path d="M10 14l-3 3"/></>,
    users:     <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
    items:     <><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
    rentals:   <><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></>,
    transactions: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></>,
    reviews:   <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>,
    reports:   <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    refresh:   <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></>,
    menu:      <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    close:     <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    trash:     <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></>,
    check:     <><polyline points="20 6 9 17 4 12"/></>,
    x:         <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    star:      <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
    pin:       <><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>,
    shield:    <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    arrow_left:<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
    image:     <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
  };
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

/* ── Charts ──────────────────────────────────────────────── */
const LineChart = ({ data, color = '#10b981' }) => {
  if (!data || data.length < 2) return <div className="h-20 flex items-center justify-center text-gray-400 text-xs">No data</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 300, H = 80;
  const pts = data.map((d, i) => ({ x: (i / (data.length - 1)) * W, y: H - (d.value / max) * (H - 8) - 4 }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `${path} L ${W} ${H} L 0 ${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20">
      <defs>
        <linearGradient id={`lg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#lg-${color.replace('#','')})`}/>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="#1f2937" strokeWidth="1.5"/>)}
    </svg>
  );
};

const BarChart = ({ data, color = '#3b82f6' }) => {
  if (!data || data.length === 0) return <div className="h-20 flex items-center justify-center text-gray-400 text-xs">No data</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 300, H = 80, barW = Math.floor(W / data.length) - 4;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
        {data.map((d, i) => {
          const barH = Math.max((d.value / max) * (H - 4), d.value > 0 ? 6 : 0);
          const x = i * (W / data.length) + 2;
          return (
            <rect key={i} x={x} y={H - barH} width={barW} height={barH}
              fill={color} opacity={0.75} rx={3}/>
          );
        })}
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d, i) => <span key={i} className="text-xs text-gray-400" style={{ width: `${100/data.length}%`, textAlign: 'center', display: 'inline-block' }}>{d.label}</span>)}
      </div>
    </div>
  );
};

/* ── Badge ───────────────────────────────────────────────── */
const Badge = ({ children, variant = 'gray' }) => {
  const variants = {
    gray:   'bg-gray-800 text-gray-300',
    blue:   'bg-blue-900/60 text-blue-300',
    green:  'bg-green-900/50 text-green-400',
    red:    'bg-red-900/50 text-red-400',
    yellow: 'bg-yellow-900/40 text-yellow-400',
    orange: 'bg-orange-900/40 text-orange-400',
    purple: 'bg-purple-900/40 text-purple-400',
  };
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${variants[variant]}`}>{children}</span>;
};

const statusVariant = s => ({ PENDING:'yellow', ACTIVE:'green', COMPLETED:'blue', EXPIRED:'red', CANCELLED:'gray', RETURNING:'orange' }[s] || 'gray');

/* ── Main ────────────────────────────────────────────────── */
const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [collapsed, setCollapsed]   = useState(false);
  const [allData, setAllData]       = useState({ users:[], items:[], rentals:[], transactions:[], kycs:[], pendingReviews:[], reports:[] });
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState('');
  const [error, setError]           = useState('');

  useEffect(() => {
    if (user && user?.role?.toString().toUpperCase() !== 'ADMIN') navigate('/');
  }, [user]);
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [u, i, r, t, k, p, rep] = await Promise.all([
        API('/admin/users'), API('/admin/items'), API('/admin/rentals'),
        API('/admin/transactions'), API('/admin/kyc'), API('/admin/pending-reviews'), API('/admin/reports'),
      ]);
      setAllData({ users: u.data, items: i.data, rentals: r.data, transactions: t.data, kycs: k.data, pendingReviews: p.data, reports: rep.data });
    } catch { setError('Error loading data'); }
    finally { setLoading(false); }
  };

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };
  const showError   = (msg) => { setError(msg);   setTimeout(() => setError(''),   3000); };

  const handleVerifyKYC = async (id, status) => {
    try {
      await API(`/admin/verify/${id}`, { method: 'PATCH', data: { status } });
      setAllData(p => ({ ...p, kycs: p.kycs.map(k => k.id === id ? { ...k, verificationStatus: status } : k) }));
      showSuccess(`KYC ${status}`);
    } catch (e) { showError(e.response?.data?.message || 'Error'); }
  };

  const handleDeleteItem = async (id) => {
    try {
      await API(`/admin/items/${id}`, { method: 'DELETE' });
      setAllData(p => ({ ...p, items: p.items.filter(i => i.id !== id) }));
      showSuccess('Item deleted');
    } catch (e) { showError(e.response?.data?.message || 'Error'); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure? User permanently delete ho jayega!')) return;
    try {
      await API(`/admin/users/${userId}`, { method: 'DELETE' });
      setAllData(prev => ({ ...prev, users: prev.users.filter(u => u.id !== userId) }));
      showSuccess('User deleted');
    } catch { showError('Error deleting user'); }
  };

  const handleApprove = async (rentalId) => {
    try {
      await API('/admin/approve-rental', { method: 'POST', data: { rentalId } });
      setAllData(prev => ({ ...prev, pendingReviews: prev.pendingReviews.filter(r => r.id !== rentalId) }));
      showSuccess('Rental approved');
    } catch { showError('Error approving rental'); }
  };

  const handleResolveReport = async (reportId) => {
    try {
      await API(`/admin/reports/${reportId}`, { method: 'PATCH' });
      setAllData(prev => ({ ...prev, reports: prev.reports.map(r => r.id === reportId ? { ...r, status: 'RESOLVED' } : r) }));
      showSuccess('Report resolved');
    } catch { showError('Error resolving report'); }
  };

  const stats = {
    totalUsers:    allData.users.length,
    totalItems:    allData.items.length,
    totalRentals:  allData.rentals.length,
    activeRentals: allData.rentals.filter(r => r.status === 'ACTIVE').length,
    pendingKYC:    allData.kycs.filter(k => k.verificationStatus === 'PENDING').length,
    totalRevenue:  allData.transactions.reduce((s, t) => s + (t.rental?.totalAmount || 0), 0),
  };

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  const revenueChart = last7.map(date => ({
    label: new Date(date).toLocaleDateString('en-IN', { weekday: 'short' }),
    value: allData.transactions.filter(t => t.createdAt?.split('T')[0] === date).reduce((s, t) => s + (t.rental?.totalAmount || 0), 0),
  }));
  const rentalsChart = last7.map(date => ({
    label: new Date(date).toLocaleDateString('en-IN', { weekday: 'short' }),
    value: allData.rentals.filter(r => r.createdAt?.split('T')[0] === date).length,
  }));

  const menuItems = [
    { id: 'dashboard',    icon: 'dashboard',    label: 'Dashboard' },
    { id: 'kyc',          icon: 'kyc',          label: 'KYC',             badge: stats.pendingKYC },
    { id: 'users',        icon: 'users',        label: 'Users' },
    { id: 'items',        icon: 'items',        label: 'Items' },
    { id: 'rentals',      icon: 'rentals',      label: 'Rentals' },
    { id: 'transactions', icon: 'transactions', label: 'Transactions' },
    { id: 'reviews',      icon: 'reviews',      label: 'Pending Reviews', badge: allData.pendingReviews?.length },
    { id: 'reports',      icon: 'reports',      label: 'Reports',         badge: allData.reports?.filter(r => r.status === 'PENDING').length },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }

        .admin-sidebar { transition: width 0.3s cubic-bezier(.22,1,.36,1); }

        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 10px;
          cursor: pointer; border: none; background: transparent;
          width: 100%; text-align: left;
          color: #6b7280;
          transition: background 0.15s, color 0.15s;
          position: relative;
        }
        .nav-item:hover { background: rgba(255,255,255,0.06); color: #e5e7eb; }
        .nav-item.active { background: #2563eb; color: #fff; }

        .stat-card {
          background: #1a1f2e;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 18px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }

        .chart-card {
          background: #1a1f2e;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 20px;
        }

        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th {
          text-align: left; padding: 10px 14px;
          font-size: 0.7rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: #4b5563;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .data-table td { padding: 12px 14px; font-size: 0.85rem; color: #d1d5db; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .data-table tr:hover td { background: rgba(255,255,255,0.02); }
        .data-table tr:last-child td { border-bottom: none; }

        .table-wrap {
          background: #1a1f2e;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; overflow: hidden;
        }

        .btn-primary {
          padding: 9px 16px; background: #2563eb; color: #fff;
          border: none; border-radius: 10px; font-size: 0.82rem; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          transition: background 0.15s, transform 0.15s;
        }
        .btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); }

        .btn-green {
          padding: 8px 16px; background: #16a34a; color: #fff;
          border: none; border-radius: 10px; font-size: 0.8rem; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; gap: 5px;
          transition: background 0.15s;
          flex: 1; justify-content: center;
        }
        .btn-green:hover { background: #15803d; }

        .btn-red {
          padding: 8px 16px; background: #dc2626; color: #fff;
          border: none; border-radius: 10px; font-size: 0.8rem; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; gap: 5px;
          transition: background 0.15s;
          flex: 1; justify-content: center;
        }
        .btn-red:hover { background: #b91c1c; }

        .btn-icon-red {
          padding: 6px; background: rgba(239,68,68,0.1); color: #f87171;
          border: none; border-radius: 8px; cursor: pointer;
          transition: background 0.15s;
          display: flex; align-items: center;
        }
        .btn-icon-red:hover { background: rgba(239,68,68,0.2); }

        .kyc-card {
          background: #1a1f2e;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 20px;
        }

        .review-card {
          background: #1a1f2e;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 20px;
        }

        .item-card-admin {
          background: #1a1f2e;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .item-card-admin:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.35); }

        .toast-success {
          background: rgba(22,163,74,0.15); border: 1px solid rgba(22,163,74,0.3);
          color: #4ade80; border-radius: 12px; padding: 10px 14px;
          font-size: 0.85rem; display: flex; align-items: center; gap: 8px;
        }
        .toast-error {
          background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25);
          color: #f87171; border-radius: 12px; padding: 10px 14px;
          font-size: 0.85rem; display: flex; align-items: center; gap: 8px;
        }

        .info-box {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px; padding: 10px 14px;
        }

        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      <div className="flex h-screen pt-16 overflow-hidden" style={{ background: '#0f1117' }}>

        {/* ── Sidebar ── */}
        <aside
          className="admin-sidebar flex flex-col flex-shrink-0 scrollbar-thin"
          style={{ width: collapsed ? 64 : 220, background: '#13161f', borderRight: '1px solid rgba(255,255,255,0.05)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">RS</span>
                </div>
                <span className="text-white font-semibold text-sm">Admin</span>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors ml-auto"
            >
              <Icon name={collapsed ? 'menu' : 'close'} className="w-4 h-4" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto scrollbar-thin">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <Icon name={item.icon} className="w-4 h-4 flex-shrink-0" />
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">{item.label}</span>
                    {item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full leading-none ml-1">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </nav>

          {/* User */}
          {!collapsed && user && (
            <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-white text-xs font-medium truncate">{user?.name}</p>
                  <p className="text-xs" style={{ color: '#4b5563' }}>Administrator</p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 overflow-y-auto scrollbar-thin" style={{ background: '#0f1117' }}>
          <div className="p-6">

            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-lg font-bold text-white capitalize">{activeMenu}</h1>
                
              </div>
              <button onClick={fetchAll} className="btn-primary">
                <Icon name="refresh" className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            {/* Toasts */}
            {error   && <div className="toast-error mb-4"><Icon name="x" className="w-4 h-4 flex-shrink-0"/>{error}</div>}
            {success && <div className="toast-success mb-4"><Icon name="check" className="w-4 h-4 flex-shrink-0"/>{success}</div>}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin"/>
                <p className="text-xs text-gray-400">Loading data…</p>
              </div>
            ) : (
              <>
                {/* ── Dashboard ── */}
                {activeMenu === 'dashboard' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { label: 'Total Users',    value: stats.totalUsers,    icon: 'users',        color: '#60a5fa', bg: 'rgba(96,165,250,0.18)' },
                        { label: 'Total Items',    value: stats.totalItems,    icon: 'items',        color: '#34d399', bg: 'rgba(52,211,153,0.18)' },
                        { label: 'Total Rentals',  value: stats.totalRentals,  icon: 'rentals',      color: '#a78bfa', bg: 'rgba(167,139,250,0.18)' },
                        { label: 'Active Rentals', value: stats.activeRentals, icon: 'check',        color: '#fb923c', bg: 'rgba(251,146,60,0.18)' },
                        { label: 'Pending KYC',   value: stats.pendingKYC,    icon: 'kyc',          color: '#fbbf24', bg: 'rgba(251,191,36,0.18)' },
                        { label: 'Total Revenue',  value: `₹${stats.totalRevenue.toLocaleString()}`, icon: 'transactions', color: '#4ade80', bg: 'rgba(74,222,128,0.18)' },
                      ].map(s => (
                        <div key={s.label} className="stat-card">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
                            <Icon name={s.icon} className="w-4 h-4" style={{ color: s.color }} />
                          </div>
                          <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                          <p className="text-xs mt-1 text-gray-500">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="chart-card">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-white">Revenue — Last 7 Days</h3>
                          <Badge variant="green">₹</Badge>
                        </div>
                        <LineChart data={revenueChart} color="#10b981"/>
                        <div className="flex justify-between mt-1">
                          {revenueChart.map((d, i) => <span key={i} className="text-xs text-gray-600">{d.label}</span>)}
                        </div>
                      </div>
                      <div className="chart-card">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-white">Rentals — Last 7 Days</h3>
                          <Badge variant="blue">Count</Badge>
                        </div>
                        <BarChart data={rentalsChart} color="#3b82f6"/>
                      </div>
                    </div>

                    <div className="chart-card">
                      <h3 className="text-sm font-semibold text-white mb-4">Recent Rentals</h3>
                      <div className="space-y-3">
                        {allData.rentals.slice(0, 5).map(r => (
                          <div key={r.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {r.item?.images?.[0]
                                ? <img src={r.item.images[0]} className="w-9 h-9 rounded-xl object-cover"/>
                                : <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center"><Icon name="image" className="w-4 h-4 text-gray-600"/></div>
                              }
                              <div>
                                <p className="text-sm font-medium text-white">{r.item?.name}</p>
                                <p className="text-xs text-gray-500">{r.user?.name}</p>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                              <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                              <p className="text-xs text-gray-500">₹{r.totalAmount}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── KYC ── */}
                {activeMenu === 'kyc' && (
                  <div className="space-y-4">
                    {allData.kycs.length === 0
                      ? <div className="text-center py-16 text-gray-600 chart-card">No KYC submissions</div>
                      : allData.kycs.map(kyc => (
                        <div key={kyc.id} className="kyc-card">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-900/40 rounded-full flex items-center justify-center">
                                <span className="text-blue-400 font-bold text-sm">{kyc.user?.name?.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="font-semibold text-white text-sm">{kyc.user?.name}</p>
                                <p className="text-xs text-gray-500">{kyc.user?.email}</p>
                                <p className="text-xs text-gray-600 mt-0.5 capitalize">{kyc.documentType} • {kyc.documentNumber}</p>
                              </div>
                            </div>
                            <Badge variant={kyc.verificationStatus === 'VERIFIED' ? 'green' : kyc.verificationStatus === 'REJECTED' ? 'red' : 'yellow'}>
                              {kyc.verificationStatus}
                            </Badge>
                          </div>
                          <div className="flex gap-3 mb-4">
                            {kyc.documentImageUrl && (
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Document</p>
                                <img src={kyc.documentImageUrl} className="w-36 h-24 object-cover rounded-xl border border-white/10"/>
                              </div>
                            )}
                            {kyc.selfieUrl && (
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Selfie</p>
                                <img src={kyc.selfieUrl} className="w-36 h-24 object-cover rounded-xl border border-white/10"/>
                              </div>
                            )}
                          </div>
                          {kyc.verificationStatus === 'PENDING' && (
                            <div className="flex gap-2">
                              <button onClick={() => handleVerifyKYC(kyc.id, 'VERIFIED')} className="btn-green">
                                <Icon name="check" className="w-3.5 h-3.5"/> Verify
                              </button>
                              <button onClick={() => handleVerifyKYC(kyc.id, 'REJECTED')} className="btn-red">
                                <Icon name="x" className="w-3.5 h-3.5"/> Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    }
                  </div>
                )}

                {/* ── Users ── */}
                {activeMenu === 'users' && (
                  <div className="table-wrap">
                    <div className="overflow-x-auto">
                      <table className="data-table">
                        <thead>
                          <tr>{['Name','Email','Role','KYC','UPI','Joined',''].map(h => <th key={h}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {allData.users.map(u => (
                            <tr key={u.id}>
                              <td>
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 bg-blue-900/40 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-blue-400 font-medium">{u.name?.charAt(0)}</span>
                                  </div>
                                  <span className="font-medium text-white">{u.name}</span>
                                </div>
                              </td>
                              <td className="text-gray-500">{u.email}</td>
                              <td><Badge variant={u.role === 'ADMIN' ? 'purple' : 'gray'}>{u.role}</Badge></td>
                              <td><Badge variant={u.kycVerified ? 'green' : 'yellow'}>{u.kycVerified ? 'Verified' : 'Pending'}</Badge></td>
                              <td className="text-gray-500">{u.upiId || '—'}</td>
                              <td className="text-gray-500">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                              <td>
                                {u.role !== 'ADMIN' && (
                                  <button onClick={() => handleDeleteUser(u.id)} className="btn-icon-red">
                                    <Icon name="trash" className="w-3.5 h-3.5"/>
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── Items ── */}
                {activeMenu === 'items' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allData.items.map(item => (
                      <div key={item.id} className="item-card-admin">
                        <div className="relative h-40">
                          {item.images?.[0]
                            ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover"/>
                            : <div className="w-full h-full bg-gray-800 flex items-center justify-center"><Icon name="image" className="w-10 h-10 text-gray-700"/></div>
                          }

                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-white mb-1 truncate">{item.name}</h3>
                          <p className="text-xs text-gray-500 capitalize mb-3">{item.category} • {item.owner?.name}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-blue-400 font-bold text-sm">₹{item.pricePerDay}/day</span>
                            <button onClick={() => handleDeleteItem(item.id)} className="btn-icon-red">
                              <Icon name="trash" className="w-3.5 h-3.5"/>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Rentals ── */}
                {activeMenu === 'rentals' && (
                  <div className="table-wrap">
                    <div className="overflow-x-auto">
                      <table className="data-table">
                        <thead>
                          <tr>{['Item','Renter','Owner','Dates','Amount','Status','Transfer'].map(h => <th key={h}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {allData.rentals.map(r => (
                            <tr key={r.id}>
                              <td>
                                <div className="flex items-center gap-2">
                                  {r.item?.images?.[0]
                                    ? <img src={r.item.images[0]} className="w-8 h-8 rounded-lg object-cover"/>
                                    : <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center"><Icon name="image" className="w-3.5 h-3.5 text-gray-600"/></div>
                                  }
                                  <span className="text-white font-medium truncate max-w-24">{r.item?.name}</span>
                                </div>
                              </td>
                              <td className="text-gray-400">{r.user?.name}</td>
                              <td className="text-gray-400">{r.item?.owner?.name}</td>
                              <td className="text-gray-500 text-xs">{new Date(r.startDate).toLocaleDateString('en-IN')} → {new Date(r.endDate).toLocaleDateString('en-IN')}</td>
                              <td className="font-medium text-white">₹{r.totalAmount}</td>
                              <td><Badge variant={statusVariant(r.status)}>{r.status}</Badge></td>
                              <td>
                                <div className="info-box">
                                  <p className="text-xs text-gray-400">UPI: <span className="text-white font-medium">{r.item?.owner?.upiId || 'Not added'}</span></p>
                                  <p className="text-xs text-gray-400 mt-0.5">Pay: <span className="text-yellow-400 font-medium">₹{r.rentalAmount}</span></p>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── Transactions ── */}
                {activeMenu === 'transactions' && (
                  <div className="table-wrap">
                    <div className="overflow-x-auto">
                      <table className="data-table">
                        <thead>
                          <tr>{['User','Item','Amount','Type','Status','Date'].map(h => <th key={h}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {allData.transactions.map(t => (
                            <tr key={t.id}>
                              <td className="text-white">{t.user?.name}</td>
                              <td className="text-gray-400">{t.rental?.item?.name}</td>
                              <td className="font-medium text-white">₹{t.rental?.totalAmount}</td>
                              <td><Badge variant="blue">{t.type}</Badge></td>
                              <td><Badge variant={t.status === 'SUCCESS' ? 'green' : t.status === 'FAILED' ? 'red' : 'yellow'}>{t.status}</Badge></td>
                              <td className="text-gray-500">{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── Pending Reviews ── */}
                {activeMenu === 'reviews' && (
                  <div className="space-y-4">
                    {allData.pendingReviews?.length === 0
                      ? <div className="text-center py-16 text-gray-600 chart-card">No pending reviews</div>
                      : allData.pendingReviews?.map(rental => (
                        <div key={rental.id} className="review-card">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {rental.item?.images?.[0]
                                ? <img src={rental.item.images[0]} className="w-12 h-12 object-cover rounded-xl"/>
                                : <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center"><Icon name="image" className="w-5 h-5 text-gray-600"/></div>
                              }
                              <div>
                                <p className="font-semibold text-white">{rental.item?.name}</p>
                                <p className="text-sm text-gray-500">Renter: {rental.user?.name}</p>
                              </div>
                            </div>
                            <Badge variant={rental.isDamaged ? 'red' : 'green'}>
                              {rental.isDamaged ? 'Damage Report' : 'Complete Request'}
                            </Badge>
                          </div>

                          {rental.isDamaged && (
                            <div className="p-3 rounded-xl mb-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                              <p className="text-xs font-semibold text-red-400 mb-1">Damage Report</p>
                              <p className="text-sm text-red-300">{rental.damageReport}</p>
                              {rental.damageAmount && <p className="text-sm font-medium text-red-400 mt-1">Amount: ₹{rental.damageAmount}</p>}
                            </div>
                          )}

                          {rental.damageProofUrls?.length > 0 && (
                            <div className="flex gap-2 mb-3">
                              {rental.damageProofUrls.map((url, i) => (
                                <img key={i} src={url} className="w-20 h-20 object-cover rounded-xl border border-white/10"/>
                              ))}
                            </div>
                          )}

                          <div className="info-box mb-4">
                            <p className="text-sm text-gray-400">Deposit: <span className="text-white font-medium">₹{rental.depositAmount}</span></p>
                            {rental.extraDays > 0 && (
                              <p className="text-sm text-orange-400 mt-1">Late Return: {rental.extraDays} days → -₹{rental.extraCharge}</p>
                            )}
                            {!rental.isDamaged && (
                              <p className="text-sm text-green-400 mt-1">Refund: ₹{rental.depositAmount - (rental.extraCharge || 0)}</p>
                            )}
                            {rental.isDamaged && rental.damageAmount > 0 && (
                              <p className="text-sm text-yellow-400 mt-1">Partial Refund: ₹{rental.depositAmount - rental.damageAmount - (rental.extraCharge || 0)}</p>
                            )}
                            {rental.isDamaged && !rental.damageAmount && (
                              <p className="text-sm text-red-400 mt-1">No Refund</p>
                            )}
                          </div>

                          <button onClick={() => handleApprove(rental.id)} className="btn-primary w-full justify-center">
                            <Icon name="check" className="w-4 h-4"/> Approve & Process Refund
                          </button>
                        </div>
                      ))
                    }
                  </div>
                )}

                {/* ── Reports ── */}
                {activeMenu === 'reports' && (
                  <div className="table-wrap">
                    {allData.reports?.length === 0
                      ? <div className="text-center py-16 text-gray-600">No reports</div>
                      : (
                        <div className="overflow-x-auto">
                          <table className="data-table">
                            <thead>
                              <tr>{['User','Email','Type','Description','Status','Date','Action'].map(h => <th key={h}>{h}</th>)}</tr>
                            </thead>
                            <tbody>
                              {allData.reports?.map(r => (
                                <tr key={r.id}>
                                  <td className="text-white">{r.user?.name}</td>
                                  <td className="text-gray-500">{r.user?.email}</td>
                                  <td><Badge variant="red">{r.type}</Badge></td>
                                  <td className="text-gray-400 max-w-xs"><p className="truncate">{r.description}</p></td>
                                  <td><Badge variant={r.status === 'RESOLVED' ? 'green' : 'yellow'}>{r.status}</Badge></td>
                                  <td className="text-gray-500">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                                  <td>
                                    {r.status === 'PENDING' && (
                                      <button onClick={() => handleResolveReport(r.id)} className="btn-green" style={{ flex: 'none', padding: '5px 12px' }}>
                                        <Icon name="check" className="w-3 h-3"/> Resolve
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    }
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Admin;