import { useState, useEffect, useCallback } from "react";
import { useNavigate,useLocation } from "react-router-dom";

import "../style/users.css";

// ── initial add-user form state ──
const EMPTY_FORM = {
  first_name:        "",
  last_name:         "",
  email:             "",
  number:            "",
  role_name:         "",
  organization_name: "",
  is_super_user:     false,
  is_active:         true,
  password:          "",
};

function Users() {
  const navigate = useNavigate();
  const location=useLocation();
  // ── check superuser access ──
  const token = localStorage.getItem("token");

  // decode JWT to verify superuser on this page too
  // let isSuperUser = false;
  // try {
  //   const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  //   isSuperUser = payload.is_super_user === true || payload.role === "superadmin";
  // } catch {
  //   isSuperUser = false;
  // }
 useEffect(() => {
    if (location.state?.openAddUser) {
      openPanel("add");
      // clear the state so refresh doesn't re-open it
      navigate("/users", { replace: true, state: {} });
    }
  }, [location.state]);
  // redirect non-superusers away
  // useEffect(() => {
  //   if (!isSuperUser) navigate("/");
  // }, [isSuperUser, navigate]);

  // ── list state ──
  const [users, setUsers]           = useState([]);
  const [showList, setShowList]     = useState(false);
  const [loading, setLoading]       = useState(false);

  // ── add form state ──
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // ── global error ──
  const [error, setError]           = useState(null);

  const isSuperAdminRole = form.role_name === "superadmin";

  // ── fetch users ──
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : (data.data ?? []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // fetch on mount
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // polling every 10s
  useEffect(() => {
    const id = setInterval(() => fetchUsers(), 10000);
    return () => clearInterval(id);
  }, [fetchUsers]);

  // re-fetch on tab focus
  useEffect(() => {
    const fn = () => fetchUsers();
    window.addEventListener("focus", fn);
    return () => window.removeEventListener("focus", fn);
  }, [fetchUsers]);

  // ── form field change ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // superadmin rules
      if (name === "role_name") {
        if (value === "superadmin") {
          updated.organization_name = "";
          updated.is_super_user = true;
        } else {
          updated.is_super_user = false;
        }
      }
      return updated;
    });
  };

  // ── submit new user ──
  const handleAddUser = async () => {
    const { first_name, last_name, email, number, role_name, password } = form;
    if (!first_name.trim() || !last_name.trim() || !email.trim() ||
        !number.trim() || !role_name.trim() || !password.trim()) {
      setFormError("Please fill in all required fields.");
      
      return;
    }
    if (!isSuperAdminRole && !form.organization_name.trim()) {
      setFormError("Organization name is required for non-superadmin roles.");
      return;
    }
    if (number.replace(/\s/g, "").length > 15) {
      setFormError("Phone number must be 15 characters or fewer.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        ...form,
        organization_name: isSuperAdminRole ? null : form.organization_name,
        is_super_user:     isSuperAdminRole ? true : form.is_super_user,
        is_active:         form.is_active === "true" || form.is_active === true,
      };

      const response = await fetch("http://127.0.0.1:8000/api/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      console.log("Create user response status:", response);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      
      setFormSuccess(true);
      setForm(EMPTY_FORM);
      await fetchUsers();

      setTimeout(() => {
        setFormSuccess(false);
        setShowForm(false);
      }, 2000);
    console.log
    } catch (err) {
      
      setFormError("Failed to create user. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openPanel = (panel) => {
    setShowList(panel === "list");
    setShowForm(panel === "add");
    setFormError(null);
    setFormSuccess(false);
    setError(null);
  };

  // if (!isSuperUser) return null;

  return (
    <div className="page">

      {/* ── page header ── */}
      <div className="page-header">
        <h2 className="page-title">Users</h2>
        <div className="page-actions">
          <button
            className={showList ? "btn-outline active" : "btn-outline"}
            onClick={() => openPanel(showList ? null : "list")}
          >
            List users
          </button>
          <button
            className={showForm ? "btn-primary active" : "btn-primary"}
            onClick={() => openPanel(showForm ? null : "add")}
          >
            + Add new user
          </button>
        </div>
      </div>

      {/* ── global error ── */}
      {error && <div className="error-banner">Error: {error}</div>}

      {/* ══ USERS TABLE ══ */}
      {showList && (
        <div className="table-wrap">
          {loading ? (
            <p className="state-msg">Loading...</p>
          ) : users.length === 0 ? (
            <p className="state-msg">No users found.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>User_id</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Super user</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.first_name} {u.last_name}</td>
                    <td className="td-muted">{u.email}</td>
                    <td className="td-muted">{u.number}</td>
                    <td>
                      <span className={u.is_super_user ? "badge badge-super" : "badge badge-regular"}>
                        {u.is_super_user ? "Yes" : "No"}
                      </span>
                    </td>
                    <td>
                      <span className={u.is_active ? "badge badge-active" : "badge badge-inactive"}>
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                   
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ══ ADD USER FORM ══ */}
      {showForm && (
        <div className="form-card">
          <p className="form-title">New user</p>

          {formError   && <div className="error-banner">{formError}</div>}
          {formSuccess && <div className="success-banner">User created successfully!</div>}

          {/* first name + last name */}
          <div className="form-row-2">
            <div className="form-field">
              <label className="form-label">First name <span className="required">*</span></label>
              <input className="form-input" type="text" name="first_name"
                placeholder="John" value={form.first_name} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label className="form-label">Last name <span className="required">*</span></label>
              <input className="form-input" type="text" name="last_name"
                placeholder="Doe" value={form.last_name} onChange={handleChange} />
            </div>
          </div>

          {/* email */}
          <div className="form-field">
            <label className="form-label">Email <span className="required">*</span></label>
            <input className="form-input" type="email" name="email"
              placeholder="you@example.com" value={form.email} onChange={handleChange} />
          </div>

          {/* phone */}
          <div className="form-field">
            <label className="form-label">Phone number <span className="required">*</span></label>
            <input className="form-input" type="text" name="number"
              placeholder="+91 98765 43210" value={form.number} onChange={handleChange} />
          </div>

          {/* role */}
          <div className="form-field">
            <label className="form-label">Role <span className="required">*</span></label>
            <select className="form-input form-select" name="role_name"
              value={form.role_name} onChange={handleChange}>
              <option value="" disabled>Select a role</option>
              <option value="superadmin">Superadmin</option>
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          {/* organization — disabled for superadmin */}
          <div className="form-field">
            <label className="form-label">
              Organization name
              {isSuperAdminRole && (
                <span className="field-badge">Not required for superadmin</span>
              )}
            </label>
            <input
              className={`form-input ${isSuperAdminRole ? "form-input-disabled" : ""}`}
              type="text"
              name="organization_name"
              placeholder={isSuperAdminRole ? "N/A — superadmin has no org" : "Organization name"}
              value={form.organization_name}
              onChange={handleChange}
              disabled={isSuperAdminRole}
            />
          </div>

          {/* is_super_user */}
          <div className="form-field">
            <label className="form-label">Is super user</label>
            {isSuperAdminRole ? (
              <div className="form-input form-input-disabled form-locked">
                <span className="locked-value">True</span>
                <span className="locked-hint">Auto-set for superadmin</span>
              </div>
            ) : (
              <select className="form-input form-select" name="is_super_user"
                value={form.is_super_user.toString()} onChange={handleChange}>
                <option value="false">False</option>
                <option value="true">True</option>
              </select>
            )}
          </div>

          {/* is_active */}
          <div className="form-field">
            <label className="form-label">Is active</label>
            <select className="form-input form-select" name="is_active"
              value={form.is_active.toString()} onChange={handleChange}>
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>

          {/* password */}
          <div className="form-field">
            <label className="form-label">Password <span className="required">*</span></label>
            <input className="form-input" type="password" name="password"
              placeholder="••••••••" value={form.password} onChange={handleChange}
              onKeyDown={(e) => e.key === "Enter" && handleAddUser()} />
          </div>

          <div className="form-actions">
            <button className="btn-primary" onClick={handleAddUser} disabled={submitting || formSuccess}>
              {submitting ? "Creating..." : "Create user"}
            </button>
            <button className="btn-ghost"
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError(null); }}
              disabled={submitting}>
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Users;