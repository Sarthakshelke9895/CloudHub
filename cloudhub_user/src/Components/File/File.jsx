import { useEffect, useState ,useRef} from "react";
import './File.css'
import FolderModal from './FolderModal';

import back from '../../Assests/arrow_access.png'
import folder from '../../Assests/folder_coloured.png'
import files from '../../Assests/file.png'
import plus_icon from '../../Assests/plus.png'
import search_icon from '../../Assests/search.png'
import { useAlert } from "../Alertbox/Alertcontext";




const API = "http://localhost:5000";


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
  // At the top of your component

  const [isSearching, setIsSearching] = useState(false);

  //file Rename
  // ✅ File Rename States
  const [editingFileId, setEditingFileId] = useState(null);
  const [editFileValue, setEditFileValue] = useState("");

  // ✅ Ref for rename input
const renameInputRef = useRef(null);
useEffect(() => {
  if (editingFileId && renameInputRef.current) {
    renameInputRef.current.select(); // ✅ Auto select filename
  }
}, [editingFileId]);







  const { showAlert } = useAlert();

  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuId(null);
      }
    };
  
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);
  


  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".menu")) {
        setFolderMenuId(null);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  



 
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
    fetch(`${API}/folder/${id}`, { credentials: "include" })
      .then(r => r.json())
      .then(res =>
        setData({
          folders: res.folders || [],
          files: res.files || []
        })
      );
  }
  

