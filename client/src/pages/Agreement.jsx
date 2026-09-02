import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../services/api";
import { useLang } from "../context/LanguageContext";

export default function Agreement() {
  const { bookingId } = useParams();
  const { t } = useLang();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await API.get(`/agreements/${bookingId}`);
        setAgreement(res.data.agreement);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load agreement.");
      }
      setLoading(false);
    }
    load();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="page page--plain">
        <div className="container">
          <div className="loading">{t("common.loading")}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page page--plain">
        <div className="container container--narrow">
          <div className="alert alert--error">{error}</div>
          <p className="center" style={{ marginTop: 16 }}>
            <Link to="/bookings" className="link">
              ← {t("bookings.title")}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const a = agreement;

  return (
    <div className="page page--plain">
      <div className="container">
        <div className="page-header">
          <Link to="/bookings" className="link">
            ← {t("bookings.title")}
          </Link>
          <button onClick={() => window.print()} className="btn btn--primary btn--sm">
            🖨️ {t("agreement.print")}
          </button>
        </div>

        <div className="agreement">
          <h1 className="agreement__title">{t("agreement.title")}</h1>
          <p className="muted center" style={{ marginTop: 6, fontSize: 14 }}>
            {t("agreement.generated")}: {new Date(a.generatedAt).toLocaleString()}
          </p>

          <div className="grid grid--2 agreement__section">
            <section>
              <h2>{t("agreement.tenant")}</h2>
              <p style={{ marginTop: 4 }}>{a.tenant.fullName}</p>
              <p className="muted">{a.tenant.email}</p>
              <p className="muted">{a.tenant.phone}</p>
              {a.tenant.address && <p className="muted">{a.tenant.address}</p>}
            </section>

            <section>
              <h2>{t("agreement.landlord")}</h2>
              <p style={{ marginTop: 4 }}>{a.landlord.fullName}</p>
              <p className="muted">{a.landlord.email}</p>
              <p className="muted">{a.landlord.phone}</p>
              {a.landlord.address && <p className="muted">{a.landlord.address}</p>}
            </section>
          </div>

          <section className="agreement__section">
            <h2>{t("agreement.property")}</h2>
            <p style={{ marginTop: 4, fontWeight: 700 }}>{a.property.title}</p>
            <p className="muted">
              {[a.property.address, a.property.subCity, a.property.city]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p className="muted">
              {t("admin.type")}: {a.property.type}
            </p>
          </section>

          <section className="agreement__section">
            <h2>{t("agreement.terms")}</h2>
            <div className="agreement__terms">
              <div className="agreement__term">
                <p className="agreement__term-label">{t("agreement.startDate")}</p>
                <p className="agreement__term-value">{a.terms.startDate}</p>
              </div>
              <div className="agreement__term">
                <p className="agreement__term-label">{t("agreement.monthlyRent")}</p>
                <p className="agreement__term-value">ETB {a.terms.monthlyRent}</p>
              </div>
              <div className="agreement__term">
                <p className="agreement__term-label">{t("agreement.deposit")}</p>
                <p className="agreement__term-value">ETB {a.terms.deposit}</p>
              </div>
            </div>

            <p style={{ marginTop: 14 }}>{a.terms.paymentTerms}</p>

            <ul className="agreement__conditions">
              {a.terms.conditions.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </section>

          <div className="agreement__signatures">
            <div className="signature-line">{t("agreement.tenantSignature")}</div>
            <div className="signature-line">{t("agreement.landlordSignature")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
