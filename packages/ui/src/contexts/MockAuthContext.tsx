import { createContext, ReactNode, useContext, useState } from "react";

type AuthContextType = {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const MockAuthContext = createContext<AuthContextType>({isLoggedIn: false, login: () => {}, logout: () => {}});

export const useMockAuth = () => {
  return useContext(MockAuthContext);
};

type MockAuthProviderProps = {
  children: ReactNode;
}

export const MockAuthProvider: React.FC<MockAuthProviderProps> = ({children}) => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  
  const login = () => setLoggedIn(true);
  const logout = () => setLoggedIn(false);

  return (
    <MockAuthContext.Provider value={{isLoggedIn, login, logout}}>
      {children}
    </MockAuthContext.Provider>
  );
};
