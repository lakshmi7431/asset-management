import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserAvatar from "./UseAvatar";

export default function Header() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const dropdownRef = useRef(null);
  const navigate = useNavigate(); // ✅ FIXED

  // ✅ Fetch user
  useEffect(() => {
    let isMounted = true; // prevents memory leaks

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/");
          return;
        }

        const res = await fetch("http://127.0.0.1:8000/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Unauthorized");
        }

        const json = await res.json();
        const userData = json.data || json.user || json;

        if (isMounted) {
          setUser(userData);
        }

      } catch (err) {
        console.error("Failed to fetch user:", err);
        navigate("/");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    // navigate("/"); // ✅ better than window reload
     window.location.href = "/";
  };

  // ✅ Loading state
  if (loading) {
    return (
      <header style={{ padding: "1rem", color: "white" }}>
        Loading profile...
      </header>
    );
  }

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 1.5rem",
        height: 76,
        fontSize: 14,
        color: "white",
        borderBottom: "0.5px solid #e0e0e0",
        background: "#334155",
      }}
    >
      <span style={{ fontWeight: 500, fontSize: 15 }}>
        Asset management
      </span>

      {user && (
        <div ref={dropdownRef} style={{ position: "relative" }}>
          {/* Profile button */}
          <button
            onClick={() => setOpen(!open)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 10px",
              border: "0.5px solid #ddd",
              borderRadius: 8,
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <UserAvatar
              name={`${user.first_name || ""} ${user.last_name || ""}`}
            />

            <div style={{ textAlign: "left" }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
                {`${user.first_name || ""} ${user.last_name || ""}`}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: "#888" }}>
                {user.role || ""}
              </p>
            </div>

            <span
              style={{
                fontSize: 10,
                transform: open ? "rotate(180deg)" : "",
                transition: "transform 0.2s",
              }}
            >
              ▼
            </span>
          </button>

          {/* Dropdown */}
          {open && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 6px)",
                background: "#fff",
                border: "0.5px solid #ddd",
                borderRadius: 10,
                minWidth: 200,
                zIndex: 1000,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 14px",
                  borderBottom: "0.5px solid #eee",
                }}
              >
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
                  {user.full_name ||
                    `${user.first_name || ""} ${user.last_name || ""}`}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
                  {user.email || ""}
                </p>
              </div>

              <div style={{ padding: 6 }}>
                {["Profile", "Settings"].map((item) => (
                  <button
                    key={item}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 10px",
                      fontSize: 13,
                      background: "transparent",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    {item}
                  </button>
                ))}

                <hr
                  style={{
                    margin: "4px 0",
                    border: "none",
                    borderTop: "0.5px solid #eee",
                  }}
                />

                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 10px",
                    fontSize: 13,
                    background: "transparent",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    color: "#c0392b",
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}