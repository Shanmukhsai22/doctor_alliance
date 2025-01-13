# Doctor_alliance_assignment

A full-stack web application that allows users to securely upload and manage their resumes. Built with React, Python Flask, and Supabase.

## Features

- Dummy User authentication with JWT tokens
- Secure resume upload (PDF only)
- Resume listing and download functionality
- Responsive design
- Database integration with Supabase

## Tech Stack

### Frontend
- React + Vite
- CSS for styling
- Axios for API calls

### Backend
- Python Flask
- JWT for authentication
- Flask-CORS for handling cross-origin requests

### Database
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Automated timestamp management

## Project Structure

```
doctor-alliance/
├── backend/
│   ├── venv/
│   ├── app.py
│   ├── requirements.txt
│   └── uploads/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── DataInput.jsx
│   │   │   └── ResumeList.jsx
│   │   ├── styles/
│   │   │   └── main.css
│   │   └── App.jsx
│   └── package.json
└── README.md
```
-This is the structure of the main files; the remaining ones are the default React + Vite files that are not listed here.eg:public directory

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/doctor-alliance.git
cd doctor-alliance
```

2. Backend Setup
```bash
cd backend
# If using existing venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# If setting up fresh
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start the backend server
python app.py
```

3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

4. Access the application at `http://localhost:5173`

### Default Credentials
- Username: admin
- Password: admin

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Uploads Table
```sql
CREATE TABLE uploads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    submission_date DATE NOT NULL,
    resume_file_name VARCHAR(255) NOT NULL,
    resume_url VARCHAR(512),
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Security Features

- JWT-based authentication
- PDF-only file upload restriction
- Row Level Security (RLS) in Supabase
- Client-side and server-side validation
- Secure file storage


## I have included my Supabase credentials directly in the respective folders where they are needed, instead of using a `.env` file, to provide easier access when running the code.

## API Endpoints

- `POST /login` - User authentication
- `POST /upload` - Resume upload
- `GET /uploads` - Fetch uploaded resumes
- `GET /download/<filename>` - Download specific resume


## Acknowledgments

- Supabase for database hosting
- Flask documentation
- React documentation
- Vite build tool
