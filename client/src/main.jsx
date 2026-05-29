import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { initSocket, disconnectSocket } from './utils/socket';

function SocketInitializer({ children }) {
  const { user } = useAuth();
  useEffect(()=>{
    if (user) initSocket(user);
    return ()=>{ disconnectSocket(); };
  }, [user]);
  return children;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketInitializer>
          <App />
        </SocketInitializer>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
