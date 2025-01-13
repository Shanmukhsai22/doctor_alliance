import { useState, useEffect } from 'react';

function ResumeList() {
  const [resumes, setResumes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await fetch('http://localhost:5000/uploads', {
        headers: {
          'Authorization': Bearer ${localStorage.getItem('token')}
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resumes');
      }

      const data = await response.json();
      setResumes(data);
    } catch (err) {
      setError('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const response = await fetch(http://localhost:5000/download/${filename}, {
        headers: {
          'Authorization': Bearer ${localStorage.getItem('token')}
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download file');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="empty-state">
        <h2 className="section-title">Uploaded Resumes</h2>
        <div className="empty-message">
          <p>No resumes have been uploaded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="table-container1">
        <table className="data-table">
          <thead>
            <tr>
              <th>Uploaded By</th>
              <th>Resume</th>
              <th>Upload Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resumes.map((resume) => (
              <tr key={resume.id}>
                <td>{resume.name}</td>
                <td>{resume.resume_file_name}</td>
                <td>{new Date(resume.upload_date).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleDownload(resume.resume_file_name)}
                    className="download-button"
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResumeList;
