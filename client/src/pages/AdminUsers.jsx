import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useLang } from "../context/LanguageContext";

export default function AdminUsers() {
  const { t } = useLang();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (role) params.role = role;
      const res = await API.get("/admin/users", { params });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleSuspend(user) {
    try {
      await API.put(`/admin/users/${user._id}/status`, {
        isSuspended: !user.isSuspended,
      });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function remove(user) {
    if (!confirm(`${t("admin.deleteConfirm")} ${user.fullName}?`)) return;
    try {
      await API.delete(`/admin/users/${user._id}`);
      load();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="page page--admin">
      <div className="container container--wide">
        <div className="page-header">
          <h1 className="page-title">{t("admin.users")}</h1>
          <Link to="/dashboard" className="link">
            ← {t("nav.dashboard")}
          </Link>
        </div>

        <div className="toolbar">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder={t("admin.searchUsers")}
            className="input"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="select"
          >
            <option value="">{t("admin.allRoles")}</option>
            <option value="tenant">{t("register.tenant")}</option>
            <option value="landlord">{t("register.landlord")}</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={load} className="btn btn--primary">
            {t("admin.filter")}
          </button>
        </div>

        {loading ? (
          <div className="loading">{t("common.loading")}</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t("dash.name")}</th>
                  <th>{t("form.email")}</th>
                  <th>{t("dash.role")}</th>
                  <th>{t("admin.status")}</th>
                  <th>{t("admin.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td style={{ textTransform: "capitalize" }}>{u.role}</td>
                    <td>
                      {u.isSuspended ? (
                        <span className="badge badge--suspended">
                          {t("admin.suspended")}
                        </span>
                      ) : (
                        <span className="badge badge--active">
                          {t("admin.active")}
                        </span>
                      )}
                    </td>
                    <td>
                      {u.role !== "admin" && (
                        <div className="row">
                          <button
                            onClick={() => toggleSuspend(u)}
                            className="btn btn--outline btn--sm"
                          >
                            {u.isSuspended ? t("admin.activate") : t("admin.suspend")}
                          </button>
                          <button
                            onClick={() => remove(u)}
                            className="btn btn--danger-outline btn--sm"
                          >
                            {t("admin.delete")}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
