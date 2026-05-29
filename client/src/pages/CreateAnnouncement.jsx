import React, { useState } from 'react';
import { createAnnouncement } from '../services/announcementService';

export default function CreateAnnouncement(){
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [eventId, setEventId] = useState('');
  const [targetAudience, setTargetAudience] = useState('Participants');

  function handleSubmit(e){
    e.preventDefault();
    createAnnouncement({ title, content, event: eventId || null, targetAudience })
      .then(()=>{ alert('Announcement created'); setTitle(''); setContent(''); })
      .catch(err=>{ alert('Failed'); });
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Create Announcement</h2>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-xl">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input className="w-full border p-2" value={title} onChange={e=>setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Content</label>
          <textarea className="w-full border p-2" value={content} onChange={e=>setContent(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Target Audience</label>
          <select className="w-full border p-2" value={targetAudience} onChange={e=>setTargetAudience(e.target.value)}>
            <option value="Participants">Participants</option>
            <option value="All">All</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Event ID (optional)</label>
          <input className="w-full border p-2" value={eventId} onChange={e=>setEventId(e.target.value)} />
        </div>
        <div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Create</button>
        </div>
      </form>
    </div>
  );
}
