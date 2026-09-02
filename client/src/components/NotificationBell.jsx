import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useLang } from "../context/LanguageContext";

export default function NotificationBell() {
  const { t } = useLang();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  async function load() {
    try {
      const [listRes, countRes] = await Promise.all([
        API.get("/notifications"),
        API.get("/notifications/unread-count"),
      ]);
      setNotifications(listRes.data.notifications || []);
      setUnread(countRes.data.count || 0);
    } catch (err) {
      // not logged in
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  async function markAllRead() {
    try {
      await API.put("/notifications/read-all");
      setUnread(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  }

  async function markRead(id) {
    try {
      await API.put(`/notifications/${id}/read`);
      setUnread((u) => Math.max(0, u - 1));
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="notif">
      <button
        onClick={() => setOpen((o) => !o)}
        title={t("notifications.title")}
        className="icon-btn"
      >
        🔔
        {unread > 0 && (
          <span className="notif__badge">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="notif__backdrop" onClick={() => setOpen(false)} />
          <div className="notif__dropdown">
            <div className="notif__head">
              <span>{t("notifications.title")}</span>
              {unread > 0 && (
                <button onClick={markAllRead} className="link">
                  {t("notifications.markAll")}
                </button>
              )}
            </div>

            <div className="notif__list">
              {notifications.length === 0 ? (
                <p className="empty" style={{ border: "none", padding: "24px 16px" }}>
                  {t("notifications.empty")}
                </p>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n._id}
                    to={n.link || "#"}
                    onClick={() => {
                      if (!n.isRead) markRead(n._id);
                      setOpen(false);
                    }}
                    className={`notif__item${!n.isRead ? " notif__item--unread" : ""}`}
                  >
                    <p className="notif__item-title">{n.title}</p>
                    {n.body && <p className="notif__item-body">{n.body}</p>}
                    <p className="notif__item-time">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
