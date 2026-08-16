import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiErrorMessage } from "../api/client";
import { assignPermission, createRole, deleteRole, listPermissions, listRoles, removePermission } from "../api/roles";
import { Permission, Role } from "../types";

// Permission names follow a "module.action" convention (see seed.ts), so the
// matrix groups them by the part before the dot the same way the module's
// design doc (Permission Management.md §3) lays out Module -> Action.
function groupByModule(permissions: Permission[]) {
  const groups = new Map<string, Permission[]>();
  for (const p of permissions) {
    const [module] = p.name.split(".");
    const label = module.replace(/_/g, " ");
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(p);
  }
  return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

export function PermissionManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const [showNewRole, setShowNewRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function refresh(keepSelection = true) {
    listRoles()
      .then((r) => {
        setRoles(r);
        if (!keepSelection || !selectedRoleId) {
          setSelectedRoleId(r[0]?.id ?? null);
        }
      })
      .catch((err) => setError(apiErrorMessage(err)));
  }

  useEffect(() => {
    refresh(false);
    listPermissions().then(setPermissions).catch((err) => setError(apiErrorMessage(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;
  const assignedIds = useMemo(
    () => new Set((selectedRole?.rolePermissions ?? []).map((rp) => rp.permission.id)),
    [selectedRole]
  );
  const grouped = useMemo(() => groupByModule(permissions), [permissions]);
  const isAdminRole = selectedRole?.name === "Admin";

  async function handleCreateRole(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      const role = await createRole({ name: newRoleName, description: newRoleDescription || undefined });
      setNewRoleName("");
      setNewRoleDescription("");
      setShowNewRole(false);
      refresh(false);
      setSelectedRoleId(role.id);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteRole(role: Role) {
    setError(null);
    setNotice(null);
    try {
      await deleteRole(role.id);
      setNotice(`Role "${role.name}" deleted.`);
      refresh(false);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function togglePermission(permission: Permission, isAssigned: boolean) {
    if (!selectedRoleId) return;
    setError(null);
    setTogglingId(permission.id);
    try {
      if (isAssigned) {
        await removePermission(selectedRoleId, permission.id);
      } else {
        await assignPermission(selectedRoleId, permission.id);
      }
      refresh();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <>
      <div className="topbar">
        <h2>Roles &amp; Permissions</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowNewRole((v) => !v)}>
          {showNewRole ? "Cancel" : "New role"}
        </button>
      </div>
      <div className="page-content">
        {error && <div className="error-banner">{error}</div>}
        {notice && (
          <div className="error-banner" style={{ background: "var(--pass-soft)", color: "var(--pass)" }}>
            {notice}
          </div>
        )}

        {showNewRole && (
          <form onSubmit={handleCreateRole} className="card card-padded" style={{ marginBottom: 20 }}>
            <div className="section-title">New role</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
              <div className="field">
                <label>Role name</label>
                <input className="input" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} required />
              </div>
              <div className="field">
                <label>Description</label>
                <input className="input" value={newRoleDescription} onChange={(e) => setNewRoleDescription(e.target.value)} />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create role"}
            </button>
          </form>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, alignItems: "start" }}>
          <div className="card">
            {roles.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRoleId(r.id)}
                className="nav-link"
                style={{
                  cursor: "pointer",
                  margin: 6,
                  background: r.id === selectedRoleId ? "var(--accent-soft)" : undefined,
                  color: r.id === selectedRoleId ? "var(--accent)" : undefined,
                  justifyContent: "space-between",
                }}
              >
                <span>
                  <span className="dot" style={{ marginRight: 8 }} />
                  {r.name}
                </span>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-muted)" }}>
                  {r._count?.users ?? 0}
                </span>
              </div>
            ))}
            {roles.length === 0 && <div className="empty-state">No roles yet.</div>}
          </div>

          <div className="card card-padded">
            {!selectedRole && <div className="empty-state">Select a role to manage its permissions.</div>}
            {selectedRole && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{selectedRole.name}</div>
                    {selectedRole.description && (
                      <div style={{ color: "var(--ink-muted)", fontSize: 12.5 }}>{selectedRole.description}</div>
                    )}
                    <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 4 }}>
                      {selectedRole._count?.users ?? 0} user(s) assigned
                    </div>
                  </div>
                  {!isAdminRole && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRole(selectedRole)}>
                      Delete role
                    </button>
                  )}
                </div>

                {isAdminRole && (
                  <div className="error-banner" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                    The Admin role is protected — it can't be renamed or deleted, since it's what every admin-only
                    screen (including this one) checks for.
                  </div>
                )}

                {grouped.map(([moduleLabel, modulePermissions]) => (
                  <div key={moduleLabel} style={{ marginBottom: 18 }}>
                    <div className="section-title" style={{ textTransform: "capitalize" }}>
                      {moduleLabel}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {modulePermissions.map((p) => {
                        const isAssigned = assignedIds.has(p.id);
                        return (
                          <label
                            key={p.id}
                            className="card"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "8px 12px",
                              cursor: "pointer",
                              opacity: togglingId === p.id ? 0.6 : 1,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              disabled={togglingId === p.id}
                              onChange={() => togglePermission(p, isAssigned)}
                            />
                            <span style={{ fontSize: 13 }}>{p.name.split(".")[1] ?? p.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
