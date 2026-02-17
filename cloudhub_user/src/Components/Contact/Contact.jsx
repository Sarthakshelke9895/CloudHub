import React, { useEffect, useState, useCallback } from "react";
import "./Contact.css";
import ContactEditModal from "./ContactEditModal";


import search_icon from "../../Assests/search.png";
import leftarrow from "../../Assests/next.png";
import phone from "../../Assests/telephone.png";
import mail from "../../Assests/email.png";
import edit from "../../Assests/pencil.png";
import bin from "../../Assests/trash.png";

const Contact = ({ backendUrl = "http://localhost:5000" }) => {
  const [contacts, setContacts] = useState([]);

  // ✅ Add Contact Form State
  const [form, setForm] = useState({ name: "", phone: "", email: "" });

  // ✅ Edit Modal Form State (Separate)
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [editingContact, setEditingContact] = useState(null);
  const [search, setSearch] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  
  // ✅ Fetch Contacts
  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/contacts`, {
        credentials: "include",
      });

      const data = await res.json();
      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // ✅ Validation (Add Form Only)
  const validateForm = () => {
    if (!form.name.trim()) return false;

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) return false;

    if (form.email && !form.email.includes("@")) return false;

    return true;
  };

  // ✅ Submit Handler (Add + Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const dataToSend = editingContact ? editForm : form;
  
    // ✅ Phone digits only
    const phoneDigits = dataToSend.phone.replace(/\D/g, "");
  
    // ✅ Name + Phone required
    if (!dataToSend.name.trim() || phoneDigits.length !== 10) {
      alert("Name and Phone (10 digits) are required!");
      return;
    }
  
    // ✅ Email optional but must be valid if entered
    if (dataToSend.email && !dataToSend.email.includes("@")) {
      alert("Enter a valid email or leave it empty.");
      return;
    }
  
    try {
      // ===========================
      // ✅ UPDATE CONTACT (Modal)
      // ===========================
      if (editingContact) {
        setEditLoading(true);
  
        await fetch(`${backendUrl}/contacts/${editingContact._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(editForm),
        });
  
        // Reset modal
        setEditingContact(null);
        setEditForm({ name: "", phone: "", email: "" });
  
        setEditLoading(false);
      }
  
      // ===========================
      // ✅ ADD CONTACT (Main Form)
      // ===========================
      else {
        setAddLoading(true);
  
        await fetch(`${backendUrl}/contacts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });
  
        // Reset add form
        setForm({ name: "", phone: "", email: "" });
  
        setAddLoading(false);
      }
  
      // Refresh contacts
      fetchContacts();
    } catch (err) {
      console.error(err);
  
      setAddLoading(false);
      setEditLoading(false);
    }
  };
  
  // ✅ Delete Contact
  const handleDelete = async (id) => {
    await fetch(`${backendUrl}/contacts/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    fetchContacts();
  };

  // ✅ Open Edit Modal (Does NOT Touch Add Form)
  const openEditModal = (c) => {
    setEditingContact(c);
    setEditForm({ name: c.name, phone: c.phone, email: c.email || "" });
  };

  // ✅ Close Modal
  const closeModal = () => {
    setEditingContact(null);
    setEditForm({ name: "", phone: "", email: "" });
  };

  // ✅ Search Filter
  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Call Function
  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  // ✅ Phone Formatter
  const formatPhone = (value, setter, currentState) => {
    let digits = value.replace(/\D/g, "");
    if (digits.length > 10) return;

    if (digits.length > 5) {
      digits = digits.slice(0, 5) + "-" + digits.slice(5);
    }

    setter({ ...currentState, phone: digits });
  };
  function formatDate(dateString) {
    if (!dateString) return "No date";
  
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="contacts-container">
      {/* Title + Search */}
      <div className="name-search-bar">
        <h2 className="contacts-title">
          CloudHub Contacts{" "}
          <span className="notes-count">({contacts.length})</span>
        </h2>

        <div className="search-box-notes">
          <img src={search_icon} alt="search" className="search-img" />
          <input
            type="text"
            className="search-bar"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ✅ Add Contact Form */}
      <form className="contacts-form" onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={form.name}
          required
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="text"
          placeholder="Phone (10 digits)"
          value={form.phone}
          onChange={(e) => formatPhone(e.target.value, setForm, form)}
        />

        <input
          placeholder="Email (Optional)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <button type="submit" disabled={!validateForm()}>
          {addLoading ? "Adding..." : "Add Contact"}
          <img src={leftarrow} alt="logo" className="add_note_button" />
        </button>

      </form>

      {editingContact && (
  <ContactEditModal
    editForm={editForm}
    setEditForm={setEditForm}
    editLoading={editLoading}
    handleSubmit={handleSubmit}
    closeModal={closeModal}
  />
)}

      {/* Contacts List */}
      <div className="contacts-list">
        {filtered.map((c) => (
          <div className="contacts-card" key={c._id}>
            <div className="name-and-date">
              
              <div className="name-date">
              <h3>{c.name}</h3>
              <small className="file-date">
              {formatDate(c.createdAt)}
            </small>
              </div>
              <div className="name-phone-email">
                
                
                <p>
                  <img
                    src={phone}
                    alt="phone"
                    className="contacts-card-logo"
                  />
                  <span>+91</span>{c.phone}
                </p>

                <p>
                  <img src={mail} alt="mail" className="contacts-card-logo" />
                  {c.email || "None"}
                </p>
              </div>

            </div>

            <div className="contacts-btn-group">
  
  {/* Call */}
  <div
    className="contacts-parent-actions tooltip-btn"
    onClick={(e) => {
      e.stopPropagation();
      handleCall(c.phone);
    }}
  >
    <img src={phone} alt="phone" className="contact-actions" />
    <span className="tooltip-text">Call</span>
  </div>

  {/* Edit */}
  <div
    className="contacts-parent-actions tooltip-btn"
    onClick={() => openEditModal(c)}
  >
    <img src={edit} alt="edit" className="contact-actions" />
    <span className="tooltip-text">Edit</span>
  </div>

  {/* Delete */}
  <div
    className="contacts-parent-actions tooltip-btn"
    onClick={() => handleDelete(c._id)}
  >
    <img src={bin} alt="bin" className="contact-actions" />
    <span className="tooltip-text">Delete</span>
  </div>

</div>

          </div>
        ))}

        {filtered.length === 0 && (
          <p className="contacts-no-result">No contacts found.</p>
        )}
      </div>
    </div>
  );
};

export default Contact;
