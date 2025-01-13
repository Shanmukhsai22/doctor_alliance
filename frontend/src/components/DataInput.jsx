import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DataInput() {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedDate = new Date(date).toISOString().split('T')[0];

    const formData = new FormData();
    formData.append('name', name);
    formData.append('submission_date', formattedDate);
    formData.append('resume', file);

    try {
      const response = await fetch('https://doctor-alliance.onrender.com/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Resume uploaded successfully!');
        setError('');
        setName('');
        setDate('');
        setFile(null);
        setTimeout(() => {
          navigate('/resumes');
        }, 2000);
      } else {
        setError(data.message || 'An error occurred');
        setSuccess('');
      }
    } catch (err) {
      setError('An error occurred while uploading');
      setSuccess('');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== 'application/pdf') {
      setError('Please upload only PDF files');
      setFile(null);
      e.target.value = null;
    } else {
      setFile(selectedFile);
      setError('');
    }
  };

  return (
    <div className="page-container">
      <div className="form-card">
        <h2 className="form-title">Upload Resume</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Submission Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Resume (PDF only)</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf"
              className="file-input"
              required
            />
          </div>
          <button type="submit" className="form-button">
            Upload
          </button>
        </form>
      </div>
    </div>
  );
}

export default DataInput;