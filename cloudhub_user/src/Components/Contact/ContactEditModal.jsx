import ReactDOM from "react-dom";
import { useEffect } from "react";
import "./ContactEditModal.css";
import cancel from '../../Assests/cancel.png'

const ContactEditModal = ({
  editForm,
  setEditForm,
  editLoading,
  handleSubmit,
  closeModal,
}) => {
  // ✅ Disable background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return ReactDOM.createPortal(
    <div className="contact-modal-overlay" onClick={closeModal}>
      <div
        className="contact-modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="edit-modal-cancel-button">
        <h3 className="contact-modal-title">Edit Contact</h3>

          <img src={cancel} alt="cancel-logo" onClick={closeModal} className="cancel-logo"/>

        </div>

        {/* Name */}
        <input
          className="contact-modal-input"
          placeholder="Name"
          value={editForm.name}
          onChange={(e) =>
            setEditForm({ ...editForm, name: e.target.value })
          }
        />

        {/* Phone */}
        <input
          className="contact-modal-input"
          placeholder="Phone (10 digits)"
          value={editForm.phone}
          onChange={(e) =>
            setEditForm({ ...editForm, phone: e.target.value })
          }
        />

        {/* Email */}
        <input
          className="contact-modal-input"
          placeholder="Email (Optional)"
          value={editForm.email}
          onChange={(e) =>
            setEditForm({ ...editForm, email: e.target.value })
          }
        />

        {/* Buttons */}
        <div className="contact-modal-actions">
          <button className="contact-modal-btn" onClick={handleSubmit}>
            {editLoading ? "Updating..." : "Update Contact"}
          </button>


        </div>
      </div>
    </div>,
    document.body
  );
};

export default ContactEditModal;
