import { useState, useEffect } from 'react';

function ResumeList() {
  const [resumes, setResumes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const ITEMS_PER_PAGE = 7;

  useEffect(() => {
    fetchResumes();
  }, []);

  useEffect(() => {
    // Update total pages whenever resumes array changes
    setTotalPages(Math.ceil(resumes.length / ITEMS_PER_PAGE));
  }, [resumes]);

  const fetchResumes = async () => {
    try {
      const response = await fetch('https://doctor-alliance.onrender.com/uploads', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
      const response = await fetch(`https://doctor-alliance.onrender.com/download/${filename}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return resumes.slice(startIndex, endIndex);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
            {getPaginatedData().map((resume) => (
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
        
        {totalPages > 1 && (
          <div className="pagination-container mt-4 flex justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === index + 1 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export default ResumeList;
