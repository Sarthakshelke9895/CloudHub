import React, { useEffect, useState } from "react";
import "./Contact.css";
import search_icon from '../../Assests/search.png'
import leftarrow from "../../Assests/next.png"
import phone from '../../Assests/telephone.png'
import mail from "../../Assests/email.png"
import edit from '../../Assests/pencil.png'
import bin from '../../Assests/trash.png'


const Contact = ({ backendUrl = "http://localhost:5000" }) => {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [editingContact, setEditingContact] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${backendUrl}/contacts`, {
        credentials: "include",
      });
      const data = await res.json();
      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const validateForm = () => {
    if (!form.name.trim()) return false;
    if (!form.phone.match(/^\d{1,10}$/)) return false;
    if (form.email && !form.email.includes("@")) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert("Please fill valid Name, Phone (max 10 digits) and Email");
      return;
    }

    setLoading(true);
    try {
      if (editingContact) {
        await fetch(`${backendUrl}/contacts/${editingContact._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });
        setEditingContact(null);
      } else {
        await fetch(`${backendUrl}/contacts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });
      }
      setForm({ name: "", phone: "", email: "" });
      fetchContacts();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await fetch(`${backendUrl}/contacts/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchContacts();
  };

  const openEditModal = (c) => {
    setEditingContact(c);
    setForm({ name: c.name, phone: c.phone, email: c.email });
  };

  const closeModal = () => {
    setEditingContact(null);
    setForm({ name: "", phone: "", email: "" });
  };

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  
  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };
  
  return (
    <div className="contacts-container">
      <div className="name-search-bar">
      <h2 className="contacts-title">CloudHub Contacts <span className="notes-count">({contacts.length})</span></h2>

      <div className="search-box-notes">
      <img src={search_icon} alt="search" className="search-img" />
        <input
          type="text"
          className='search-bar'
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      </div>

      <form className="contacts-form" onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={form.name}
          required
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Phone"
          value={form.phone}
          required
          maxLength={10}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <button type="submit">
          {loading ? (editingContact ? "Updating..." : "Adding...") : editingContact ? "Update Contact" : "Add Contact"} <img src={leftarrow} alt="logo" className='add_note_button'/>
        </button>
      </form>

      
{/* Modal */}
{editingContact && (
  <div className="contacts-modal-overlay" onClick={closeModal}>
    <div
      className="contacts-modal-box"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="contacts-modal-title">Edit Contact</h3>

      <input
        className="contacts-modal-input"
        placeholder="Name"
        value={form.name}
        onChange={(e) =>
          setForm({ ...form, name: e.target.value })
        }
      />

      <input
        className="contacts-modal-input"
        placeholder="Phone"
        maxLength={10}
        value={form.phone}
        onChange={(e) =>
          setForm({ ...form, phone: e.target.value })
        }
      />

      <input
        className="contacts-modal-input"
        placeholder="Email"
        value={form.email}
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
      />

      <div className="contacts-modal-actions">
        <button className="contacts-modal-btn" onClick={handleSubmit}>
          Update Contact
        </button>

        <button className="contacts-modal-cancel" onClick={closeModal}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


      <div className="contacts-list"   >
        {filtered.map((c) => (
          <div className="contacts-card"  key={c._id} >

            <div className="name-and-date">
              <div className="name-phone-email">
              <h3>{c.name}</h3>
                <p><img src={phone} alt="phone logo" className="contacts-card-logo" id="phonelogo" /> {c.phone}</p>
                <p> <img src={mail} alt="mail logo" className="contacts-card-logo" /> {c.email}</p>
              </div>

            <p className="contact-time">
              {c.createdAt
                ? new Date(c.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "No date"}
            </p>

            </div>
            <div className="contacts-btn-group">
              <div className="contacts-parent-actions tooltip-btn" onClick={(e) =>  { e.stopPropagation(); handleCall(c.phone);}}>
              <img src={phone} alt="phone"  className="contact-actions" /> 
              <span className="tooltip-text">Call</span>

              </div>
              <div className="contacts-parent-actions tooltip-btn" onClick={() => openEditModal(c)}>
              <img src={edit} alt="edit"  className="contact-actions" />
              <span className="tooltip-text">Edit</span>

              </div>
              <div className="contacts-parent-actions tooltip-btn"  onClick={() => handleDelete(c._id)}>
              <img src={bin} alt="bin"  className="contact-actions" />
              <span className="tooltip-text">Delete</span>

              </div>
     
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="contacts-no-result">No contacts found.</p>}
      </div>


    </div>
  );
};

export default Contact;
