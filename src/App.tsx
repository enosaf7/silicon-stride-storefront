// BEFORE: You might have had something like this:
// import AdminChat from './pages/Admin/AdminChat';
// <Route path="/admin/chat" element={<AdminChat />} />

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import AdminChat from './pages/Admin/AdminChat'; // REMOVE THIS
import Home from "./pages/Home";
import Profile from "./pages/Profile";
// import other pages as needed

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      {/* <Route path="/admin/chat" element={<AdminChat />} /> REMOVE THIS */}
      {/* Add other routes as needed */}
    </Routes>
  </Router>
);

export default App;
