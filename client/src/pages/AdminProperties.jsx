import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useLang } from "../context/LanguageContext";

export default function AdminProperties() {
  const { t } = useLang();
  const [properties, setProperties] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const params = status ? { status } : {};
      const res = await API.get("/admin/properties", { params });
      setProperties(res.data.properties || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setStatus_(id, newStatus) {
    try {
      await API.put(`/admin/properties/${id}/status`, { status: newStatus });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  async function remove(id) {
    if (!confirm(t("admin.deletePropertyConfirm"))) return;
    try {
      await API.delete(`/admin/properties/${id}`);
      load();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="page page--admin">
      <div className="container container--wide">
        <div className="page-header">
          <h1 className="page-title">{t("admin.properties")}</h1>
          <Link to="/dashboard" className="link">
            ← {t("nav.dashboard")}
          </Link>
        </div>

        <div className="toolbar">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="select"
          >
            <option value="">{t("admin.allStatuses")}</option>
            <option value="active">{t("admin.active")}</option>
            <option value="pending">{t("status.pending")}</option>
            <option value="inactive">{t("admin.inactive")}</option>
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
                  <th>{t("admin.title")}</th>
                  <th>{t("admin.owner")}</th>
                  <th>{t("admin.price")}</th>
                  <th>{t("admin.status")}</th>
                  <th>{t("admin.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                    <td>{p.owner?.fullName}</td>
                    <td>{p.price} ETB</td>
                    <td>
                      <span className={`badge badge--${p.status}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div className="row row--wrap">
                        {p.status !== "active" && (
                          <button
                            onClick={() => setStatus_(p._id, "active")}
                            className="btn btn--success btn--sm"
                          >
                            {t("admin.approve")}
                          </button>
                        )}
                        {p.status !== "pending" && (
                          <button
                            onClick={() => setStatus_(p._id, "pending")}
                            className="btn btn--outline btn--sm"
                          >
                            {t("admin.markPending")}
                          </button>
                        )}
                        {p.status !== "inactive" && (
                          <button
                            onClick={() => setStatus_(p._id, "inactive")}
                            className="btn btn--outline btn--sm"
                          >
                            {t("admin.deactivate")}
                          </button>
                        )}
                        <button
                          onClick={() => remove(p._id)}
                          className="btn btn--danger-outline btn--sm"
                        >
                          {t("admin.delete")}
                        </button>
                      </div>
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
