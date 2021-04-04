import React from 'react';
import { auth } from '../services/firebase';

function Header() {
  return (
    <header>
      <br/>
      <strong className="header-text">Welcome to ChatAppJH </strong>
      <span></span>
      <button className="btn-logout" onClick={() => auth().signOut()}>Logout</button>
    </header>
  );
}

export default Header;