// Load folder name
useEffect(() => {
  async function fetchFolderName() {
    if (current === "root") {
      setFolderName("Home");
    } else {
      const res = await fetch(`${API}/folderinfo/${current}`, {
        method: "GET",
        credentials: "include", // ✅ send cookies
      });

      if (!res.ok) {
        console.log("Unauthorized or folder not found");
        return;
      }

      const d = await res.json();
      setFolderName(d.name);
    }

    loadFolder(current);
  }

  fetchFolderName();
}, [current]);


  // Folder actions
  async function createFolder() {
    if (!name.trim()) return;
    await fetch(`${API}/folder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
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
    xhr.withCredentials = true;   // ← ADD THIS LINE

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
    const res = await fetch(`${API}/file/${id}`, {
      method: "DELETE",
      credentials: "include"   // 🔥 send cookie for auth
    });
  
    if (res.ok) loadFolder(current);
    else showAlert("Delete Failed", "error", 2000);
  
    setMenuId(null);
  }
  
  async function delFolder(id) {
    const res = await fetch(`${API}/folder/${id}`, {
      method: "DELETE",
      credentials: "include"   // 🔥 send cookie for auth
    });
  
    if (res.ok) loadFolder(current);
    else showAlert("Delete Failed", "error", 2000);
  }
  
  async function search(val) {
    setQ(val);
  
    if (!val.trim()) {
      setSuggest({ files: [], folders: [] });
      setIsSearching(false);
      return;
    }
  
    setIsSearching(true);
  
    const res = await fetch(
      `${API}/search?folder=${current}&q=${encodeURIComponent(val)}`,
      { method: "GET", credentials: "include" }
    );
  
    if (!res.ok) {
      setSuggest({ files: [], folders: [] });
      setIsSearching(false);
      return;
    }
  
    const data = await res.json();
  
    setSuggest({
      files: data.files || [],
      folders: data.folders || [],
    });
  
    setIsSearching(false);
  }
  
  
  
  
  
  
  function selectFromSearch(item) {
    // Highlight clicked item for 2 seconds
    setHighlightId(item._id);
    setTimeout(() => setHighlightId(null), 2000);
  
    // Close suggestion menu immediately
    setSuggest({ files: [], folders: [] });
  
    // Clear search input
    search("");  // ✅ reset input
  
    // Navigate to folder if needed
    if (item.type === "folder" && item._id) {
      setCurrent(item._id); // set current folder
    }
  }
  


  // File menu actions
  function openFile(f) {
    window.open(`${API}/file/${f._id}`, "_blank");
    setMenuId(null); 
  }

  async function shareFile(f) {
    const link = `${API}/file/${f._id}`;
    await navigator.clipboard.writeText(link);
    showAlert("Link Copied", "success", 2000);
    setMenuId(null);
  }
  
  async function downloadFile(f) {
    const res = await fetch(`${API}/file/${f._id}?download=true`, {
      method: "GET",
      credentials: "include", // ✅ IMPORTANT
    });
  
    if (!res.ok) {
      showAlert("Download Failed", "error", 2000);
      return;
    }
  
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
  
    const a = document.createElement("a");
    a.href = url;
    a.download = f.originalname;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  
    setMenuId(null);
    
  }
  
  async function openFolder(folder) {
    setSuggest({ files: [], folders: [] }); // ✅ disables menu

    if (folder._id === current) return;
  
    const res = await fetch(`${API}/folderinfo/${folder._id}`, {
      method: "GET",
      credentials: "include", // ✅ REQUIRED
    });
  
    if (!res.ok) return console.log("Unauthorized");
  
    const data = await res.json();
    setCurrent(folder._id);
    setFolderName(data.name);
    setBreadcrumbs(prev => [...prev, { id: folder._id, name: data.name }]);
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
  const res = await fetch(`${API}/folder/${id}/rename`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // ✅ REQUIRED
    body: JSON.stringify({ name: newName }),
  });

  if (!res.ok) return console.log("Rename failed");
  loadFolder(current);
}
async function renameFile(id, newName) {
  const res = await fetch(`${API}/file/${id}/rename`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name: newName }),
  });

  if (!res.ok) return console.log("File rename failed");

  loadFolder(current);
}
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
// ✅ Split filename and extension
function splitFileName(filename) {
  const lastDot = filename.lastIndexOf(".");

  if (lastDot === -1) {
    return { name: filename, ext: "" };
  }

  return {
    name: filename.slice(0, lastDot),
    ext: filename.slice(lastDot), // includes dot
  };
}



  

  return (
    <div className="file-explorer">
      {/* Folder Title */}
      <div className="folder-header">
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

{percent > 0 && (
  <div className="progress-container">
    <span className="progress-percent">{percent}%</span>
    <div className="progress-bg">
      <div
        className="progress-fill"
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  </div>
)}


</div>
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
                  {/* ✅ No result state */}
          {isSearching === false &&
            q &&
            suggest.files.length === 0 &&
            suggest.folders.length === 0 && (
              <div className="no-results">No data found</div>
          )}

      </div>



{showModal && (
  <FolderModal
    name={name}
    setName={setName}
    createFolder={createFolder}
    onClose={() => setShowModal(false)}
  />
)}





      {/* Folder List */}
      <h3 className="files_and_folders" >Folders <span className="count">({data.folders?.length || 0})</span></h3>
      <div className="folder-list">
  {data.folders.map(f => (
    <div key={f._id} className="folder-row" onClick={() => openFolder(f)}>
      
      <div className="date-and_folder-logo-name">
      <div className="name_and_logo">
        <img src={folder} alt="folder" className="folder_logo" />
        {editingId === f._id ? (
                <input
                  autoFocus
                  className="rename_input_folder"
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
                <span className="folder_name" >{f.name}</span>
              )}

      </div>
      <small className="file-date">
              {formatDate(f.createdAt)}
            </small>
      </div>
      

      <div className="menu" >
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
              Rename_
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
      <h3 className="files_and_folders">Files <span className="count">({data.files?.length || 0})</span></h3>
      <div className="file-list" >
        {data.files.map(f => (
          <div
              className={`file-row ${highlightId === f._id ? "highlight" : ""}`}
              onClick={() => openFile(f)}
            >
              <div className="name-and-date">

              {editingFileId === f._id ? (
              <input
                ref={renameInputRef}   // ✅ attach ref
                autoFocus
                className="rename_input"
                value={editFileValue}
                onChange={(e) => setEditFileValue(e.target.value)}

                onBlur={() => {
                  if (editFileValue.trim()) {
                    const { ext } = splitFileName(f.originalname);
                    renameFile(f._id, editFileValue.trim() + ext);
                  }
                  setEditingFileId(null);
                }}

                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const { ext } = splitFileName(f.originalname);
                    renameFile(f._id, editFileValue.trim() + ext);
                    setEditingFileId(null);
                  }

                  if (e.key === "Escape") {
                    setEditingFileId(null);
                  }
                }}
              />
            ) : (
              <span id="file_name">{f.originalname}</span>
            )}

            <small className="file-date">
              {formatDate(f.createdAt)}
            </small>

              </div>



              <div className="menu">
                <button
                  className="three_dots"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuId(menuId === f._id ? null : f._id);
                  }}
                >⋮</button>



                {menuId === f._id && (
                  <div
                    className="menu-box"
                    ref={menuRef}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div onClick={() => openFile(f)}>View</div>
                    <div
                    onClick={() => {
                      const { name } = splitFileName(f.originalname);

                      setEditingFileId(f._id);
                      setEditFileValue(name); // ✅ Only filename shown
                      setMenuId(null);
                    }}
                  >
                    Rename
                  </div>


                    <div onClick={() => shareFile(f)}>Share</div>
                    <div onClick={() => downloadFile(f)}>Download</div>
                    <div
                      onClick={() => {
                        delFile(f._id);
                        setMenuId(null);
                      }}
                    >Delete</div>
                    
                  </div>
                  
                )}
                
              </div>

            </div>


        ))}
      </div>
    </div>
  );
}