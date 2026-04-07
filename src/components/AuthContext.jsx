import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);
  // const [userName, setUserName]       = useState('');  
  // const [userRole, setUserRole]       = useState('');

  const login  = (superUser = false) => {
    setIsLoggedIn(true);
    setIsSuperUser(superUser);
    // setUserName(name);    
    // setUserRole(role); 
  };

  const logout = () => {
    setIsLoggedIn(false);
    setIsSuperUser(false);
    // setUserName('');      
    // setUserRole('');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isSuperUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);