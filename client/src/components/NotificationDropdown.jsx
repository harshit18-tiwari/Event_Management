import React, { useEffect, useState } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationService';

export default function NotificationDropdown() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();

    const handleIncoming = (event) => {
      const incoming = event.detail;
      if (!incoming?._id) return;

      setItems((current) => {
        if (current.some((item) => item._id === incoming._id)) {
          return current;
        }

        return [incoming, ...current];
      });
    };

    window.addEventListener('notification-received', handleIncoming);

    return () => {
      window.removeEventListener('notification-received', handleIncoming);
    };
  }, []);

  function fetchItems() { getNotifications().then(res=>setItems(res.data)).catch(()=>{}); }

  function handleMark(id){ markAsRead(id).then(()=>fetchItems()).catch(()=>{}); }

  function handleMarkAll(){ markAllAsRead().then(()=>fetchItems()).catch(()=>{}); }

  return (
    <div className="w-96 max-w-[calc(100vw-1.5rem)] bg-white border border-slate-200 rounded-xl shadow-2xl p-3">
      <div className="flex justify-between items-center mb-2">
        <strong className="text-sm text-slate-900">Notifications</strong>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700" onClick={handleMarkAll}>Mark all read</button>
      </div>
      <div className="space-y-2 max-h-64 overflow-auto pr-1">
        {items.length===0 && <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">No notifications</div>}
        {items.map(n=> (
          <div key={n._id} className={`rounded-lg border p-2 ${n.isRead? 'bg-slate-50 border-slate-200':'bg-white border-slate-300 shadow-sm'}`}>
            <div className="flex justify-between">
              <div>
                <div className="font-medium text-slate-900">{n.title}</div>
                <div className="text-sm text-slate-700">{n.message}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</div>
                {!n.isRead && <button className="text-xs font-medium text-blue-600 hover:text-blue-700" onClick={()=>handleMark(n._id)}>Mark</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
