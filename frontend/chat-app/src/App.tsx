import React from "react";
import { ApolloProvider } from "@apollo/client/react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import your already configured Apollo client
import { client } from "./apollo/client";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";

const AuthGuard: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const authToken = localStorage.getItem("accessToken");
  return authToken ? children : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Routes>
          <Route path="/" element={<AuthGuard><Chat /></AuthGuard>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
};

export default App;