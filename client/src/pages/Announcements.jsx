import React, { useEffect, useState } from 'react';
import { getAnnouncements } from '../services/announcementService';

export default function Announcements(){
  const [items, setItems] = useState([]);
  useEffect(()=>{ load(); }, []);
  function load(){ getAnnouncements().then(res=>setItems(res.data)).catch(()=>{}); }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Announcements</h2>
      <div className="space-y-3">
        {items.map(a=> (
          <div key={a._id} className="p-3 border rounded">
            <div className="font-semibold">{a.title}</div>
            <div className="text-sm text-gray-600">{a.content}</div>
            <div className="text-xs text-gray-400 mt-1">By: {a.createdBy?.name || 'Unknown'} • {new Date(a.createdAt).toLocaleString()}</div>
          </div>
        ))}
        {items.length===0 && <div className="text-sm text-gray-500">No announcements</div>}
      </div>
    </div>
  );
}
