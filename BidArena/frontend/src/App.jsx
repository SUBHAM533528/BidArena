import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import AdminLogin from "./pages/AdminLogin";
import PlayerRegistration from "./pages/PlayerRegistration";
import BroadcastDisplay from "./pages/BroadcastDisplay";
import TeamProfile from "./pages/TeamProfile";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/admin/Dashboard";
import TournamentManagement from "./pages/admin/TournamentManagement";
import TeamManagement from "./pages/admin/TeamManagement";
import TeamsByTournament from "./pages/admin/TeamsByTournament";
import TeamDetail from "./pages/admin/TeamDetail";
import PlayerManagement from "./pages/admin/PlayerManagement";
import AuctionOverview from "./pages/admin/AuctionOverview";
import AuctionRoom from "./pages/admin/AuctionRoom";
import SoldPlayers from "./pages/admin/SoldPlayers";
import UnsoldPlayers from "./pages/admin/UnsoldPlayers";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import ChangePassword from "./pages/admin/ChangePassword";

export default function App() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/" element={<Landing />} />
      <Route path="/team/:teamId" element={<TeamProfile />} />
      <Route path="/watch/:tournamentId" element={<BroadcastDisplay />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/player-registration" element={<PlayerRegistration />} />

      {/* ── Admin ── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["super_admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="tournaments"    element={<TournamentManagement />} />
        <Route path="teams"          element={<TeamManagement />} />
        <Route path="teams/tournament/:tournamentId" element={<TeamsByTournament />} />
        <Route path="teams/:teamId"  element={<TeamDetail />} />
        <Route path="players"        element={<PlayerManagement />} />
        <Route path="auction"        element={<AuctionOverview />} />
        <Route path="auction/:tournamentId" element={<AuctionRoom />} />
        <Route path="sold"           element={<SoldPlayers />} />
        <Route path="unsold"         element={<UnsoldPlayers />} />
        <Route path="reports"        element={<Reports />} />
        <Route path="settings"       element={<Settings />} />
        <Route path="change-password"element={<ChangePassword />} />
      </Route>
    </Routes>
  );
}
