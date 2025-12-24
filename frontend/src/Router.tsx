import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/app-layout";
import NotMatch from "./pages/NotMatch";
import BucketList from "./pages/BucketList";
import Archive from "./pages/Archive";

export default function Router() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="" element={<BucketList />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="*" element={<NotMatch />} />
      </Route>
    </Routes>
  );
}
