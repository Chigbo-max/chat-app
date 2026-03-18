import React from "react";
import { ApolloProvider } from "@apollo/client/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import your already configured Apollo client
import { client } from "./apollo/client";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
};

export default App;