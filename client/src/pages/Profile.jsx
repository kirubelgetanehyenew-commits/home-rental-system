import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import API from "../services/api";

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white p-3 text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-100 dark:placeholder:text-zinc-500";

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
    <div className="max-w-3xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-6">{t("profile.title")}</h1>

      {message && (
        <div className="mb-4 p-3 rounded bg-stone-100 dark:bg-zinc-800">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className={inputClass}
          placeholder={t("form.fullName")}
          required
        />

        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={inputClass}
          placeholder={t("form.phone")}
        />

        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={inputClass}
          placeholder={t("profile.address")}
        />

        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          className={inputClass}
          placeholder={t("profile.bio")}
          rows={4}
        />

        <div className="space-y-2">
          <label className="block text-sm text-stone-500 dark:text-zinc-400">
            {t("profile.avatar")}
          </label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-stone-200 overflow-hidden dark:bg-zinc-800">
              {avatarPreview || formData.profileImage ? (
                <img src={avatarPreview || formData.profileImage} alt="avatar" className="w-full h-full object-cover" />
              ) : null}
            </div>

            <input type="file" accept="image/*" onChange={handleAvatarChange} />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-full bg-orange-500 px-6 py-2 text-white font-semibold hover:bg-orange-600"
          >
            {t("profile.save")}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border border-stone-300 px-6 py-2 hover:border-orange-400 dark:border-zinc-700 dark:hover:border-orange-400"
          >
            {t("profile.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
