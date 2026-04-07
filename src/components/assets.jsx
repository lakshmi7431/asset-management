import { useState, useEffect, useCallback } from "react";
import "../style/assets.css";

const STATUS = ["active", "In repair", "retired"];

const EMPTY_ASSET = {
  model_id: "",
  serial_number: "",
  purchase_date: "",
  warranty_expiry: "",
  current_status:"",
  asset_type:"",
  asset_id:"",
  asset_status:"",
  org_name:"",
};


const EMPTY_ASSIGN = {
  asset_id: "",
  user_id: "",
  assignment_date: new Date().toISOString().slice(0, 10),
};

function Assets() {
 
  const [assets, setAssets]             = useState([]);
  const [showList, setShowList]         = useState(false);
  const [loading, setLoading]           = useState(false);


  const [showAddForm, setShowAddForm]   = useState(false);
  const [addForm, setAddForm]           = useState(EMPTY_ASSET);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError]         = useState(null);

 
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignForm, setAssignForm]         = useState(EMPTY_ASSIGN);
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignError, setAssignError]       = useState(null);

  const [showLog, setShowLog]           = useState(false);
  const [log, setLog]                   = useState([]);
  const [logLoading, setLogLoading]     = useState(false);

  const [error, setError]               = useState(null);

  const token = localStorage.getItem("token");

  
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/assets/api/assets",
         {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        
      });
      
      // console.log(token,"at the assets")
      // console.log(Authorization);
      // console.log(response.data);
      // return response;
      if (!response.ok) throw new Error(`Server error: ${response.current_status}`);
      const data = await response.json();
      //console.log(data,"at the get assets")
      // backend returns array directly or wrapped in data
      setAssets(Array.isArray(data) ? data : (data.data ?? []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);
//  console.log(token,"at the asset")
  // fetch on mount
  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  // polling every 10s
  useEffect(() => {
    const interval = setInterval(() => fetchAssets(), 10000);
    return () => clearInterval(interval);
  }, [fetchAssets]);

  // re-fetch on tab focus
  useEffect(() => {
    const handleFocus = () => fetchAssets();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchAssets]);

  // ── fetch asset log ──
  const fetchLog = useCallback(async () => {
    setLogLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/assets/logs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
     
        },
        
      });
      
      console.log(token)
      if (!response.ok) throw new Error(`Server error: ${response.status}`); 
      const data = await response.json();
      const allAssets = Array.isArray(data) ? data : (data.data ?? []);
      setLog(allAssets); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLogLoading(false);
    }
  }, [token]);

  // ── add asset form field change ──
 function handleAddChange(e) {
  const { name, value } = e.target;

  setAddForm((prev) => ({
    ...prev,
    [name]: name === "model_id" ? Number(value) : value
  }));
}
   
  // ── submit new asset ──
  const handleAddAsset = async () => {
    const { model_id, serial_number, purchase_date, warranty_expiry, current_status,asset_type,org_name } = addForm;
    if (!model_id || !serial_number || !purchase_date ||  !warranty_expiry || !current_status||!asset_type||!org_name) {
      //console.log(model_id, serial_number, purchase_date, asset_id, warranty_expiry, current_status,asset_type);
      //console.log(typeof model_id, typeof serial_number, typeof purchase_date, typeof asset_id, typeof warranty_expiry, typeof current_status);
      setAddError("Please fill in all required fields.");
      
      return;
    }
    setAddSubmitting(true);
    setAddError(null);
    try {
      const payload = {
        ...addForm,
        model_id: parseInt(addForm.model_id, 10),
        // cost: parseFloat(addForm.cost),
      };
      const response = await fetch("http://127.0.0.1:8000/api/assets/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      //console.log(token);
      // console.log(response.data);
      const data = await response.json();
      console.log(data);
      if (!response.ok) throw new Error(`Failed to add: ${response.status}`);
      await fetchAssets();
      setAddForm(EMPTY_ASSET);
      setShowAddForm(false);
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAddSubmitting(false);
    }
    // console.log(response,"at the post api of assets")
  };


  // ── assign form field change ──
  const handleAssignChange = (e) => {
    setAssignForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── submit assignment ──
  const handleAssign = async () => {
    const { asset_id, user_id, assignment_date } = assignForm;
    if (!asset_id || !user_id || !assignment_date) {
      setAssignError("All fields are required.");
      return;
    }
    setAssignSubmitting(true);
    setAssignError(null);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/assets/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(assignForm),
      });
      console.log('before the failed to assign')
      if (!response.ok) throw new Error(`Failed to assign: ${response.current_status}`);
      await fetchAssets();
      console.log('after the fetch Assets')
      setAssignForm(EMPTY_ASSIGN);
      setShowAssignForm(false);
    } catch (err) {
      setAssignError(err.message);
    } finally {
      setAssignSubmitting(false);
    }
  };

  // ── free assets for assign dropdown ──
 // const freeAssets = assets.filter((a) => !a.is_allocated);
  const freeAssets=assets.filter((a)=>a.asset_status!== "assigned");
  // console.log(freeAssets,"at free assets")
  // ── close all panels then open the selected one ──
  const openPanel = (panel) => {
    setShowList(panel === "list");
    setShowAddForm(panel === "add");
    setShowAssignForm(panel === "assign");
    setShowLog(panel === "log");
    if (panel === "log") fetchLog();
    setError(null);
    setAddError(null);
    setAssignError(null);
  };
