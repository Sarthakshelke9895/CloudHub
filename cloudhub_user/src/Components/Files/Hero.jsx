import React, { useEffect, useState } from 'react';

const Hero = ({ backendUrl = 'http://localhost:5000' }) => {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem('token'); // JWT token

  useEffect(() => {
    fetchFiles();// eslint-disable-next-line
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${backendUrl}/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${backendUrl}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }, // don't set Content-Type manually
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      setFile(null);
      fetchFiles();
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed');
    }
    setUploading(false);
  };

  const handleDownload = (fileId, filename) => {
    const url = `${backendUrl}/files/${fileId}?download=true`;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Your Files</h2>

      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      <ul>
        {files.length === 0 ? (
          <li>No files uploaded yet.</li>
        ) : (
          files.map(f => (
            <li key={f.id}>
              {f.filename}{' '}
              <button onClick={() => handleDownload(f.id, f.filename)}>Download</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Hero;
