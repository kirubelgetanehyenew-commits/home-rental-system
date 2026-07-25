import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">

      <h1 className="text-4xl font-bold mb-6">
        Dashboard
      </h1>

      {user ? (
        <div className="bg-white shadow rounded-lg p-6">

          <h2 className="text-2xl font-bold">
            Welcome, {user.fullName}
          </h2>

          <p className="mt-3">
            Email: {user.email}
          </p>

          <p>
            Role: {user.role}
          </p>

        </div>
      ) : (
        <p>You are not logged in.</p>
      )}

    </div>
  );
}