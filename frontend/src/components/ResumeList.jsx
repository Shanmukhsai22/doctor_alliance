import { useState, useEffect } from 'react';

function ResumeList() {
  // Calculate items per page based on screen height
  const calculateItemsPerPage = () => {
    const screenHeight = window.innerHeight;
    const headerHeight = 60; 
    const rowHeight = 60; 
    const paginationHeight = 60; 
    const padding = 40; 
    
    const availableHeight = screenHeight - headerHeight - paginationHeight - padding;
    const calculatedItems = Math.floor(availableHeight / rowHeight);
    
    return Math.max(3, Math.min(15, calculatedItems));
  };

  const [resumes, setResumes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(calculateItemsPerPage());

  // Fetch resumes on component mount
  useEffect(() => {
    fetchResumes();
  }, []);

  // Handle window resize to update items per page
  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(calculateItemsPerPage());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update total pages when resumes or itemsPerPage changes
  useEffect(() => {
    setTotalPages(Math.ceil(resumes.length / itemsPerPage));
    // Reset to first page if current page is now invalid
    if (currentPage > Math.ceil(resumes.length / itemsPerPage)) {
      setCurrentPage(1);
    }
  }, [resumes, itemsPerPage]);

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
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return resumes.slice(startIndex, endIndex);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of table when page changes
    const tableElement = document.querySelector('.table-container');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-text">Loading...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  // Empty state
  if (resumes.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h2 className="section-title">Uploaded Resumes</h2>
          <div className="empty-message">
            <p>No resumes have been uploaded yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="form-title">Uploaded Pdf data</h2>
      
      <div className="table-container">
        <div className="table-wrapper">
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
                  <td className="filename-cell">{resume.resume_file_name}</td>
                  <td>{new Date(resume.upload_date).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => handleDownload(resume.resume_file_name)}
                      className="download-button"
                      aria-label={`Download ${resume.resume_file_name}`}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="pagination-container">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
              aria-label="Previous page"
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                Math.abs(pageNumber - currentPage) <= 1
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`pagination-button ${
                      currentPage === pageNumber ? 'active' : ''
                    }`}
                    aria-label={`Page ${pageNumber}`}
                    aria-current={currentPage === pageNumber ? 'page' : undefined}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (
                Math.abs(pageNumber - currentPage) === 2
              ) {
                return <span key={pageNumber} className="pagination-ellipsis">...</span>;
              }
              return null;
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button"
              aria-label="Next page"
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
