import { useState, useEffect, useCallback } from "react";
import "../style/roles.css";

function Roles() {
  const [roles, setRoles]               = useState([]);
  const [showRoles, setShowRoles]       = useState(false);
  const [showAddForm, setShowAddForm]   = useState(false);
  const [newRoleName, setNewRoleName]   = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const token = localStorage.getItem("token");

  // ── reusable fetch ──
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/roles", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(token,"at the roles")
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setRoles(data.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // fetch on mount
  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  // polling every 10s
  useEffect(() => {
    const interval = setInterval(() => fetchRoles(), 10000);
    return () => clearInterval(interval);
  }, [fetchRoles]);

  // re-fetch on tab focus
  useEffect(() => {
    const handleFocus = () => fetchRoles();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchRoles]);

  // ── add role ──
  const handleAddRole = async () => {
    if (!newRoleName.trim()) return;
    setSubmitting(true);
    setSuccessMessage(null);
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/users/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newRoleName }),
      });
      
      if (!response.ok) throw new Error(`Failed to add: ${response.status}`);
      await fetchRoles();
      setSuccessMessage(`Role "${newRoleName}" created successfully!`);
      setNewRoleName("");
      setShowAddForm(false);
      setTimeout(() => {
        setSuccessMessage(null);
        // setShowAddForm(false);
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">

      {/* ── page header ── */}
      <div className="page-header">
        <h2 className="page-title">Roles</h2>
        <div className="page-actions">
          <button
            className="btn-outline"
            onClick={() => { setShowRoles(!showRoles); setShowAddForm(false); }}
          >
            {showRoles ? "Hide list" : "List roles"}
          </button>
          <button
            className="btn-primary"
            onClick={() => { setShowAddForm(!showAddForm); setShowRoles(false); }}
          >
            + Add role
          </button>
        </div>
        
      </div>
      {successMessage && (
         <div className="success-banner" style={{
              backgroundColor: '#045635',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontWeight: '500'
        }}>
     {successMessage}
  </div>
)}
      

      {/* ── error banner ── */}
      {error && <div className="error-banner">Error: {error}</div>}

      {/* ── roles table ── */}
      {showRoles && (
        <div className="table-wrap">
          {loading ? (
            <p className="state-msg">Loading...</p>
          ) : roles.length === 0 ? (
            <p className="state-msg">No roles found.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Role name</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td className="td-muted">{role.id}</td>
                    <td>{role.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── add form ── */}
      {showAddForm && (
        <div className="form-card">
          <p className="form-title">New role</p>
          <div className="form-field">
            <label className="form-label">Role name</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. manager"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddRole()}
              autoFocus
            />
          </div>
          <div className="form-actions">
            <button
              className="btn-primary"
              onClick={handleAddRole}
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save role"}
            </button>
            <button
              className="btn-ghost"
              onClick={() => { setShowAddForm(false); setNewRoleName(""); setError(null); }}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Roles;