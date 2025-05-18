// BEFORE: You likely had something like this:
// import ChatButton from './ChatButton';
// ...
// {user && <ChatButton />}

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const NavBar = () => {
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">YourLogo</Link>
      </div>
      <div className="navbar-links">
        {/* Add your navigation links here */}
        {user ? (
          <>
            {/* Remove <ChatButton /> */}
            <Link to="/profile">Profile</Link>
            {/* other user links */}
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
