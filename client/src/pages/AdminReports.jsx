import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useLang } from "../context/LanguageContext";

const reportStatusBadge = {
  resolved: "badge badge--success",
  dismissed: "badge badge--muted",
  pending: "badge badge--pending",
};

export default function AdminReports() {
  const { t } = useLang();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await API.get("/admin/reports");
      setReports(res.data.reports || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function resolve(id, status) {
    try {
      await API.put(`/admin/reports/${id}`, { status });
      load();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="page page--admin">
      <div className="container container--wide">
        <div className="page-header">
          <h1 className="page-title">{t("admin.reports")}</h1>
          <Link to="/dashboard" className="link">
            ← {t("nav.dashboard")}
          </Link>
        </div>

        {loading ? (
          <div className="loading">{t("common.loading")}</div>
        ) : reports.length === 0 ? (
          <div className="empty">{t("admin.noReports")}</div>
        ) : (
          <div className="stack">
            {reports.map((r) => (
              <div key={r._id} className="card">
                <div className="row row--between row--center row--wrap">
                  <div>
                    <p style={{ fontWeight: 700 }}>
                      {t("admin.reportedBy")}: {r.reporter?.fullName}
                    </p>
                    <p className="list-row__meta">
                      {r.property
                        ? `${t("admin.property")}: ${r.property.title}`
                        : `${t("admin.user")}: ${r.reportedUser?.fullName}`}
                    </p>
                    <p style={{ marginTop: 6 }}>
                      <span style={{ fontWeight: 600 }}>{t("admin.reason")}:</span>{" "}
                      {r.reason}
                    </p>
                    {r.description && (
                      <p className="soft">{r.description}</p>
                    )}
                  </div>
                  <span className={reportStatusBadge[r.status] || "badge badge--muted"}>
                    {r.status}
                  </span>
                </div>

                {r.status === "pending" && (
                  <div className="row" style={{ marginTop: 14 }}>
                    <button
                      onClick={() => resolve(r._id, "resolved")}
                      className="btn btn--success btn--sm"
                    >
                      {t("admin.resolve")}
                    </button>
                    <button
                      onClick={() => resolve(r._id, "dismissed")}
                      className="btn btn--outline btn--sm"
                    >
                      {t("admin.dismiss")}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
