import React, { useState, useEffect } from 'react';
import './Note.css';

import { useAlert } from "../Alertbox/Alertcontext";

import search_icon from '../../Assests/search.png'


const API = 'https://cloudhub-af47.onrender.com/notes';

export default function Note() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editNote, setEditNote] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [viewNote, setViewNote] = useState(null);

  const { showAlert } = useAlert();


  // Fetch notes on mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch(API,{
        credentials: "include"
      });
      const data = await res.json();
      console.log(data); 
      setNotes(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Add note
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    await fetch(API, {
      method: 'POST',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    setTitle('');
    setContent('');
    fetchNotes();
  };

  // Delete note
  const handleDelete = async (id) => {
    await fetch(`${API}/${id}`, { method: 'DELETE' },{credentials: "include"});
    fetchNotes();
  };

  // Copy content
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showAlert("Note Text Copied to Clipboard..","info",2000);
  };

  // Download note
  const handleDownload = (note) => {
    const blob = new Blob([`Title: ${note.title}\nContent: ${note.content}`], { type: 'text/plain' },{  credentials: "include",
  });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${note.title}.txt`;
    link.click();
  };

  // Share via WhatsApp
  const handleShare = (note) => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(note.title + '\n' + note.content)}`;
    window.open(url, '_blank');
  };

  // Open modal for editing
  const openEditModal = (note) => {
    setEditNote(note);
    setShowModal(true);
  };

  // Update note
  const handleUpdate = async () => {
    await fetch(`${API}/${editNote._id}`, {
      method: 'PUT',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editNote.title, content: editNote.content }),
    });
    setShowModal(false);
    setEditNote(null);
    fetchNotes();
  };

  // Filter notes based on search input
  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    document.body.style.overflow = viewNote ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [viewNote]);
  

  return (
    <div className= "note-app" >

      <div className="header_search_bar">
      <header>
        <h1 className='component_header'>CloudHub Notes</h1>

      </header>

      <div className="search-box-notes">
      <img src={search_icon} alt="search" className="search-img" />
        <input
          type="text"
          className='search-bar'
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      </div>

      <form onSubmit={handleAdd} className="note-form">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit">Add Note</button>
      </form>

      {viewNote && (
        <div className="view-modal-overlay" onClick={() => setViewNote(null)}>
          <div className="view-modal" onClick={e => e.stopPropagation()}>
            <div className="view-header-notes">
              <h2>{viewNote.title}</h2>
              <button className="close-button" onClick={() => setViewNote(null)}>
                ✕
              </button>
            </div>

            <div className="view-content">
              {viewNote.content}
            </div>
          </div>
        </div>
      )}

      <div className="notes-list">
        {filteredNotes.map((note) => (
          <div key={note._id} className="note-card" onClick={() => setViewNote(note)}>
            <div className="note-header">
              <h2>{note.title}</h2>
              <span className="note-time">
                {note.createdAt
                  ? new Date(note.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'No date'}
              </span>

            </div>
            <div className="note-content-wrapper">
              <p id="content_notes">{note.content}</p>
            </div>

            <div className="note-actions">
            <button onClick={(e) => { e.stopPropagation(); openEditModal(note); }}>
              Edit
            </button>

            <button onClick={(e) => { e.stopPropagation(); handleCopy(note.content); }}>
              Copy
            </button>

            <button onClick={(e) => { e.stopPropagation(); handleDownload(note); }}>
              Download
            </button>

            <button onClick={(e) => { e.stopPropagation(); handleDelete(note._id); }}>
                Delete
            </button>

            <button onClick={(e) => { e.stopPropagation(); handleShare(note); }}>
              Share
            </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Note</h2>
            <input
              className='update_fields'
              value={editNote.title}
              onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
            />
            <textarea
            id='notes_textarea'
              className='update_fields'
              value={editNote.content}
              onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
            />
            <div className="modal-buttons">
              <button onClick={handleUpdate}>Update</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
