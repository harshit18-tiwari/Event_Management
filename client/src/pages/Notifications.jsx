import React from 'react';
import NotificationDropdown from '../components/NotificationDropdown';

export default function Notifications() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      <NotificationDropdown />
    </div>
  );
}
