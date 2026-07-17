import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldCheck, XCircle, MoreVertical } from 'lucide-react';
import { supabase } from '../../services/firebase';
import { ExportButtons, exportToCSV, exportToPDF } from './AdminExport';

export const AdminUserManagement = ({ onUserSelect }: { onUserSelect: (id: string) => void }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let userData = [];
      const { data: rpcData, error: rpcError } = await supabase.rpc('admin_get_all_users');
      
      if (!rpcError && rpcData) {
        userData = rpcData;
      } else {
        const { data: profileData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        userData = profileData || [];
      }
      
      const { data: bookings } = await supabase.from('movie_bookings').select('user_id, amount, status, quantity');
      const { data: scripts } = await supabase.from('projects').select('directorId');
      
      if (userData) {
        const enhancedUsers = userData.map(u => {
          const userBookings = bookings?.filter(b => b.user_id === u.id && (b.status || '').toUpperCase() === 'CONFIRMED') || [];
          const totalPaid = userBookings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
          const ticketsCount = userBookings.reduce((sum, b) => sum + (Number(b.quantity) || 1), 0);
          const scriptsCount = scripts?.filter(s => s.directorId === u.id).length || 0;
          
          return {
            ...u,
            totalPaid,
            paymentsCount: userBookings.length,
            ticketsCount,
            scriptsCount
          };
        });
        setUsers(enhancedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const data = users.map(u => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Phone: u.phone,
      Role: u.role,
      Status: u.is_suspended ? 'Suspended' : 'Active',
      Approval: u.kycStatus,
      TotalPaid: u.totalPaid,
      Tickets: u.ticketsCount,
      Scripts: u.scriptsCount,
      LastLogin: u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : 'Never',
      Registered: new Date(u.created_at).toLocaleString()
    }));
    exportToCSV(data, 'BFI_Users_Export');
  };

  const handleExportPDF = () => {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Total Paid', 'Tickets', 'Scripts', 'Last Login'];
    const rows = users.map(u => [
      u.name || 'N/A',
      u.email || 'N/A',
      u.role || 'USER',
      u.is_suspended ? 'Suspended' : 'Active',
      `Rs ${u.totalPaid}`,
      u.ticketsCount.toString(),
      u.scriptsCount.toString(),
      u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : 'Never'
    ]);
    exportToPDF('BFI User Directory', headers, rows);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white">User Management</h2>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 w-full sm:w-64"
            />
          </div>
          
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
          >
            <option value="ALL">All Roles</option>
            <option value="INVESTOR">Investors</option>
            <option value="DIRECTOR">Directors</option>
            <option value="PRODUCER">Producers</option>
            <option value="WRITER">Writers</option>
            <option value="USER">Regular Users</option>
          </select>

          <ExportButtons onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-zinc-300">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Role & Status</th>
              <th className="px-4 py-3">Financials</th>
              <th className="px-4 py-3">Activity</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8">Loading users...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8">No users found</td></tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.name || 'Unknown User'}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{user.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{user.email}</div>
                    <div className="text-xs">{user.phone || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-white">
                        {user.role || 'USER'}
                      </span>
                      {user.kycStatus === 'VERIFIED' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-1">
                          <ShieldCheck size={10} /> Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
                          Pending
                        </span>
                      )}
                      {user.is_suspended && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1">
                          <XCircle size={10} /> Suspended
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">₹{user.totalPaid?.toLocaleString() || 0}</div>
                    <div className="text-xs text-zinc-500">{user.paymentsCount || 0} payments</div>
                    <div className="text-xs text-zinc-500">{user.ticketsCount || 0} tickets</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div><span className="text-zinc-500">Reg:</span> {new Date(user.created_at).toLocaleDateString()}</div>
                    <div><span className="text-zinc-500">Login:</span> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}</div>
                    {user.scriptsCount > 0 && <div className="mt-1 text-yellow-500">{user.scriptsCount} scripts</div>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => onUserSelect(user.id)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs transition-colors"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
