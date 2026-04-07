import { useState, useEffect, useCallback } from "react";
import "../style/organizations.css";

function Organizations() {
  const [organizations, setOrganizations]       = useState([]);
  const [showOrganizations, setShowOrganizations] = useState(false);
  const [showAddForm, setShowAddForm]             = useState(false);
  const [newOrganizationName, setNewOrganizationName] = useState("");
  const [loading, setLoading]                     = useState(false);
  const [error, setError]                         = useState(null);
  const [submitting, setSubmitting]               = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const token = localStorage.getItem("token");

  // ── reusable fetch ──
  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/organizations", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setOrganizations(data.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // fetch on mount
  useEffect(() => { fetchOrganizations(); }, [fetchOrganizations]);

  // polling every 10s
  useEffect(() => {
    const interval = setInterval(() => fetchOrganizations(), 10000);
    return () => clearInterval(interval);
  }, [fetchOrganizations]);

  // re-fetch on tab focus
  useEffect(() => {
    const handleFocus = () => fetchOrganizations();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchOrganizations]);

  // ── add organization ──
  const handleAddOrganization = async () => {
    if (!newOrganizationName.trim()) return;
    setSubmitting(true);
    setSuccessMessage(null);
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newOrganizationName }),
      });
      if (!response.ok) throw new Error(`Failed to add: ${response.status}`);
      await fetchOrganizations();
      setSuccessMessage(`Organization "${newOrganizationName}" created successfully!`);
      setNewOrganizationName("");
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
        <h2 className="page-title">Organizations</h2>
        <div className="page-actions">
          <button
            className="btn-outline"
            onClick={() => { setShowOrganizations(!showOrganizations); setShowAddForm(false); }}
          >
            {showOrganizations ? "Hide list" : "List organizations"}
          </button>
          <button
            className="btn-primary"
            onClick={() => { setShowAddForm(!showAddForm); setShowOrganizations(false); }}
          >
            + Add organization
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

      {/* ── organizations table ── */}
      {showOrganizations && (
        <div className="table-wrap">
          {loading ? (
            <p className="state-msg">Loading...</p>
          ) : organizations.length === 0 ? (
            <p className="state-msg">No organizations found.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Organization name</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.id}>
                    <td className="td-muted">{org.id}</td>
                    <td>{org.name}</td>
                    <td>
                      <span className={org.is_active ? "badge badge-active" : "badge badge-inactive"}>
                        {org.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
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
          <p className="form-title">New organization</p>
          <div className="form-field">
            <label className="form-label">Organization name</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Acme Corporation"
              value={newOrganizationName}
              onChange={(e) => setNewOrganizationName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddOrganization()}
              autoFocus
            />
          </div>
          <div className="form-actions">
            <button
              className="btn-primary"
              onClick={handleAddOrganization}
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save organization"}
            </button>
            <button
              className="btn-ghost"
              onClick={() => { setShowAddForm(false); setNewOrganizationName(""); setError(null); }}
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

export default Organizations;