// after const [error, setError] = useState(null);
const [users, setUsers] = useState([]);

useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : (data.data ?? []));
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };
  fetchUsers();
}, [token]);
  return (
    <div className="page">

      {/* ── page header ── */}
      <div className="page-header">
        <h2 className="page-title">Assets</h2>
        <div className="page-actions">
          <div className="list-assest">
          <button
            className={showList ? "btn-outline active" : "btn-outline"}
            onClick={() => openPanel(showList ? null : "list")}
          >
            List assets
          </button></div>
          <button
            className={showAddForm ? "btn-primary active" : "btn-primary"}
            onClick={() => openPanel(showAddForm ? null : "add")}
          >
            + Add asset
          </button>
          <button
            className={showAssignForm ? "btn-outline active" : "btn-outline"}
            onClick={() => openPanel(showAssignForm ? null : "assign")}
          >
            Assign asset
          </button>
          <button
            className={showLog ? "btn-outline active" : "btn-outline"}
            onClick={() => openPanel(showLog ? null : "log")}
          >
            Asset log
          </button>
        </div>
      </div>

      {/* ── global error banner ── */}
      {error && <div className="error-banner">Error: {error}</div>}

      {/* ══ LIST ASSETS ══ */}
      {showList && (
        <div className="table-wrap">
          {loading ? (
            <p className="state-msg">Loading...</p>
          ) : assets.length === 0 ? (
            <p className="state-msg">No assets found.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Serial no.</th>
                  <th>Model ID</th>
                  <th>Asset_id</th>
                  <th>Purchase_date</th>
                  <th>Warranty_date</th>
                  <th>Status</th>
                  <th>Asset_type</th>
                  <th>organization_name</th>
                  <th>Asset_status</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  
                  <tr key={asset.id}>
                    <td className="td-mono">{asset.serial_number}</td>
                    <td className="td-muted">{asset.model_id}</td>
                    <td>{asset.asset_id}</td>
                  
                    <td className="td-muted">{asset.purchase_date}</td>
                    <td className="td-muted">{asset.warranty_expiry}</td>
                    <td className="td-muted">{asset.current_status}</td>
                    <td className="td-muted">{asset.asset_type}</td>
                    <td className="td-muted">{asset.organization_name}</td>
                    <td className="td-muted">{asset.asset_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ══ ADD ASSET FORM ══ */}
      {showAddForm && (
        <div className="form-card">
          <p className="form-title">Add new asset</p>
          {addError && <div className="error-banner">{addError}</div>}

          <div className="form-row-2">
            <div className="form-field">
              <label className="form-label">Model ID <span className="required">*</span></label>
              <input
                className="form-input"
                type="number"
                name="model_id"
                placeholder="e.g. 5"
                value={addForm.model_id}
                onChange={handleAddChange}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Serial number <span className="required">*</span></label>
              <input
                className="form-input"
                type="text"
                name="serial_number"
                placeholder="21k1a07"
                value={addForm.serial_number}
                onChange={handleAddChange}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label className="form-label">Purchase date <span className="required">*</span></label>
              <input
                className="form-input"
                type="date"
                name="purchase_date"
                value={addForm.purchase_date}
                onChange={handleAddChange}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Warranty expiry</label>
              <input
                className="form-input"
                type="date"
                name="warranty_expiry"
                value={addForm.warranty_expiry}
                onChange={handleAddChange}
              />
            </div>
          </div>

          <div className="form-row-2">
            
            <div className="form-field">
              <label className="form-label">Status <span className="required">*</span></label>
              <select
                className="form-input form-select"
                name="current_status"
                value={addForm.current_status}
                onChange={handleAddChange}
              >
                <option value="" disabled>Select status</option>
                {STATUS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Asset_id <span className="required">*</span></label>
            <input
              className="form-input"
              type="number"
              name="asset_id"
              placeholder="e.g.7"
              value={addForm.asset_id}
              onChange={handleAddChange}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Asset_type<span className="required">*</span></label>
            <input
              className="form-input"
              type="text"
              name="asset_type"
              placeholder="e.g. Laptop"
              value={addForm.asset_type}
              onChange={handleAddChange}
            />
          </div>
          <div className="form-field">
            <label className="form-label">ORGANIZATION_NAME <span className="required">*</span></label>
            <input
              className="form-input"
              type="text"
              name="org_name"
              placeholder="e.g.maa"
              value={addForm.org_id}
              onChange={handleAddChange}
            />
          </div>
          <div className="form-actions">
            <button
              className="btn-primary"
              onClick={handleAddAsset}
              disabled={addSubmitting}
            >
              {addSubmitting ? "Saving..." : "Save asset"}
            </button>
            <button
              className="btn-ghost"
              onClick={() => { setShowAddForm(false); setAddForm(EMPTY_ASSET); setAddError(null); }}
              disabled={addSubmitting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ══ ASSIGN ASSET FORM ══ */}
      {showAssignForm && (
        <div className="form-card">
          <p className="form-title">Assign asset to user</p>
          {assignError && <div className="error-banner">{assignError}</div>}

          {freeAssets.length === 0 && !loading && (
            <div className="info-banner">No free assets available to assign.</div>
          )}

          <div className="form-field">
            <label className="form-label">Asset <span className="required">*</span></label>
            <select
              className="form-input form-select"
              name="asset_id"
              value={assignForm.asset_id}
              onChange={handleAssignChange}
            > 
              <option value="" disabled>Select a free asset</option>
              {freeAssets.map((a) => (
                <option key={a.asset_id} value={a.asset_id}>
                  {/* {a.serial_number} */}
                  {a.asset_type}
                </option>
              ))}
           </select>
          </div>

          <div className="form-field">
             <label className="form-label">User <span className="required">*</span></label>
              <select
                    className="form-input form-select"
                    name="user_id"
                    value={assignForm.user_id}
                    onChange={handleAssignChange}
              >
             <option value="" disabled>Select a user</option>
                  {users.map((u) => (
             <option key={u.id} value={u.id}>
                {u.first_name} {u.last_name}
             </option>
              ))}
             </select>
          </div>

          <div className="form-field">
            <label className="form-label">Assignment date <span className="required">*</span></label>
            <input
              className="form-input"
              type="date"
              name="assignment_date"
              value={assignForm.assignment_date}
              onChange={handleAssignChange}
            />
          </div>

          <div className="form-actions">
            <button
              className="btn-primary"
              onClick={handleAssign}
              disabled={assignSubmitting || freeAssets.length === 0}
            >
              {assignSubmitting ? "Assigning..." : "Assign"}
            </button>
            <button
              className="btn-ghost"
              onClick={() => { setShowAssignForm(false); setAssignForm(EMPTY_ASSIGN); setAssignError(null); }}
              disabled={assignSubmitting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ══ ASSET LOG ══ */}
      {showLog && (
        <div className="table-wrap">
          <p className="log-note">Showing  assigned assets only.</p>
         
          {logLoading ? (
            <p className="state-msg">Loading log...</p>
          ) : log.length === 0 ? (
            <p className="state-msg">No assigned assets found.</p>
          ) : (
            <table className="data-table">
              <thead>  
                <tr>
                  <th>Log ID</th>
                  <th>Asset ID</th>
                  <th>Assigned Date</th>
                  <th>Return Date</th>
                  <th>User ID</th>
                </tr>
              </thead>
              <tbody>
                {log.map((asset_management) => (
                  <tr key={asset_management.log_id}>
                    <td className="td-mono">{asset_management.log_id}</td>
                    <td className="td-mono">{asset_management.asset_id}</td>
                    <td className="td-muted">{asset_management.assigned_date}</td>
                    <td>{asset_management.return_date}</td>
                    <td className="td-muted">{asset_management.user_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  );
}

export default Assets;