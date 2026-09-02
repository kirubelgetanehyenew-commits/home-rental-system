import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import API from "../services/api";

const statusStyles = {
  pending: "badge badge--pending",
  approved: "badge badge--approved",
  successful: "badge badge--approved",
  rejected: "badge badge--rejected",
  failed: "badge badge--rejected",
  refunded: "badge badge--cancelled",
};

const METHOD_TYPES = ["telebirr", "cbebirr", "bank_transfer", "cash", "other"];

function methodLabel(m, t) {
  if (m.label) return m.label;
  if (m.type === "bank_transfer") return t("payments.bankTransfer");
  if (m.type === "cash") return t("payments.cash");
  return m.type;
}

function statusLabel(status, t) {
  const key = `status.${status}`;
  const lbl = t(key);
  return lbl === key ? status : lbl;
}

export default function Payments() {
  const { user } = useAuth();
  const { t } = useLang();
  const isLandlord = user?.role === "landlord" || user?.role === "admin";

  const [received, setReceived] = useState(null);
  const [mine, setMine] = useState(null);
  const [methods, setMethods] = useState(null);
  const [methodsMsg, setMethodsMsg] = useState("");
  const [viewShot, setViewShot] = useState(null);
  const [viewed, setViewed] = useState({});

  const loadReceived = async () => {
    try {
      const res = await API.get("/payments/received");
      setReceived(res.data.payments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMine = async () => {
    try {
      const res = await API.get("/payments/my-payments");
      setMine(res.data.payments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMethods = async () => {
    try {
      const res = await API.get("/payments/my-methods");
      setMethods(res.data.paymentMethods || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isLandlord) {
      loadReceived();
      loadMethods();
    } else {
      loadMine();
    }
  }, [isLandlord]);

  const approve = async (id) => {
    try {
      await API.put(`/payments/${id}/approve`);
      await loadReceived();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve.");
    }
  };

  const reject = async (id) => {
    const reason = window.prompt(t("payments.rejectReason"), "");
    if (reason === null) return;
    try {
      await API.put(`/payments/${id}/reject`, { reason });
      await loadReceived();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject.");
    }
  };

  const updateMethod = (i, field, value) => {
    setMethods((prev) =>
      prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m))
    );
  };

  const addMethod = () => {
    setMethods((prev) => [
      ...prev,
      { type: "telebirr", label: "", accountName: "", accountNumber: "" },
    ]);
  };

  const removeMethod = (i) => {
    setMethods((prev) => prev.filter((_, idx) => idx !== i));
  };

  const saveMethods = async () => {
    setMethodsMsg("");
    try {
      await API.put("/payments/my-methods", { paymentMethods: methods });
      setMethodsMsg("✅ " + t("payments.methodsSaved"));
    } catch (err) {
      setMethodsMsg(`❌ ${err.response?.data?.message || "Failed to save."}`);
    }
  };

  const openShot = (p) => {
    setViewShot(p.screenshot);
    setViewed((v) => ({ ...v, [p._id]: true }));
  };

  const renderShot = (p) =>
    p.screenshot ? (
      <img
        src={p.screenshot}
        alt="proof"
        className="pay-shot-inline"
        title={t("payments.viewShot")}
        onClick={() => openShot(p)}
      />
    ) : null;

  return (
    <div className="page page--plain">
      <div className="container">
        <h1 className="page-title">{t("payments.pageTitle")}</h1>

        {/* ============ Landlord: payment methods config ============ */}
        {isLandlord && (
          <>
            <h3 className="section__title">{t("payments.myMethods")}</h3>
            <div className="card" style={{ marginBottom: 32 }}>
              <p className="soft" style={{ marginBottom: 16 }}>
                {t("payments.methodsHint")}
              </p>

              {methods === null ? (
                <p className="soft">{t("common.loading")}</p>
              ) : (
                <>
                  {methods.map((m, i) => (
                    <div className="pay-method-row" key={i}>
                      <select
                        value={m.type}
                        onChange={(e) =>
                          updateMethod(i, "type", e.target.value)
                        }
                        className="select"
                      >
                        {METHOD_TYPES.map((ty) => (
                          <option key={ty} value={ty}>
                            {ty}
                          </option>
                        ))}
                      </select>
                      <input
                        value={m.label}
                        onChange={(e) =>
                          updateMethod(i, "label", e.target.value)
                        }
                        placeholder={t("payments.labelPh")}
                        className="input"
                      />
                      <input
                        value={m.accountName}
                        onChange={(e) =>
                          updateMethod(i, "accountName", e.target.value)
                        }
                        placeholder={t("payments.accountName")}
                        className="input"
                      />
                      <input
                        value={m.accountNumber}
                        onChange={(e) =>
                          updateMethod(i, "accountNumber", e.target.value)
                        }
                        placeholder={t("payments.accountNumber")}
                        className="input"
                      />
                      <button
                        onClick={() => removeMethod(i)}
                        className="btn btn--danger btn--sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <div className="row row--wrap" style={{ marginTop: 12 }}>
                    <button onClick={addMethod} className="btn btn--outline">
                      ➕ {t("payments.addMethod")}
                    </button>
                    <button onClick={saveMethods} className="btn btn--primary">
                      💾 {t("payments.saveMethods")}
                    </button>
                  </div>
                  {methodsMsg && <p style={{ marginTop: 12 }}>{methodsMsg}</p>}
                </>
              )}
            </div>

            <h3 className="section__title">{t("payments.received")}</h3>
            <div className="stack">
              {received === null ? (
                <p className="soft">{t("common.loading")}</p>
              ) : received.length === 0 ? (
                <div className="empty">{t("payments.noPayments")}</div>
              ) : (
                received.map((p) => (
                  <div key={p._id} className="list-row">
                    <div>
                      <span className="list-row__title">
                        {p.property?.title || "—"}
                      </span>
                      <p className="list-row__meta">
                        👤 {p.tenant?.fullName} · {p.tenant?.email}
                      </p>
                      <p className="list-row__meta">
                        💵 ETB {p.amount} · {methodLabel(p, t)}
                      </p>
                      {p.rejectReason && (
                        <p className="list-row__meta">⚠️ {p.rejectReason}</p>
                      )}
                    </div>
                    <div className="list-row__actions">
                      {renderShot(p)}
                      <span className={statusStyles[p.status] || "badge"}>
                        {statusLabel(p.status, t)}
                      </span>
                      {p.status === "pending" && (
                        <>
                          <button
                            onClick={() => approve(p._id)}
                            disabled={!viewed[p._id]}
                            title={
                              !viewed[p._id] ? t("payments.viewFirst") : ""
                            }
                            className="btn btn--success btn--sm"
                          >
                            {t("payments.approve")}
                          </button>
                          <button
                            onClick={() => reject(p._id)}
                            className="btn btn--danger btn--sm"
                          >
                            {t("payments.reject")}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ============ Tenant: my payments ============ */}
        {!isLandlord && (
          <>
            <h3 className="section__title">{t("payments.myPayments")}</h3>
            <div className="stack">
              {mine === null ? (
                <p className="soft">{t("common.loading")}</p>
              ) : mine.length === 0 ? (
                <div className="empty">{t("payments.noPayments")}</div>
              ) : (
                mine.map((p) => (
                  <div key={p._id} className="list-row">
                    <div>
                      <span className="list-row__title">
                        {p.property?.title || "—"}
                      </span>
                      <p className="list-row__meta">
                        💵 ETB {p.amount} · {methodLabel(p, t)}
                      </p>
                      {p.status === "pending" && (
                        <p className="list-row__meta">
                          {t("payments.pendingApproval")}
                        </p>
                      )}
                      {p.rejectReason && (
                        <p className="list-row__meta">⚠️ {p.rejectReason}</p>
                      )}
                    </div>
                    <div className="list-row__actions">
                      {renderShot(p)}
                      <span className={statusStyles[p.status] || "badge"}>
                        {statusLabel(p.status, t)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ============ Screenshot viewer ============ */}
        {viewShot && (
          <div className="modal-overlay" onClick={() => setViewShot(null)}>
            <img
              src={viewShot}
              alt="payment proof"
              className="pay-shot-full"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
