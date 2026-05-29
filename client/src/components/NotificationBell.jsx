import React, { useEffect, useState } from 'react';
import { getUnreadCount } from '../services/notificationService';

export default function NotificationBell({ onOpen }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const refresh = () => getUnreadCount().then(res => { if (mounted) setCount(res.data.count); }).catch(()=>{});

    refresh();
    const iv = setInterval(refresh, 30000);

    const handleIncoming = () => setCount((current) => current + 1);
    window.addEventListener('notification-received', handleIncoming);

    return ()=>{
      mounted = false;
      clearInterval(iv);
      window.removeEventListener('notification-received', handleIncoming);
    };
  }, []);

  return (
    <button className="relative" onClick={onOpen} aria-label="Notifications">
      <span className="text-2xl">🔔</span>
      {count > 0 && (
        <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1">{count}</span>
      )}
    </button>
  );
}
