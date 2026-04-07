import { useState, useEffect } from "react";
import "../style/model.css";

// ─── API CONFIG ───────────────────────────────────────────────────────────────
const API_BASE = "http://127.0.0.1:8000/api/assets";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

const api = {
  getTypes: async () => {
    const res = await fetch(`${API_BASE}/types`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to load asset types");
    const data = await res.json();
    return data.types || [];
  },

  getFields: async (assetType) => {
    const res = await fetch(`${API_BASE}/sample/${assetType}`, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to load fields for this type");
    return res.json();
  },

  saveAsset: async (payload) => {
    const res = await fetch(`${API_BASE}/details1`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    // if (!res.ok) throw new Error(data.detail || "Submission failed");
    if (!res.ok) throw new Error(data.detail || data.message || JSON.stringify(data) || "Submission failed")
    return data;
  },

  // ✅ NEW — GET /api/assets/list?type=selectedType
  getAssetsByType: async (assetType) => {
    const url = assetType
      ? `${API_BASE}/lists?type=${assetType}`
      : `${API_BASE}/lists`;
    //console.log(url,"at the api")

    const res = await fetch(url, { headers: authHeaders() });
    //console.log(res,"at the api")

    // const data1 = await res.json();
    // console.log(data1,"at the data1")
    if (!res.ok) throw new Error("Failed to load assets list");
    const data = await res.json();
    //console.log(data,"Raw list response:") // ← check shape in console

    
    if (Array.isArray(data)) return data;                          // [ {...}, {...} ]
    if (Array.isArray(data.assets)) return data.assets;           // { assets: [...] }
    if (Array.isArray(data.data)) return data.data;               // { data: [...] }
    if (Array.isArray(data.results)) return data.results;         // { results: [...] }
    return [];
  },
};
// ─────────────────────────────────────────────────────────────────────────────

const VIEW = {
  IDLE: "idle",
  FORM: "form",
  LIST: "list",   // ✅ NEW
};

export default function AssetForm() {
  const [assetTypes, setAssetTypes]         = useState([]);
  const [typesLoading, setTypesLoading]     = useState(true);
  const [selectedType, setSelectedType]     = useState("");
  const [view, setView]                     = useState(VIEW.IDLE);

  // FORM state
  const [assetId, setAssetId]               = useState("");
  const [formFields, setFormFields]         = useState({});
  const [formValues, setFormValues]         = useState({});
  const [fieldsLoading, setFieldsLoading]   = useState(false);

  const [loading, setLoading]               = useState(false);
  const [message, setMessage]               = useState(null);
  const [error, setError]                   = useState(null);
  const [submitted, setSubmitted]           = useState(false);

  // ✅ NEW — List state
  const [assetList, setAssetList]           = useState([]);
  const [listLoading, setListLoading]       = useState(false);
  const [listError, setListError]           = useState(null);

  // ── Load types on mount ───────────────────────────────────────────────────
  useEffect(() => {
    setTypesLoading(true);
    api.getTypes()
      .then(setAssetTypes)
      .catch((e) => setError(e.message))
      .finally(() => setTypesLoading(false));
  }, []);

  // ── Type change ───────────────────────────────────────────────────────────
  async function handleTypeChange(type) {
    setSelectedType(type);
    setView(VIEW.IDLE);
    resetFormState();
    setAssetList([]);
    setListError(null);
    setMessage(null);
    setError(null);
  }

  // ── Add New Asset ─────────────────────────────────────────────────────────
  async function handleAddNew() {
    if (!selectedType) return;
    setView(VIEW.FORM);
    resetFormState();
    setError(null);
    setFieldsLoading(true);
    try {
      const schema = await api.getFields(selectedType);
      setFormFields(schema);
      const initValues = Object.fromEntries(
        Object.entries(schema).filter(([k]) => k !== "asset_id").map(([k, v]) =>
          typeof v === "string" ? [k, ""] : [k, v]
        )
      );
      setFormValues(initValues);
    } catch (e) {
      setError(e.message);
      setView(VIEW.IDLE);
    } finally {
      setFieldsLoading(false);
    }
  }

  // ✅ NEW — List of Models handler
  async function handleListModels() {
    
    if (!selectedType) return;
    setView(VIEW.LIST);
    
    setAssetList([]);
    setListError(null);
    setListLoading(true);
    
    try {
      const data = await api.getAssetsByType(selectedType);
      //console.log(data,"at the list of models")
      setAssetList(data);
    } catch (e) {
      // console.log(data,"at the List of Models");
     
      setListError(e.message);
    } finally {
      setListLoading(false);
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!assetId.trim()) {
      setError("Asset ID is required");
      return;
    }
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const payload = {
        type: selectedType,
        asset_id: assetId.trim(),
        ...formValues,
      };
      const result = await api.saveAsset(payload);
      setMessage(result.message || `${selectedType} details added successfully`);
      setSubmitted(true);
      const blank = Object.fromEntries(
        Object.entries(formFields).map(([k, v]) =>
          typeof v === "string" ? [k, ""] : [k, v]
        )
      );
      setFormValues(blank);
      setAssetId("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function resetFormState() {
    setAssetId("");
    setFormFields({});
    setFormValues({});
    setSubmitted(false);
    setMessage(null);
  }

  function handleInputChange(field, value) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  }

  function getInputType(schemaDefault) {
    if (typeof schemaDefault === "number") return "number";
    if (typeof schemaDefault === "boolean") return "checkbox";
    return "text";
  }

  const hasFields = Object.keys(formFields).length > 0;
  const canSubmit = hasFields && !!assetId.trim() && !fieldsLoading && !loading;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="af-root">
      <div className="af-glow af-glow-1" />
      <div className="af-glow af-glow-2" />

      <div className="af-card">

        {/* ── HEADER ── */}
        <header className="af-header">
          <h1 className="af-title">Asset Registry</h1>
          <p className="af-subtitle">Register hardware assets with detailed specs</p>
        </header>

        {/* ── STEP 1: ASSET TYPE ── */}
        <section className="af-section">
          <label className="af-label">Asset Type</label>
          {typesLoading ? (
            <div className="af-loader">
              <span className="af-spinner" />
              <span>Loading types…</span>
            </div>
          ) : (
            <div className="af-select-wrap">
              <select
                className="af-select"
                value={selectedType}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                <option value="">— Choose a type —</option>
                {assetTypes.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ").toUpperCase()}
                  </option>
                ))}
              </select>
              <span className="af-select-chevron">▾</span>
            </div>
          )}
        </section>

        {/* ── ACTION BUTTONS ── */}
        {selectedType && (
          <section className="af-actions" style={{ display: "flex", gap: "10px" }}>

            {/* Add New Asset */}
            <button
              className={`af-action-btn ${view === VIEW.FORM ? "af-action-btn--active" : ""}`}
              onClick={handleAddNew}
            >
              <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
                <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add New Asset
            </button>

            {/* ✅ List of Models — now calls handleListModels */}
            <button
              className={`af-action-btn ${view === VIEW.LIST ? "af-action-btn--active" : ""}`}
              onClick={handleListModels}
            >
              <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
                <path d="M4 6h12M4 10h12M4 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              List of Models
            </button>

          </section>
        )}

        {/* ── FORM VIEW ── */}
        {view === VIEW.FORM && (
          <section className="af-form-section">
            {fieldsLoading && (
              <div className="af-loader">
                <span className="af-spinner" />
                <span>Loading {selectedType.replace(/_/g, " ")} fields…</span>
              </div>
            )}

            {!fieldsLoading && hasFields && (
              <>
                <div className="af-label" style={{ marginBottom: "0.75rem" }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--label)" }}>
                    Asset Details
                  </span>
                </div>

                {/* <div className="af-asset-id-row">
                  <div className="af-field af-field--id">
                    <p className="af-field-hint">Must match an existing asset's model_id in the database</p>
                  </div> */}
                  <div className="af-asset-id-row">
                   <div className="af-field af-field--id">
                      <label className="af-field-label">
                         Asset ID
                        <span className="af-type-badge">num</span>
                      </label>
                     <input
                        className="af-input"
                        type="number"
                        value={assetId}
                        placeholder="Enter asset ID"
                        onChange={(e) => setAssetId(e.target.value)}  
                      />
                     <p className="af-field-hint">Must match an existing asset's model_id in the database</p>
                   </div>
                 </div>
                

                <div className="af-fields-grid">
                  {Object.entries(formValues).filter(([field]) => field !== "asset_id") .map(([field, value]) => {
                    const schemaDefault = formFields[field];
                    const inputType = getInputType(schemaDefault);
                    return (
                      <div key={field} className={`af-field ${inputType === "checkbox" ? "af-field--bool" : ""}`}>
                        <label className="af-field-label">
                          {field.replace(/_/g, " ")}
                          <span className="af-type-badge">
                            {inputType === "number" ? "num" : inputType === "checkbox" ? "bool" : "str"}
                          </span>
                        </label>
                        {inputType === "checkbox" ? (
                          <div className="af-toggle-wrap">
                            <button
                              type="button"
                              className={`af-toggle ${value ? "af-toggle--on" : ""}`}
                              onClick={() => handleInputChange(field, !value)}
                            >
                              <span className="af-toggle-knob" />
                            </button>
                            <span className="af-toggle-label">{value ? "True" : "False"}</span>
                          </div>
                        ) : (
                          <input
                            className="af-input"
                            type={inputType}
                            value={value}
                            placeholder={inputType === "number" ? "0" : `Enter ${field.replace(/_/g, " ")}`}
                            onChange={(e) =>
                              handleInputChange(
                                field,
                                inputType === "number" ? Number(e.target.value) : e.target.value
                              )
                            }
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="af-submit-block">
                  <button
                    className="af-submit-btn"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                  >
                    {loading ? (
                      <span className="af-btn-loading">
                        <span className="af-spinner af-spinner--sm" /> Saving…
                      </span>
                    ) : (
                      <>
                        <svg viewBox="0 0 20 20" fill="none" width="17" height="17">
                          <path d="M3 10l5 5 9-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Save Asset
                      </>
                    )}
                  </button>
                  {!assetId.trim() && (
                    <p className="af-hint">Enter an Asset ID above to enable saving</p>
                  )}
                </div>
              </>
            )}

            {submitted && (
              <div className="af-post-submit">
                <p className="af-post-label">Saved! What's next?</p>
                <div className="af-post-row">
                  <button className="af-post-btn af-post-btn--alt" onClick={handleAddNew}>
                    <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
                      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Add Another
                  </button>
                  <button className="af-post-btn" onClick={() => { setView(VIEW.IDLE); resetFormState(); }}>
                    <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
                      <path d="M4 10h12M10 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Back to Types
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ✅ NEW — LIST VIEW */}
        {view === VIEW.LIST && (
          <section className="af-form-section">

            {/* Loading */}
            {listLoading && (
              <div className="af-loader">
                <span className="af-spinner" />
                <span>Loading {selectedType.replace(/_/g, " ")} assets…</span>
              </div>
            )}

            {/* Error */}
            {listError && (
              <div className="af-msg af-msg--error">{listError}</div>
            )}

            {/* Table */}
            {!listLoading && !listError && assetList.length > 0 && (
              <div style={{ overflowX: "auto", marginTop: "1rem" }}>
                <p style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                  Showing <strong style={{ color: "#94a3b8" }}>{assetList.length}</strong> {selectedType.replace(/_/g, " ")} asset(s)
                </p>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#1e293b" }}>
                      {Object.keys(assetList[0]).map((col) => (
                        <th key={col} style={{
                          padding: "10px 12px", textAlign: "left",
                          color: "#94a3b8", fontWeight: 500,
                          borderBottom: "1px solid #334155",
                          whiteSpace: "nowrap"
                        }}>
                          {col.replace(/_/g, " ").toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assetList.map((asset, i) => (
                      <tr key={i} style={{
                        borderBottom: "1px solid #1e293b",
                        background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)"
                      }}>
                        {Object.values(asset).map((val, j) => (
                          <td key={j} style={{
                            padding: "9px 12px", color: "#e2e8f0",
                            whiteSpace: "nowrap"
                          }}>
                            {typeof val === "boolean"
                              ? (val ? "✅" : "❌")
                              : String(val ?? "—")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Empty state */}
            {!listLoading && !listError && assetList.length === 0 && (
              <p style={{ color: "#64748b", textAlign: "center", padding: "2rem 0" }}>
                No {selectedType.replace(/_/g, " ")} assets found
              </p>
            )}

            {/* Back button */}
            <button
              className="af-post-btn"
              onClick={() => { setView(VIEW.IDLE); setAssetList([]); setListError(null); }}
              style={{ marginTop: "1.5rem" }}
            >
              <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
                <path d="M4 10h12M10 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Types
            </button>

          </section>
        )}

        {/* ── MESSAGES ── */}
        {(message || error) && (
          <div className="af-messages">
            {message && (
              <div className="af-msg af-msg--success">
                <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6.5 10l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {message}
              </div>
            )}
            {error && (
              <div className="af-msg af-msg--error">
                <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10 6v4M10 13v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}