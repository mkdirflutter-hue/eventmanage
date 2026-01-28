import React from 'react';
import './sidebar.css';

export default function Sidebar({ collapsed }) {
  return (
    <aside className={"uc-sidebar " + (collapsed ? 'collapsed' : '')}>
      <nav>
        <ul>
          <li className="active">Dashboard</li>
          <li>Clubs</li>
          <li>Events</li>
          <li>Users</li>
          <li>Budget</li>
          <li>Analytics</li>
          <li>Settings</li>
        </ul>
      </nav>
    </aside>
  );
}
