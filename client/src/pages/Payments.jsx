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

const METHOD_ICONS = {
  telebirr: "📱",
  cbebirr: "🏦",
  bank_transfer: "🏦",
  card: "💳",
  cash: "💵",
  other: "🧾",
};

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

const isPaid = (p) => p.status === "approved" || p.status === "successful";

export default function Payments() {
  const { user } = useAuth();
  const { t } = useLang();
  const isLandlord = user?.role === "landlord" || user?.role === "admin";

  const [received, setReceived] = useState(null);
  const [mine, setMine] = useState(null);
  const [methods, setMethods] = useState(null);
  const [methodsMsg, setMethodsMsg] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [viewShot, setViewShot] = useState(null);
  const [viewed, setViewed] = useState({});
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

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
    setActionMsg("");
    try {
      await API.put(`/payments/${id}/approve`);
      setActionMsg("✅ " + t("status.approved"));
      await loadReceived();
    } catch (err) {
      setActionMsg(`❌ ${err.response?.data?.message || "Failed to approve."}`);
    }
  };

  const submitReject = async (e) => {
    e.preventDefault();
    setActionMsg("");
    try {
      await API.put(`/payments/${rejecting._id}/reject`, {
        reason: rejectReason.trim(),
      });
      setRejecting(null);
      setRejectReason("");
      setActionMsg("🚫 " + t("status.rejected"));
      await loadReceived();
    } catch (err) {
      setActionMsg(`❌ ${err.response?.data?.message || "Failed to reject."}`);
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

  const list = isLandlord ? received : mine;
  const paidTotal = (list || []).filter(isPaid).reduce((s, p) => s + (p.amount || 0), 0);
  const pendingCount = (list || []).filter((p) => p.status === "pending").length;
  const rejectedCount = (list || []).filter((p) => p.status === "rejected").length;

  return (
    <div className="page page--plain">
      <div className="container">
        <div className="pay-hero">
          <span className="pay-hero__icon">💳</span>
          <div>
            <h1 className="pay-hero__title">{t("payments.pageTitle")}</h1>
            <p className="pay-hero__sub">
              {isLandlord ? t("payments.received") : t("payments.myPayments")}
            </p>
          </div>
        </div>

        {actionMsg && (
          <div
            className={`alert ${
              actionMsg.startsWith("❌") ? "alert--error" : "alert--success"
            }`}
            style={{ marginBottom: 20 }}
          >
            {actionMsg}
          </div>
        )}

        {/* ============ Summary stats ============ */}
        <div className="grid grid--3" style={{ marginBottom: 28 }}>
          <div className="stat-card">
            <span className="stat-card__icon">💵</span>
            <span className="stat-card__text">
              <p className="stat-card__value">{paidTotal.toLocaleString()}</p>
              <p className="stat-card__label">
                {isLandlord ? t("dash.paymentsReceived") : t("payments.totalPaid")}
              </p>
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-card__icon">⏳</span>
            <span className="stat-card__text">
              <p className="stat-card__value">{pendingCount}</p>
              <p className="stat-card__label">{t("status.pending")}</p>
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-card__icon">🚫</span>
            <span className="stat-card__text">
              <p className="stat-card__value">{rejectedCount}</p>
              <p className="stat-card__label">{t("status.rejected")}</p>
            </span>
          </div>
        </div>

        {/* ============ Landlord: payment methods config ============ */}
        {isLandlord && (
          <section className="pay-section">
            <h2 className="section__title">🏦 {t("payments.myMethods")}</h2>

            <div className="card pay-methods-card">
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
                        onChange={(e) => updateMethod(i, "type", e.target.value)}
                        className="select"
                      >
                        {METHOD_TYPES.map((ty) => (
                          <option key={ty} value={ty}>
                            {METHOD_ICONS[ty]} {ty}
                          </option>
                        ))}
                      </select>
                      <input
                        value={m.label}
                        onChange={(e) => updateMethod(i, "label", e.target.value)}
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
                        🗑
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
                  {methodsMsg && (
                    <p className="pay-form-msg">{methodsMsg}</p>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        {/* ============ Transactions ============ */}
        <section className="pay-section">
          <h2 className="section__title">
            {isLandlord ? `📥 ${t("payments.received")}` : `🧾 ${t("payments.myPayments")}`}
          </h2>

          {list === null ? (
            <p className="soft">{t("common.loading")}</p>
          ) : list.length === 0 ? (
            <div className="empty">{t("payments.noPayments")}</div>
          ) : (
            <div className="pay-list">
              {list.map((p) => (
                <article key={p._id} className={`pay-card pay-card--${p.status}`}>
                  <header className="pay-card__head">
                    <div className="pay-card__who">
                      <span className="pay-card__avatar">
                        {isLandlord ? p.tenant?.fullName?.[0] || "?" : "💵"}
                      </span>
                      <div>
                        <p className="pay-card__name">
                          {isLandlord
                            ? p.tenant?.fullName || "—"
                            : p.property?.title || "—"}
                        </p>
                        <p className="pay-card__sub">
                          {isLandlord
                            ? p.tenant?.email
                            : p.property?.location || "—"}
                        </p>
                      </div>
                    </div>

                    <span className={statusStyles[p.status] || "badge"}>
                      {statusLabel(p.status, t)}
                    </span>
                  </header>

                  <div className="pay-card__body">
                    <p className="pay-card__amount">
                      {Number(p.amount).toLocaleString()} <small>ETB</small>
                    </p>

                    <div className="pay-card__chips">
                      <span className="pay-card__chip">
                        {METHOD_ICONS[p.method] || "🧾"} {methodLabel(p, t)}
                      </span>
                      <span
                        className="pay-card__chip pay-card__chip--mono"
                        title={t("payments.ref")}
                      >
                        # {p.transactionRef}
                      </span>
                      <span className="pay-card__chip">
                        🕒 {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="pay-card__foot">
                    {p.screenshot ? (
                      <button
                        type="button"
                        className="pay-proof"
                        onClick={() => openShot(p)}
                      >
                        <img src={p.screenshot} alt={t("payments.viewProof")} />
                        <span>
                          {viewed[p._id] ? "✅" : "🔒"} {t("payments.viewProof")}
                        </span>
                      </button>
                    ) : (
                      <span className="pay-card__hint">—</span>
                    )}

                    {isLandlord && p.status === "pending" && (
                      <div className="pay-card__actions">
                        <button
                          onClick={() => approve(p._id)}
                          disabled={!viewed[p._id]}
                          title={!viewed[p._id] ? t("payments.viewFirst") : ""}
                          className="btn btn--success btn--sm"
                        >
                          ✅ {t("payments.approve")}
                        </button>
                        <button
                          onClick={() => {
                            setRejecting(p);
                            setRejectReason("");
                          }}
                          className="btn btn--danger btn--sm"
                        >
                          🚫 {t("payments.reject")}
                        </button>
                      </div>
                    )}

                    {!isLandlord && p.status === "pending" && (
                      <span className="pay-card__hint">
                        ⏳ {t("payments.pendingApproval")}
                      </span>
                    )}
                  </div>

                  {p.rejectReason && (
                    <div className="pay-card__reason">⚠️ {p.rejectReason}</div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ============ Reject reason modal ============ */}
        {rejecting && (
          <div className="modal-overlay">
            <form className="modal" onSubmit={submitReject}>
              <h2 className="modal__title">🚫 {t("payments.rejectTitle")}</h2>

              <p className="soft" style={{ marginBottom: 12 }}>
                {isLandlord
                  ? rejecting.tenant?.fullName
                  : rejecting.property?.title}{" "}
                · {Number(rejecting.amount).toLocaleString()} ETB
              </p>

              <textarea
                rows="3"
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t("payments.rejectPh")}
                className="textarea"
              />

              <div className="row" style={{ marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setRejecting(null)}
                  className="btn btn--outline"
                >
                  {t("payments.cancel")}
                </button>
                <button className="btn btn--danger">
                  🚫 {t("payments.reject")}
                </button>
              </div>
            </form>
          </div>
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
