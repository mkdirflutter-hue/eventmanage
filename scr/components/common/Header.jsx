import React from 'react';
import './header.css';

export default function Header({ onToggleSidebar }) {
  return (
    <header className="uc-header">
      <button className="uc-hamburger" onClick={onToggleSidebar} aria-label="Toggle menu">☰</button>
      <div className="uc-brand">Unified Campus</div>
      <div className="uc-header-right">
        <input className="uc-search" placeholder="Search clubs, events, users..." />
        <div className="uc-avatar">AF</div>
      </div>
    </header>
  );
}
