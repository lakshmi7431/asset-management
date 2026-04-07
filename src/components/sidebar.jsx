import { useNavigate, useLocation } from "react-router-dom";
import "../style/sidebar.css";

function Sidebar({ isSuperUser }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  const active = (path) => location.pathname === path ? "sb-btn active" : "sb-btn";

  return (
    <div className="sidebar">

      <div className="sb-section-label">Navigation</div>

      {/* Users — superuser only */}
      {/* {!isSuperUser && (
        <button
          className={active("/users")}
          onClick={() => navigate("/users")}
        >
          Users
        </button>
      )} */}
        <button
          className={active("/users")}
          onClick={() => navigate("/users")}
        >
          Users
        </button>
      <button
        className={active("/roles")}
        onClick={() => navigate("/roles")}
      >
        Roles
      </button>

      <button
        className={active("/organizations")}
        onClick={() => navigate("/organizations")}
      >
        Organizations
      </button>

      <button
        className={active("/assets")}
        onClick={() => navigate("/assets")}
      >
        Assets
      </button>
       

      <button
        className={active("/models")}
        onClick={() => navigate("/models")}
      >
        Models
        </button>
      
    </div>
  );
}

export default Sidebar;