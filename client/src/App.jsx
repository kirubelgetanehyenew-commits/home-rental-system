import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Sidebar from "./components/Sidebar";
import TopActions from "./components/TopActions";
import Footer from "./components/Footer";
import EditProperty from "./pages/EditProperty";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Dashboard from "./pages/Dashboard";
import AddProperty from "./pages/AddProperty";
import MyProperties from "./pages/MyProperties";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Bookings from "./pages/Bookings";
import Payments from "./pages/Payments";
import Messages from "./pages/Messages";
import Agreement from "./pages/Agreement";
import AdminUsers from "./pages/AdminUsers";
import AdminProperties from "./pages/AdminProperties";
import AdminReports from "./pages/AdminReports";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <TopActions />

        <div className="app-body">
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/my-properties"
              element={
                <ProtectedRoute>
                  <MyProperties />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-property/:id"
              element={
                <ProtectedRoute>
                  <EditProperty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-property"
              element={
                <ProtectedRoute>
                  <AddProperty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <Payments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agreement/:bookingId"
              element={
                <ProtectedRoute>
                  <Agreement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/properties"
              element={
                <AdminRoute>
                  <AdminProperties />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <AdminReports />
                </AdminRoute>
              }
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
          </Routes>
        </main>

        <Footer />
        </div>
      </div>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;