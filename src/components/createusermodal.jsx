import { useState } from "react";
import "../style/createusermodel.css";

function CreateUserModal({ onClose }) {
  const [firstName, setFirstName]               = useState("");
  const [lastName, setLastName]                 = useState("");
  const [regEmail, setRegEmail]                 = useState("");
  const [number, setNumber]                     = useState("");
  const [roleName, setRoleName]                 = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [isSuperUser, setIsSuperUser]           = useState(false);
  const [isActive, setIsActive]                 = useState(true);
  const [regPassword, setRegPassword]           = useState("");
  const [regLoading, setRegLoading]             = useState(false);
  const [regError, setRegError]                 = useState(null);
  const [regSuccess, setRegSuccess]             = useState(false);

  const token        = localStorage.getItem("token");
  const isSuperAdmin = roleName === "superadmin";

  // ── superadmin role rules ──
  const handleRoleChange = (e) => {
    const role = e.target.value;
    setRoleName(role);
    if (role === "superadmin") {
      setOrganizationName("");
      setIsSuperUser(true);
    } else {
      setIsSuperUser(false);
    }
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setRegEmail("");
    setNumber("");
    setRoleName("");
    setOrganizationName("");
    setIsSuperUser(false);
    setIsActive(true);
    setRegPassword("");
    setRegError(null);
    setRegSuccess(false);
  };

  // ── create user handler ──
  const handleCreate = async () => {
    if (
      !firstName.trim() ||
      !lastName.trim()  ||
      !regEmail.trim()  ||
      !number.trim()    ||
      !roleName.trim()  ||
      !regPassword.trim()
    ) {
      setRegError("Please fill in all required fields.");
      return;
    }
    if (!isSuperAdmin && !organizationName.trim()) {
      setRegError("Organization name is required.");
      return;
    }

    // phone length check — backend column is VARCHAR(15)
    if (number.replace(/\s/g, "").length > 15) {
      setRegError("Phone number must be 15 characters or fewer.");
      return;
    }

    setRegLoading(true);
    setRegError(null);

    try {
      const payload = {
        first_name:        firstName,
        last_name:         lastName,
        email:             regEmail,
        number:            number,
        role_name:         roleName,
        organization_name: isSuperAdmin ? null : organizationName,
        is_super_user:     isSuperAdmin ? true : isSuperUser,
        is_active:         isActive,
        password:          regPassword,
      };

      const response = await fetch("http://127.0.0.1:8000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      setRegSuccess(true);
      resetForm();

      // auto-close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      setRegError("Failed to create user. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  // close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-box">

        {/* ── modal header ── */}
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">Admin action</div>
            <h2 className="modal-title">Create user</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* ── banners ── */}
        {regError   && <div className="modal-error">{regError}</div>}
        {regSuccess && (
          <div className="modal-success">
            User created successfully! Closing...
          </div>
        )}

        {/* ── form ── */}
        <div className="modal-body">

          {/* first + last name */}
          <div className="field-row-2">
            <div className="field-wrap">
              <label className="field-label">First name <span className="req">*</span></label>
              <input
                className="field-input"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="field-wrap">
              <label className="field-label">Last name <span className="req">*</span></label>
              <input
                className="field-input"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          {/* email */}
          <div className="field-wrap">
            <label className="field-label">Email <span className="req">*</span></label>
            <input
              className="field-input"
              type="email"
              placeholder="you@example.com"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
            />
          </div>

          {/* phone */}
          <div className="field-wrap">
            <label className="field-label">Phone number <span className="req">*</span></label>
            <input
              className="field-input"
              type="text"
              placeholder="+91 98765 43210"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>

          {/* role */}
          <div className="field-wrap">
            <label className="field-label">Role <span className="req">*</span></label>
            <select
              className="field-input field-select"
              value={roleName}
              onChange={handleRoleChange}
            >
              <option value="" disabled>Select a role</option>
              <option value="superadmin">Superadmin</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          {/* organization — disabled for superadmin */}
          <div className="field-wrap">
            <label className="field-label">
              Organization name
              {isSuperAdmin && (
                <span className="field-badge">Not required for superadmin</span>
              )}
            </label>
            <input
              className={`field-input ${isSuperAdmin ? "field-input-disabled" : ""}`}
              type="text"
              placeholder={isSuperAdmin ? "N/A — superadmin has no org" : "Organization name"}
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              disabled={isSuperAdmin}
            />
          </div>

          {/* is_super_user */}
          <div className="field-wrap">
            <label className="field-label">Is super user</label>
            {isSuperAdmin ? (
              <div className="field-input field-input-disabled field-locked">
                <span className="locked-value">True</span>
                <span className="locked-hint">Auto-set for superadmin</span>
              </div>
            ) : (
              <select
                className="field-input field-select"
                value={isSuperUser.toString()}
                onChange={(e) => setIsSuperUser(e.target.value === "true")}
              >
                <option value="false">False</option>
                <option value="true">True</option>
              </select>
            )}
          </div>

          {/* is_active */}
          <div className="field-wrap">
            <label className="field-label">Is active</label>
            <select
              className="field-input field-select"
              value={isActive.toString()}
              onChange={(e) => setIsActive(e.target.value === "true")}
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>

          {/* password */}
          <div className="field-wrap">
            <label className="field-label">Password <span className="req">*</span></label>
            <input
              className="field-input"
              type="password"
              placeholder="••••••••"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>

        </div>

        {/* ── footer ── */}
        <div className="modal-footer">
          <button
            className="btn-create"
            onClick={handleCreate}
            disabled={regLoading || regSuccess}
          >
            {regLoading ? (
              <span className="btn-loading">
                <span className="spinner" /> Creating...
              </span>
            ) : (
              "Create user"
            )}
          </button>
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={regLoading}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

export default CreateUserModal;