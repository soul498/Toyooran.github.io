import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Check, KeyRound, Pencil, Plus, Trash2, Users, X } from '../../icons';
import { ADMIN_SECTIONS, type AdminRole, type AdminSection, type ManagedAdminUser } from '../../types';

const SECTION_LABELS: Record<AdminSection, string> = {
  overview: 'داشبورد',
  products: 'محصولات',
  projects: 'پروژه‌ها',
  services: 'خدمات',
  articles: 'مجله و مقالات',
  categories: 'دسته‌بندی‌ها',
  company: 'اطلاعات شرکت و فوتر',
  hero: 'هیرو و بنر',
  layout: 'هدر، فوتر و نمایش سکشن‌ها',
  pages: 'محتوای صفحات ثابت',
  media: 'رسانه‌ها',
  quotes: 'استعلام قیمت',
  consultations: 'فرم‌های تماس',
  customers: 'مخاطبین و مشتریان',
  ai: 'دستیار هوش مصنوعی',
  backup: 'بکاپ',
  security: 'امنیت شخصی',
  users: 'مدیریت نقش و کاربران',
};

type Notice = { kind: 'success' | 'error'; text: string } | null;

async function csrfToken(): Promise<string> {
  const response = await fetch('/api/auth/csrf', { credentials: 'include' });
  const data = await response.json().catch(() => ({}));
  return String(data.token || '');
}

async function adminRequest(url: string, init: RequestInit = {}) {
  const mutating = !['GET', 'HEAD'].includes((init.method || 'GET').toUpperCase());
  const headers: Record<string, string> = { ...(init.headers as Record<string, string> || {}) };
  if (mutating) headers['X-CSRF-Token'] = await csrfToken();
  return fetch(url, { ...init, credentials: 'include', headers });
}

const emptyRole = () => ({ name: '', permissions: [] as AdminSection[] });
const emptyUser = (roleId = '') => ({ username: '', displayName: '', password: '', roleId, isActive: true });

