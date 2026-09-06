import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";

export default function Messages() {
  const { t } = useLang();
  const { user } = useAuth();
  const userId = user?.id;
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeConv, setActiveConv] = useState(null);

  // Load conversation list on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await API.get("/messages");
        setConversations(res.data.messages || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Group by property + other user (skip orphaned messages whose
  // sender/recipient/property was deleted, which populate returns as null)
  const grouped = conversations.reduce((acc, msg) => {
    if (!msg.sender || !msg.recipient || !msg.property) return acc;
    const other = msg.sender._id === userId ? msg.recipient : msg.sender;
    const key = `${msg.property._id}-${other._id}`;
    if (!acc[key]) {
      acc[key] = {
        property: msg.property,
        otherUser: other,
        lastMessage: msg,
        unread: 0,
      };
    }
    acc[key].lastMessage = msg;
    if (!msg.isRead && msg.recipient._id === userId) acc[key].unread += 1;
    return acc;
  }, {});

  const list = Object.values(grouped).sort(
    (a, b) =>
      new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
  );

  async function open(conv) {
    setActiveConv(conv);
    try {
      const res = await API.get(
        `/messages/conversation/${conv.property._id}/${conv.otherUser._id}`
      );
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function send() {
    if (!messageText.trim() || !activeConv) return;
    try {
      await API.post("/messages", {
        property: activeConv.property._id,
        recipient: activeConv.otherUser._id,
        content: messageText,
      });
      setMessageText("");
      const res = await API.get(
        `/messages/conversation/${activeConv.property._id}/${activeConv.otherUser._id}`
      );
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error(err);
    }
  }

  const isActive = (conv) =>
    activeConv &&
    activeConv.property._id === conv.property._id &&
    activeConv.otherUser._id === conv.otherUser._id;

  return (
    <div className="page page--plain">
      <div className="container container--narrow">
        <h1 className="page-title">{t("messages.title")}</h1>

        {loading ? (
          <div className="loading">{t("messages.loading")}</div>
        ) : list.length === 0 ? (
          <div className="empty">{t("messages.empty")}</div>
        ) : (
          <div className="stack">
            {list.map((conv) => (
              <button
                key={conv.property._id + conv.otherUser._id}
                onClick={() => open(conv)}
                className={`conversation-item${isActive(conv) ? " conversation-item--active" : ""}`}
              >
                {conv.otherUser.profileImage ? (
                  <img
                    src={conv.otherUser.profileImage}
                    alt={conv.otherUser.fullName}
                    className="avatar avatar--lg"
                  />
                ) : (
                  <span className="avatar avatar--lg">
                    {(conv.otherUser.fullName || "U")[0].toUpperCase()}
                  </span>
                )}
                <div className="conversation-item__info">
                  <p className="conversation-item__name">
                    {conv.otherUser.fullName}
                  </p>
                  <p className="conversation-item__sub">{conv.property.title}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="badge badge--brand">
                    {conv.unread} {t("messages.unread")}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {activeConv && (
          <div className="chat">
            <div className="chat__header">
              {activeConv.otherUser.profileImage ? (
                <img
                  src={activeConv.otherUser.profileImage}
                  alt={activeConv.otherUser.fullName}
                  className="avatar"
                />
              ) : (
                <span className="avatar">
                  {(activeConv.otherUser.fullName || "U")[0].toUpperCase()}
                </span>
              )}
              <div>
                <p style={{ fontWeight: 700 }}>{activeConv.otherUser.fullName}</p>
                <p className="conversation-item__sub">
                  {activeConv.property.title}
                </p>
              </div>
            </div>

            <div className="chat__messages">
              {messages
                .filter((msg) => msg.sender)
                .map((msg) => (
                  <div
                    key={msg._id}
                    className={`bubble${msg.sender._id === userId ? " bubble--mine" : ""}`}
                  >
                    <p>
                      <span className="bubble__author">
                        {msg.sender.fullName}
                      </span>{" "}
                      {msg.content}
                    </p>
                    <p className="bubble__time">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
            </div>

            <div className="chat__input">
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={t("messages.placeholder")}
                className="input"
              />
              <button onClick={send} className="btn btn--primary">
                {t("messages.send")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
