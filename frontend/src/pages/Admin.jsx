import { useEffect, useState } from 'react';
import { Trash2, Ban, CheckCircle, Loader2, ShieldAlert } from 'lucide-react';
import adminService from '../api/adminService';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/common/ConfirmModal';

const Admin = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null); // { type: 'delete'|'block'|'unblock', user }

  useEffect(() => {
    adminService
      .getUsers()
      .then(setUsers)
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));
  }, []);

  const executeBlock = async (u) => {
    setActionLoading(u.id);
    try {
      const updated = await (u.is_active
        ? adminService.blockUser(u.id)
        : adminService.unblockUser(u.id));
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
    } catch {
      setError('Action failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const executeDelete = async (id) => {
    setActionLoading(id);
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setError('Delete failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirm = () => {
    if (!confirm) return;
    if (confirm.type === 'delete') executeDelete(confirm.user.id);
    else executeBlock(confirm.user);
    setConfirm(null);
  };

  const confirmConfig = confirm && {
    delete: {
      title: 'Delete user?',
      message: `"${confirm.user.username}" will be permanently removed.`,
      confirmText: 'Delete',
      variant: 'danger',
    },
    block: {
      title: 'Block user?',
      message: `"${confirm.user.username}" won't be able to log in.`,
      confirmText: 'Block',
      variant: 'danger',
    },
    unblock: {
      title: 'Unblock user?',
      message: `"${confirm.user.username}" will regain access to their account.`,
      confirmText: 'Unblock',
      variant: 'primary',
    },
  }[confirm.type];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={20} className="animate-spin text-[#7C6BEF]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-14 pb-12 px-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg bg-[#2A2A3A] flex items-center justify-center">
          <ShieldAlert size={18} className="text-[#7C6BEF]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#E8E8EF] tracking-tight">
            Admin Panel
          </h1>
          <p className="text-[11px] text-[#6B7280]">Manage users</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-[12px] text-red-400">
          {error}
        </div>
      )}

      {/* Users table */}
      <div className="bg-[#252533] border border-[#2A2A3A] rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_1fr_80px_100px] gap-4 px-5 py-3 border-b border-[#2A2A3A]">
          <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">
            User
          </span>
          <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">
            Email
          </span>
          <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">
            Status
          </span>
          <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider text-right">
            Actions
          </span>
        </div>

        {users.length === 0 ? (
          <div className="px-5 py-10 text-center text-[12px] text-[#4B5563]">
            No users found.
          </div>
        ) : (
          users.map((u) => {
            const isSelf = u.id === currentUser?.id;
            const busy = actionLoading === u.id;

            return (
              <div
                key={u.id}
                className="grid grid-cols-[1fr_1fr_80px_100px] gap-4 items-center px-5 py-3.5 border-b border-[#2A2A3A]/50 last:border-0 hover:bg-[#2A2A3A]/30 transition-colors"
              >
                {/* Username + role badge */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#2A2A3A] flex items-center justify-center text-[10px] font-bold text-[#E8E8EF] flex-shrink-0">
                    {u.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[13px] font-medium text-[#E8E8EF] truncate block">
                      {u.username}
                    </span>
                    {u.role === 'admin' && (
                      <span className="text-[9px] font-bold text-[#7C6BEF] uppercase tracking-wider">
                        admin
                      </span>
                    )}
                  </div>
                </div>

                {/* Email */}
                <span className="text-[12px] text-[#8B8B9A] truncate">
                  {u.email}
                </span>

                {/* Status */}
                <span
                  className={`text-[10px] font-semibold ${
                    u.is_active ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {u.is_active ? 'Active' : 'Blocked'}
                </span>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5">
                  {busy ? (
                    <Loader2 size={14} className="animate-spin text-[#4B5563]" />
                  ) : (
                    !isSelf && (
                      <>
                        <button
                          onClick={() =>
                            setConfirm({
                              type: u.is_active ? 'block' : 'unblock',
                              user: u,
                            })
                          }
                          title={u.is_active ? 'Block user' : 'Unblock user'}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-amber-400 hover:bg-amber-400/10 transition-all"
                        >
                          {u.is_active ? <Ban size={14} /> : <CheckCircle size={14} />}
                        </button>
                        <button
                          onClick={() => setConfirm({ type: 'delete', user: u })}
                          title="Delete user"
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation modal */}
      {confirm && confirmConfig && (
        <ConfirmModal
          isOpen
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          variant={confirmConfig.variant}
          onConfirm={handleConfirm}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
};

export default Admin;
