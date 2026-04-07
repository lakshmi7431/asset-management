import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // ← add Navigate
import Layout from "./components/layout";
import Assets from "./components/assets";
import Organizations from "./components/organizations";
import Roles from "./components/roles";
import Main from "./components/main1";
import Users from "./components/users";
import Model from "./components/model";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Layout />}>
          <Route index element={<Main />} />
          <Route path="roles"         element={<Roles />} />
          <Route path="organizations" element={<Organizations />} />
          <Route path="assets"        element={<Assets />} />
          <Route path="users"         element={<Users />} />
          <Route path="models"        element={<Model />} />
          <Route path="*"             element={<Navigate to="/assets" replace />} /> {/* ← add this */}
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;