import ReactDOM from "react-dom";
import './File.css'
export default function FolderModal({ name, setName, createFolder, onClose }) {
  return ReactDOM.createPortal(
    <div className="portal-overlay" onClick={onClose}>
      <div className="modal_box" onClick={(e) => e.stopPropagation()}>
        <h3>Create Folder</h3>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Folder name"
        />
        <div className="modal-actions">
          <button onClick={() => { createFolder(); onClose(); }}>Create</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
