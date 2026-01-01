import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/app-layout";
import NotMatch from "./pages/NotMatch";
import BucketList from "./pages/BucketList";
import Archive from "./pages/Archive";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

export default function Router() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="" element={<BucketList />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="*" element={<NotMatch />} />
      </Route>
    </Routes>
  );
}
