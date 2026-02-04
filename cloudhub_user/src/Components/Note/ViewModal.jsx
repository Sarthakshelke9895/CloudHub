import ReactDOM from "react-dom";
import "./Note.css";

export default function ViewModal({ note, onClose }) {
  if (!note) return null;

  return ReactDOM.createPortal(
    <div className="view-modal-overlay" onClick={onClose}>
      <div className="view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="view-header-notes">
          <h2>{note.title}</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="view-content">{note.content}</div>
      </div>
    </div>,
    document.body
  );
}