export const UsersTab: React.FC = () => {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [users, setUsers] = useState<ManagedAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);
  const [userError, setUserError] = useState('');
  const [savingUser, setSavingUser] = useState(false);
  const [roleDraft, setRoleDraft] = useState(emptyRole);
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null);
  const [userDraft, setUserDraft] = useState(emptyUser);
  const [editingUser, setEditingUser] = useState<ManagedAdminUser | null>(null);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);

  const customPermissionSections = useMemo(() => ADMIN_SECTIONS.filter((section) => section !== 'users'), []);

  const refresh = async () => {
    setLoading(true);
    try {
      const [rolesResponse, usersResponse] = await Promise.all([
        adminRequest('/api/admin/roles'),
        adminRequest('/api/admin/users'),
      ]);
      const rolesData = await rolesResponse.json().catch(() => ({}));
      const usersData = await usersResponse.json().catch(() => ({}));
      if (!rolesResponse.ok || !usersResponse.ok) throw new Error(rolesData.error || usersData.error || 'خواندن داده‌های کاربران ناموفق بود.');
      setRoles(Array.isArray(rolesData.roles) ? rolesData.roles : []);
      setUsers(Array.isArray(usersData.users) ? usersData.users : []);
    } catch (error: any) {
      setNotice({ kind: 'error', text: error?.message || 'ارتباط با سرور برقرار نشد.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const togglePermission = (section: AdminSection) => {
    setRoleDraft((previous) => ({
      ...previous,
      permissions: previous.permissions.includes(section)
        ? previous.permissions.filter((item) => item !== section)
        : [...previous.permissions, section],
    }));
  };

  const openNewRole = () => {
    setEditingRole(null);
    setRoleDraft(emptyRole());
    setShowRoleForm(true);
  };

  const openRoleEdit = (role: AdminRole) => {
    setEditingRole(role);
    setRoleDraft({ name: role.name, permissions: role.permissions });
    setShowRoleForm(true);
  };

  const saveRole = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);
    const response = await adminRequest(editingRole ? `/api/admin/roles/${editingRole.id}` : '/api/admin/roles', {
      method: editingRole ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roleDraft),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return setNotice({ kind: 'error', text: result.error || 'ذخیره نقش ناموفق بود.' });
    setNotice({ kind: 'success', text: editingRole ? 'نقش به‌روزرسانی شد.' : 'نقش جدید ساخته شد.' });
    setShowRoleForm(false);
    setEditingRole(null);
    await refresh();
  };

  const removeRole = async (role: AdminRole) => {
    if (!window.confirm(`نقش «${role.name}» حذف شود؟`)) return;
    const response = await adminRequest(`/api/admin/roles/${role.id}`, { method: 'DELETE' });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      return setNotice({ kind: 'error', text: result.error || 'حذف نقش ناموفق بود.' });
    }
    setNotice({ kind: 'success', text: 'نقش حذف شد.' });
    await refresh();
  };

  const openNewUser = () => {
    setUserError('');
    setEditingUser(null);
    setUserDraft(emptyUser());
    setShowUserForm(true);
  };

  const openUserEdit = (user: ManagedAdminUser) => {
    setUserError('');
    setEditingUser(user);
    setUserDraft({ username: user.username, displayName: user.displayName, password: '', roleId: user.roleId, isActive: user.isActive });
    setShowUserForm(true);
  };

  const saveUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);
    setUserError('');
    if (!roles.length) return setUserError('نقش‌ها بارگذاری نشده‌اند. روی «بارگذاری دوباره» بزنید.');
    if (!editingUser && !/^[A-Za-z0-9._-]{3,80}$/.test(userDraft.username.trim())) return setUserError('نام کاربری باید حداقل ۳ نویسه و فقط شامل حروف انگلیسی، عدد، نقطه، خط تیره یا زیرخط باشد.');
    if (userDraft.displayName.trim().length < 2) return setUserError('نام و سمت نمایشی را وارد کنید.');
    if (!userDraft.roleId) return setUserError('نقش کاربر را انتخاب کنید.');
    if ((!editingUser || userDraft.password) && userDraft.password.length < 16) return setUserError('رمز عبور باید حداقل ۱۶ نویسه باشد.');
    const payload = {
      displayName: userDraft.displayName,
      roleId: userDraft.roleId,
      isActive: userDraft.isActive,
      ...(editingUser ? (userDraft.password ? { password: userDraft.password } : {}) : { username: userDraft.username, password: userDraft.password }),
    };
    setSavingUser(true);
    try {
      const response = await adminRequest(editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users', {
        method: editingUser ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) return setUserError(result.error || 'ذخیره کاربر ناموفق بود.');
      if (result.user) setUsers((previous) => editingUser ? previous.map((user) => user.id === result.user.id ? result.user : user) : [...previous, result.user]);
      setNotice({ kind: 'success', text: editingUser ? 'کاربر به‌روزرسانی شد.' : 'کاربر جدید ساخته شد.' });
      setShowUserForm(false);
      setEditingUser(null);
    } catch {
      setUserError('ارتباط با سرور برقرار نشد. دوباره تلاش کنید.');
    } finally {
      setSavingUser(false);
    }
  };

  const removeUser = async (user: ManagedAdminUser) => {
    if (!window.confirm(`حساب «${user.displayName}» حذف شود؟`)) return;
    const response = await adminRequest(`/api/admin/users/${user.id}`, { method: 'DELETE' });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      return setNotice({ kind: 'error', text: result.error || 'حذف کاربر ناموفق بود.' });
    }
    setNotice({ kind: 'success', text: 'کاربر حذف شد.' });
    await refresh();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            نقش‌ها و کاربران ادمین
          </h2>
          <p className="text-xs text-slate-400 mt-1">برای هر نقش نام دلخواه و دسترسی بخش‌به‌بخش تعیین کنید. هر دسترسی، همهٔ عملیات همان بخش را مجاز می‌کند.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={openNewRole} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-amber-400" /> نقش جدید
          </button>
          <button type="button" onClick={openNewUser} className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black inline-flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> کاربر جدید
          </button>
        </div>
      </header>

      {notice && (
        <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 border ${notice.kind === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-rose-500/10 border-rose-500/30 text-rose-200'}`}>
          {notice.kind === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notice.text}
        </div>
      )}
      {!loading && !roles.length && <button type="button" onClick={() => void refresh()} className="rounded-xl border border-amber-400/40 px-4 py-2 text-xs text-amber-200">بارگذاری دوبارهٔ نقش‌ها و کاربران</button>}

      <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-black text-white">نقش‌ها</h3>
          <span className="text-[11px] text-slate-500">{roles.length.toLocaleString('fa-IR')} نقش</span>
        </div>
        <div className="divide-y divide-slate-800">
          {loading && <p className="p-5 text-xs text-slate-500">در حال بارگذاری…</p>}
          {!loading && roles.map((role) => (
            <div key={role.id} className="p-4 flex flex-col md:flex-row gap-3 md:items-center justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm text-white">{role.name}</strong>
                  {role.isSuperadmin && <span className="text-[10px] rounded-full px-2 py-0.5 bg-amber-400/15 border border-amber-400/30 text-amber-200">مدیرکل</span>}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">{role.isSuperadmin ? 'دسترسی کامل به همه بخش‌ها' : role.permissions.map((item) => SECTION_LABELS[item]).join('، ') || 'بدون دسترسی'}</p>
              </div>
              <div className="flex gap-2 self-end md:self-auto">
                <button type="button" onClick={() => openRoleEdit(role)} className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700" aria-label="ویرایش نقش"><Pencil className="w-4 h-4" /></button>
                {!role.isSystem && <button type="button" onClick={() => void removeRole(role)} className="p-2 rounded-xl bg-rose-950/40 text-rose-300 hover:bg-rose-900/60" aria-label="حذف نقش"><Trash2 className="w-4 h-4" /></button>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-black text-white">کاربران</h3>
          <button type="button" onClick={openNewUser} className="rounded-xl bg-amber-400 px-3 py-2 text-xs font-black text-slate-950 inline-flex items-center gap-1"><Plus className="h-4 w-4" />افزودن کاربر</button>
          <span className="text-[11px] text-slate-500">{users.length.toLocaleString('fa-IR')} کاربر</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-950/40 text-slate-500">
              <tr><th className="p-3">کاربر</th><th className="p-3">نقش</th><th className="p-3">وضعیت</th><th className="p-3 text-left">عملیات</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/30">
                  <td className="p-3"><strong className="block text-slate-200">{user.displayName}</strong><span className="text-[11px] text-slate-500 font-mono">@{user.username}</span></td>
                  <td className="p-3 text-slate-300">{user.roleName}</td>
                  <td className="p-3"><span className={`text-[10px] px-2 py-1 rounded-full ${user.isActive ? 'bg-emerald-400/10 text-emerald-300' : 'bg-slate-700 text-slate-300'}`}>{user.isActive ? 'فعال' : 'غیرفعال'}</span></td>
                  <td className="p-3"><div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => openUserEdit(user)} className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700" aria-label="ویرایش کاربر"><Pencil className="w-4 h-4" /></button>
                    <button type="button" onClick={() => void removeUser(user)} className="p-2 rounded-xl bg-rose-950/40 text-rose-300 hover:bg-rose-900/60" aria-label="حذف کاربر"><Trash2 className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showRoleForm && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 p-4 overflow-y-auto flex items-center justify-center">
          <form onSubmit={saveRole} className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-5">
            <div className="flex justify-between items-center"><h3 className="text-sm font-black text-white">{editingRole ? 'ویرایش نقش' : 'نقش جدید'}</h3><button type="button" onClick={() => setShowRoleForm(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button></div>
            <label className="block text-xs text-slate-300">نام نقش
              <input required value={roleDraft.name} onChange={(event) => setRoleDraft({ ...roleDraft, name: event.target.value })} disabled={Boolean(editingRole?.isSystem)} className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white disabled:opacity-60" />
            </label>
            {editingRole?.isSystem ? (
              <p className="rounded-2xl bg-amber-400/10 border border-amber-400/30 p-3 text-xs text-amber-100">مدیرکل همیشه به همه بخش‌ها دسترسی دارد.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {customPermissionSections.map((section) => <label key={section} className="flex items-center gap-2 rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={roleDraft.permissions.includes(section)} onChange={() => togglePermission(section)} />
                  {SECTION_LABELS[section]}
                </label>)}
              </div>
            )}
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowRoleForm(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">انصراف</button><button className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-black">ذخیره نقش</button></div>
          </form>
        </div>
      )}

      {showUserForm && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 p-4 overflow-y-auto flex items-start sm:items-center justify-center">
          <form noValidate onSubmit={saveUser} className="my-auto w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-4">
            <div className="flex justify-between items-center"><h3 className="text-sm font-black text-white">{editingUser ? 'ویرایش کاربر' : 'کاربر جدید'}</h3><button type="button" onClick={() => setShowUserForm(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button></div>
            {!editingUser && <label className="block text-xs text-slate-300">نام کاربری (انگلیسی)
              <input required pattern="[A-Za-z0-9._-]{3,80}" value={userDraft.username} onChange={(event) => setUserDraft({ ...userDraft, username: event.target.value })} className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono" dir="ltr" />
            </label>}
            <label className="block text-xs text-slate-300">نام و سمت نمایشی
              <input required value={userDraft.displayName} onChange={(event) => setUserDraft({ ...userDraft, displayName: event.target.value })} className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white" />
            </label>
            <label className="block text-xs text-slate-300">نقش
              <select required value={userDraft.roleId} onChange={(event) => setUserDraft({ ...userDraft, roleId: event.target.value })} className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white">
                <option value="">انتخاب نقش</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
              </select>
            </label>
            {!roles.length && <div className="space-y-2"><p className="text-xs text-rose-200">فهرست نقش‌ها بارگذاری نشده است.</p><button type="button" onClick={() => void refresh()} className="rounded-xl border border-amber-400/40 px-3 py-2 text-xs text-amber-200">بارگذاری دوباره</button></div>}
            <label className="block text-xs text-slate-300">{editingUser ? 'رمز جدید (در صورت تغییر)' : 'رمز عبور'} <span className="text-slate-500">حداقل ۱۶ نویسه</span>
              <input required={!editingUser} minLength={16} type="password" value={userDraft.password} onChange={(event) => setUserDraft({ ...userDraft, password: event.target.value })} className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white" dir="ltr" autoComplete="new-password" />
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={userDraft.isActive} onChange={(event) => setUserDraft({ ...userDraft, isActive: event.target.checked })} /> حساب فعال باشد</label>
            {userError && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">{userError}</p>}
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowUserForm(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">انصراف</button><button disabled={savingUser} className="px-4 py-2 rounded-xl bg-amber-400 disabled:opacity-60 text-slate-950 text-xs font-black">{savingUser ? 'در حال ذخیره…' : editingUser ? 'ذخیره تغییرات' : 'ساخت کاربر'}</button></div>
          </form>
        </div>
      )}
    </div>
  );
};
