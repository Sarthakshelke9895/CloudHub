import { useEffect, useState } from "react";
import './File.css'
import back from '../../Assests/arrow_access.png'
import folder from '../../Assests/folder_coloured.png'
import files from '../../Assests/file.png'
import plus_icon from '../../Assests/plus.png'
import search_icon from '../../Assests/search.png'
import { useAlert } from "../Alertbox/Alertcontext";




const API = "https://cloudhub-af47.onrender.com";


export default function File() {
  const [current, setCurrent] = useState("root");
  const [data, setData] = useState({ folders: [], files: [] });
  const [name, setName] = useState("");
  const [q, setQ] = useState("");
  const [suggest, setSuggest] = useState({ files: [], folders: [] });
  const [highlightId, setHighlightId] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [folderName, setFolderName] = useState("Home");
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: "root", name: "My Drive" }]);
  
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [folderMenuId, setFolderMenuId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");



  const { showAlert } = useAlert();


 
  function goToBreadcrumb(id, index) {
    setCurrent(id);
    setBreadcrumbs(prev => prev.slice(0, index + 1));
  }
  
  function goBack() {
    if (breadcrumbs.length > 1) {
      // remove the last folder
      const newBreadcrumbs = breadcrumbs.slice(0, breadcrumbs.length - 1);
      const prev = newBreadcrumbs[newBreadcrumbs.length - 1];
      setCurrent(prev.id);
      setFolderName(prev.name);
      setBreadcrumbs(newBreadcrumbs);
    } else {
      // already at root
      goRoot();
    }
  }
  
  // Load folder content
  function loadFolder(id) {
    fetch(`${API}/folder/${id}`).then(r => r.json()).then(setData);
  }

  // Load folder name
  useEffect(() => {
    if (current === "root") {
      setFolderName("Home");
    } else {
      fetch(`${API}/folderinfo/${current}`)
        .then(r => r.json())
        .then(d => setFolderName(d.name));
    }
  
    loadFolder(current);
  }, [current]);
  

  // Folder actions
  async function createFolder() {
    if (!name.trim()) return;
    await fetch(`${API}/folder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parent: current === "root" ? null : current }),
    });
    setName("");
    loadFolder(current);
  }

  const [percent, setPercent] = useState(0);

  async function uploadFile(file) {
    const fd = new FormData();
    fd.append("file", file);
  
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API}/upload/${current}`);
  
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) {
        const p = Math.round((e.loaded / e.total) * 100);
        setPercent(p);
      }
    };
  
    xhr.onload = () => {
      setPercent(0);
      loadFolder(current);
    };
  
    xhr.onerror = () => alert("Upload failed");
    xhr.send(fd);
  }
  
  
  

  async function delFile(id) {
    const res = await fetch(`${API}/file/${id}`, { method: "DELETE" });
    if (res.ok) loadFolder(current);
    else  showAlert("Delete Failed","error",2000);
    setMenuId(null); 
  }

  async function delFolder(id) {
    const res = await fetch(`${API}/folder/${id}`, { method: "DELETE" });
    if (res.ok) loadFolder(current);
    else showAlert("Delete Failed","error",2000);
  }
  // Search
  async function search(val) {
    setQ(val);
    if (!val) return setSuggest({ files: [], folders: [] });
    const r = await fetch(`${API}/search?q=${val}`);
    setSuggest(await r.json());
  }

  function selectFromSearch(item) {
    setHighlightId(item._id);
    setSuggest({ files: [], folders: [] });
    if (item.parent) setCurrent(item.parent); // optionally navigate to folder
  }



  // File menu actions
  function openFile(f) {
    window.open(`${API}/file/${f._id}`, "_blank");
    setMenuId(null); 
  }

  async function shareFile(f) {
    const link = `${API}/file/${f._id}`;
    await navigator.clipboard.writeText(link);
    showAlert("Link Copied","success",2000);
    setMenuId(null); 
  }

  function downloadFile(f) {
    const a = document.createElement("a");
    a.href = `${API}/file/${f._id}?download=true`;
    a.download = f.originalname;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setMenuId(null); 
  }

  // Folder navigation
  function openFolder(folder) {
    // Do nothing if user clicks the current folder
    if (folder._id === current) return;
  
    setCurrent(folder._id);
    setFolderName(folder.name);
  
    // Add to breadcrumbs
    setBreadcrumbs(prev => [...prev, { id: folder._id, name: folder.name }]);
  
    // Clear search suggestions
    setSuggest({ files: [], folders: [] });
  }
  
  

  function goRoot() {
    setCurrent("root");
    setFolderName("Home");
    setBreadcrumbs([{ id: "root", name: "Home" }]);
  }

  useEffect(() => {
  function handleClickOutside(e) {
    if (!e.target.closest(".search-input") && !e.target.closest(".search-suggestions")) {
      setSuggest({ files: [], folders: [] });
    }
  }
  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);

async function renameFolder(id, newName) {
  await fetch(`${API}/folder/${id}/rename`, {   // add /rename at the end
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: newName }),
  });
  loadFolder(current);
}

  

  return (
    <div className="file-explorer">
      {/* Folder Title */}
      <div className="folder-header">
      <div className="breadcrumbs">
  {breadcrumbs.map((b, i) => (
    <span key={b.ide} onClick={() => goToBreadcrumb(b.id, i)}>
      {b.name} {i < breadcrumbs.length - 1 && " / "}
    </span>
  ))}
</div>

<div className="folder_name_and_back_button">
      {current !== "root" && <img src={back} alt="back" id="back_arrow" onClick={goBack}/>}
      <h2>{folderName}</h2>
</div>
      </div>

      <div className="new_button_and_search_bar">
      <div className="new_div" onClick={() => setShowMenu(!showMenu)}> <img src={plus_icon} alt="add"  id="plus_icon" /> New</div>
            {/* Search */}

            <div className="search-box">
            <img src={search_icon} alt="search" className="search-img" />
            <input type="text"
             className="search-input"
             placeholder="Search files or folders..."
             value={q}
             onChange={e => search(e.target.value)}
            />
          </div>



      </div>

      <div className="search-suggestions">
        {suggest.files.map(f => (
          <div key={f._id} className="suggest-item" onClick={() => selectFromSearch(f)}>
             <img src={files} alt="file" className="folder_logo" />{f.originalname}
          </div>
        ))}
        
        {suggest.folders
          .filter(f => f._id !== current) // skip current folder
          .map(f => (
            <div key={f._id} className="suggest-item" onClick={() => openFolder(f)}>
               <img src={folder} alt="folder" className="folder_logo" />{f.name}
            </div>
        ))}

      </div>

      <div className="actions-bar">
  <div className="new-btn-wrap">

    {showMenu && (
      <div className={`new-tooltip ${showMenu ? "" : "hide"}`}>
        <div onClick={() => { setShowModal(true); setShowMenu(false); }}>
        <div className="tooltip_row">
          <img src={folder} alt="file" className="tooltip_logo" />
          <h4>Folder</h4>
          </div>
        </div>

        <label>
          <div className="tooltip_row">
          <img src={files} alt="file" className="tooltip_logo" />
          <h4>File</h4>
          </div>
          <input
            type="file"
            hidden
            
            onChange={e => {
              const selectedFile = e.target.files[0];
              if (!selectedFile) return;
              uploadFile(selectedFile);   // ✅ pass directly
              setShowMenu(false);
              e.target.value = "";        // reset input
            }}
          />
        </label>
      </div>
    )}
  </div>
  {/* Animated Progress Bar */}
{/* Animated Progress Bar */}
{percent > 0 && (
  <div className="progress-wrap">
    <div
      className="progress-bar"
      style={{ width: `${percent}%` }}
    ></div>
    <span className="progress-text">{percent}%</span>
  </div>
)}






</div>

{showModal && (
  <div className="modal-bg">
    <div className="modal_box">
      <h3>Create Folder</h3>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Folder name"
      />
      <div className="modal-actions">
        <button onClick={() => { createFolder(); setShowModal(false); }}>
          Create
        </button>
        <button onClick={() => setShowModal(false)}>Cancel</button>
      </div>
    </div>
  </div>
)}





      {/* Folder List */}
      <h3 className="files_and_folders" >Folders</h3>
      <div className="folder-list">
  {data.folders.map(f => (
    <div key={f._id} className="folder-row" onClick={() => openFolder(f)}>
      
      <div className="name_and_logo">
        <img src={folder} alt="folder" className="folder_logo" />
        {editingId === f._id ? (
                <input
                  autoFocus
                  className="rename_input"
                  style={{ width: `${editValue.length + 2}ch` }} // width based on text
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={() => { if (editValue.trim()) renameFolder(f._id, editValue); setEditingId(null); }}
                  onKeyDown={e => {
                    if (e.key === "Enter") { if (editValue.trim()) renameFolder(f._id, editValue); setEditingId(null); }
                    if (e.key === "Escape") setEditingId(null);
                  }}
                />
              ) : (
                <span>{f.name}</span>
              )}
      </div>

      <div className="menu">
        <button
          onClick={e => {
            e.stopPropagation();
            setFolderMenuId(folderMenuId === f._id ? null : f._id);
          }}
          className="three_dots"
        >
          ⋮
        </button>

        {folderMenuId === f._id && (
          <div className="menu-box">
            <div
              onClick={e => {
                e.stopPropagation();
                setEditingId(f._id);
                setEditValue(f.name);
                setFolderMenuId(null); // close the menu
              }}
            >
              Rename
            </div>

            <div
              onClick={e => {
                e.stopPropagation();
                delFolder(f._id);
                setFolderMenuId(null);
              }}
            >
              Delete
            </div>
          </div>
        )}
      </div>
    </div>
  ))}
</div>


      {/* File List */}
      <h3 className="files_and_folders">Files</h3>
      <div className="file-list">
        {data.files.map(f => (
          <div
            key={f._id}
            className={`file-row ${highlightId === f._id ? "highlight" : ""}`}
          >
            <span>{f.originalname}</span>
            <div className="menu">
              <button onClick={() => setMenuId(menuId === f._id ? null : f._id)} className="three_dots">⋮</button>
              {menuId === f._id && (
                <div className="menu-box">
                  <div onClick={() => openFile(f)}>View</div>
                  <div onClick={() => shareFile(f)}>Share</div>
                  <div onClick={() => downloadFile(f)}>Download</div>
                  <div onClick={() => delFile(f._id)}>Delete</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
