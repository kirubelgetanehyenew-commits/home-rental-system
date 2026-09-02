import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import API from "../services/api";

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useLang();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    bio: "",
    profileImage: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data.user;
        setFormData({
          fullName: user.fullName || "",
          phone: user.phone || "",
          address: user.address || "",
          bio: user.bio || "",
          profileImage: user.profileImage || "",
        });
      } catch (err) {
        console.error(err);
      }
    };

    loadProfile();
  }, []);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));

    // Auto-upload
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("avatar", file);

      const res = await API.post("/users/profile/avatar", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const img = res.data.profileImage || res.data.user.profileImage;
      if (img) {
        setFormData((s) => ({ ...s, profileImage: img }));
        const savedUser = JSON.parse(localStorage.getItem("user") || "null");
        if (savedUser) {
          savedUser.profileImage = img;
          localStorage.setItem("user", JSON.stringify(savedUser));
        }
      }

      setMessage("Avatar uploaded");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Avatar upload failed");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const res = await API.put("/users/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update localStorage user and reload to pick up new name/avatar
      const updatedUser = res.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setMessage("Profile updated successfully");

      setTimeout(() => {
        navigate("/dashboard");
      }, 900);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update profile");
    }
  }

  return (
    <div className="page page--plain">
      <div className="container container--narrow">
        <h1 className="page-title">{t("profile.title")}</h1>

        {message && (
          <div className="alert alert--info" style={{ marginBottom: 16 }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card form">
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="input"
            placeholder={t("form.fullName")}
            required
          />

          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input"
            placeholder={t("form.phone")}
          />

          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="input"
            placeholder={t("profile.address")}
          />

          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="textarea"
            placeholder={t("profile.bio")}
            rows={4}
          />

          <div className="form-group">
            <label className="label">{t("profile.avatar")}</label>
            <div className="row row--center">
              <div
                className="avatar avatar--lg"
                style={{ width: 72, height: 72, fontSize: 26, overflow: "hidden" }}
              >
                {avatarPreview || formData.profileImage ? (
                  <img
                    src={avatarPreview || formData.profileImage}
                    alt="avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  formData.fullName?.[0] || "?"
                )}
              </div>

              <input type="file" accept="image/*" onChange={handleAvatarChange} />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn--primary">
              {t("profile.save")}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn--outline"
            >
              {t("profile.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
