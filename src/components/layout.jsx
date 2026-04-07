import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Header from "./header";
import { useState } from "react";
import '../style/layout.css';

function Layout() {
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);
  // const { isLoggedIn, isSuperUser, userName, userRole } = useAuth();  
  return (
    <div className="app-shell">

      <Header
        isLoggedIn={isLoggedIn}
        isSuperUser={isSuperUser}
        // userName={userName}       
        // userRole={userRole}
      />

      <div className="body">
        {/* sidebar + main content only appear after login */}
        {isLoggedIn && <Sidebar isSuperUser={isSuperUser} />}

        <main>
          <Outlet
  context={{
    isLoggedIn,
    setIsLoggedIn,
    isSuperUser,
    setIsSuperUser
  }}
/>
        </main>
      </div>

    </div>
  );
}

export default Layout;