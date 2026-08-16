import { FormEvent, useEffect, useState } from "react";
import { apiErrorMessage } from "../api/client";
import { listRoles } from "../api/roles";
import { createUser, listUsers, resetPassword, updateUser, updateUserStatus } from "../api/users";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { ManagedUser, Role } from "../types";

const emptyForm = { name: "", email: "", password: "", roleId: "" };

export function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [total, setTotal] = useState(0);
  const [roles, setRoles] = useState<Role[]>([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [resetTargetId, setResetTargetId] = useState<string | null>(null);
  const [resetValue, setResetValue] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    listUsers({
      search: search || undefined,
      roleId: roleFilter || undefined,
      status: (statusFilter as "ACTIVE" | "INACTIVE") || undefined,
      limit: 50,
    })
      .then((res) => {
        setUsers(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError(apiErrorMessage(err)));
  }

  useEffect(() => {
    listRoles().then(setRoles).catch((err) => setError(apiErrorMessage(err)));
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(refresh, [search, roleFilter, statusFilter]);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setResetTargetId(null);
    setShowForm(true);
  }

  function startEdit(u: ManagedUser) {
    setEditingId(u.id);
    setForm({ name: u.name, email: u.email, password: "", roleId: u.role.id });
    setResetTargetId(null);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      if (editingId) {
        await updateUser(editingId, { name: form.name, roleId: form.roleId });
        setNotice("User updated.");
      } else {
        await createUser({ name: form.name, email: form.email, password: form.password, roleId: form.roleId });
        setNotice("User created.");
      }
      cancelForm();
      refresh();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(u: ManagedUser) {
    setError(null);
    setNotice(null);
    try {
      await updateUserStatus(u.id, u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE");
      refresh();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  function startReset(u: ManagedUser) {
    setShowForm(false);
    setResetTargetId(u.id);
    setResetValue("");
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    if (!resetTargetId) return;
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      await resetPassword(resetTargetId, resetValue);
      setNotice("Password reset. Share the new password with the user securely.");
      setResetTargetId(null);
      setResetValue("");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const resetTarget = users.find((u) => u.id === resetTargetId);

  return (
    <>
      <div className="topbar">
        <h2>User Management</h2>
        <button className="btn btn-primary btn-sm" onClick={() => (showForm ? cancelForm() : startCreate())}>
          {showForm ? "Cancel" : "New user"}
        </button>
      </div>
      <div className="page-content">
        {error && <div className="error-banner">{error}</div>}
        {notice && (
          <div className="error-banner" style={{ background: "var(--pass-soft)", color: "var(--pass)" }}>
            {notice}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="card card-padded" style={{ marginBottom: 20 }}>
            <div className="section-title">{editingId ? "Edit user" : "New user"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field">
                <label>Full name</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={!!editingId}
                  required
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {!editingId && (
                <div className="field">
                  <label>Password</label>
                  <input
                    className="input"
                    type="password"
                    minLength={8}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>
              )}
              <div className="field">
                <label>Role</label>
                <select
                  className="input"
                  value={form.roleId}
                  onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                  required
                >
                  <option value="" disabled>
                    Select a role
                  </option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Saving…" : editingId ? "Save changes" : "Create user"}
            </button>
          </form>
        )}

        {resetTargetId && resetTarget && (
          <form onSubmit={handleReset} className="card card-padded rail rail-blocked" style={{ marginBottom: 20 }}>
            <div className="section-title">Reset password — {resetTarget.name}</div>
            <div className="field">
              <label>New password</label>
              <input
                className="input"
                type="password"
                minLength={8}
                value={resetValue}
                onChange={(e) => setResetValue(e.target.value)}
                required
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Resetting…" : "Reset password"}
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => setResetTargetId(null)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="toolbar">
          <div className="filters">
            <input
              className="input"
              placeholder="Search name or email…"
              style={{ width: 220 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="input" style={{ width: 160 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <select className="input" style={{ width: 140 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="mono" style={{ fontSize: 12, color: "var(--ink-muted)" }}>
            {total} user{total === 1 ? "" : "s"}
          </div>
        </div>

        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Full name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No users match these filters.
                  </td>
                </tr>
              )}
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>
                      {u.name} {isSelf && <span className="mono" style={{ color: "var(--ink-muted)", fontWeight: 400 }}>(you)</span>}
                    </td>
                    <td className="mono" style={{ fontSize: 12.5 }}>
                      {u.email}
                    </td>
                    <td>{u.role.name}</td>
                    <td>
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="mono" style={{ fontSize: 12 }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => startEdit(u)}>
                          Edit
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => startReset(u)}>
                          Reset password
                        </button>
                        <button
                          className={`btn btn-sm ${u.status === "ACTIVE" ? "btn-danger" : "btn-secondary"}`}
                          onClick={() => toggleStatus(u)}
                          disabled={isSelf && u.status === "ACTIVE"}
                          title={isSelf && u.status === "ACTIVE" ? "You cannot deactivate your own account" : undefined}
                        >
                          {u.status === "ACTIVE" ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
