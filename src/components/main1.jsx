import { useOutletContext, useNavigate } from "react-router-dom";
import Login from "./login";

function Main() {
  const { setIsLoggedIn, setIsSuperUser } = useOutletContext();
  const navigate = useNavigate();

  const handleLoginSuccess = (superUser) => {
    setIsSuperUser(superUser);
    setIsLoggedIn(true);
    navigate("/assets");          // ← redirect away from the login route
  };

  return (
    <Login onLoginSuccess={handleLoginSuccess} />
  );
}

export default Main;