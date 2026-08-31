import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import API from "../services/api";

function StatCard({ label, value, link }) {
  return (
    <Link
      to={link || "#"}
      className="bg-white shadow rounded-lg p-6 transition hover:-translate-y-0.5 dark:bg-zinc-900 dark:shadow-black/30"
    >
      <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">
        {value}
      </p>
      <p className="text-stone-600 mt-2 dark:text-zinc-400">{label}</p>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLang();

  const [stats, setStats] = useState(null);
  const [adminStats, setAdminStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await API.get("/stats/me");
        setStats(res.data.stats);
      } catch (err) {
        console.error(err);
      }
    };

    const loadAdminStats = async () => {
      if (user?.role !== "admin") return;

      try {
        const res = await API.get("/stats/admin");
        setAdminStats(res.data.stats);
      } catch (err) {
        console.error(err);
      }
    };

    loadStats();
    loadAdminStats();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">

      <h1 className="text-4xl font-bold mb-6">
        {t("dash.title")}
      </h1>

      {user ? (
        <>
          <div className="bg-white shadow rounded-lg p-6 mb-8 dark:bg-zinc-900 dark:shadow-black/30">

            <h2 className="text-2xl font-bold">
              {t("dash.welcome")}, {user.fullName}
            </h2>

            <p className="mt-3 text-stone-600 dark:text-zinc-400">
              {t("dash.email")}: {user.email}
            </p>

            <p className="capitalize text-stone-600 dark:text-zinc-400">
              {t("dash.role")}: {user.role}
            </p>

          </div>

          {/* ============ My Stats ============ */}
          <h3 className="text-xl font-bold mb-4">{t("dash.overview")}</h3>

          {stats ? (
            <div className="grid gap-4 md:grid-cols-4 mb-10">
              <StatCard
                label={t("dash.favorites")}
                value={stats.favorites}
                link="/favorites"
              />

              <StatCard
                label={t("dash.viewingRequests")}
                value={stats.myBookings}
                link="/bookings"
              />

              {user.role !== "tenant" && (
                <StatCard
                  label={t("dash.myProperties")}
                  value={stats.myProperties}
                  link="/my-properties"
                />
              )}

              {user.role !== "tenant" ? (
                <StatCard
                  label={t("dash.pendingRequests")}
                  value={stats.pendingRequests}
                  link="/bookings"
                />
              ) : (
                <StatCard
                  label={t("dash.reviewsWritten")}
                  value={stats.myReviews}
                />
              )}
            </div>
          ) : (
            <p className="text-stone-500 mb-10 dark:text-zinc-400">
              {t("dash.loadingStats")}
            </p>
          )}

          {/* ============ Admin Panel ============ */}
          {user.role === "admin" && (
            <div>
              <h3 className="text-xl font-bold mb-4">{t("dash.adminOverview")}</h3>

              {adminStats ? (
                <>
                  <div className="grid gap-4 md:grid-cols-4 mb-6">
                    <StatCard label={t("dash.totalUsers")} value={adminStats.totalUsers} />
                    <StatCard label={t("dash.landlords")} value={adminStats.totalLandlords} />
                    <StatCard
                      label={t("dash.activeProperties")}
                      value={`${adminStats.activeProperties} / ${adminStats.totalProperties}`}
                    />
                    <StatCard label={t("dash.totalReviews")} value={adminStats.totalReviews} />
                  </div>

                  <div className="bg-white shadow rounded-lg p-6 dark:bg-zinc-900 dark:shadow-black/30">
                    <h4 className="font-bold mb-3">
                      {t("dash.pendingViewings")}: {adminStats.pendingBookings}
                    </h4>

                    <h4 className="font-bold mb-3">{t("dash.recentUsers")}</h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-stone-200 text-sm text-stone-500 dark:border-zinc-700 dark:text-zinc-400">
                            <th className="py-2">{t("dash.name")}</th>
                            <th className="py-2">{t("form.email")}</th>
                            <th className="py-2">{t("dash.role")}</th>
                            <th className="py-2">{t("dash.joined")}</th>
                          </tr>
                        </thead>

                        <tbody>
                          {adminStats.recentUsers.map((u) => (
                            <tr
                              key={u._id}
                              className="border-b border-stone-100 dark:border-zinc-800"
                            >
                              <td className="py-2">{u.fullName}</td>
                              <td className="py-2">{u.email}</td>
                              <td className="py-2 capitalize">{u.role}</td>
                              <td className="py-2">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-stone-500 dark:text-zinc-400">
                  {t("dash.loadingStats")}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <p>{t("dash.notLoggedIn")}</p>
      )}

    </div>
  );
}
