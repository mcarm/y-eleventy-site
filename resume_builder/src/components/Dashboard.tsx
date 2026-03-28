import { useState, useEffect } from 'react'
import './Dashboard.css'

type ResumeFile = {
  name: string
  path: string
  lastModified?: string
}

type DashboardProps = {
  onSelectResume: (content: string, fileName: string) => void
  onCreateNew: () => void
}

const Dashboard = ({ onSelectResume, onCreateNew }: DashboardProps) => {
  const [resumes, setResumes] = useState<ResumeFile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadResumes()
  }, [])

  const loadResumes = async () => {
    setLoading(true)
    try {
      const savedResumes = localStorage.getItem('resumeBuilder_files')
      if (savedResumes) {
        const files = JSON.parse(savedResumes) as ResumeFile[]
        setResumes(files)
      }
      
      const modules = import.meta.glob('/src/resumes/*.md', { as: 'raw' })
      const loadedResumes: ResumeFile[] = []
      
      for (const path in modules) {
        const fileName = path.split('/').pop()?.replace('.md', '') || 'Untitled'
        const existsInStorage = resumes.some(r => r.path === path)
        
        if (!existsInStorage) {
          loadedResumes.push({
            name: fileName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            path: path,
          })
        }
      }
      
      if (loadedResumes.length > 0) {
        const allResumes = [...resumes, ...loadedResumes]
        setResumes(allResumes)
        localStorage.setItem('resumeBuilder_files', JSON.stringify(allResumes))
      }
    } catch (error) {
      console.error('Error loading resumes:', error)
    }
    setLoading(false)
  }

  const handleOpenResume = async (resume: ResumeFile) => {
    try {
      const savedContent = localStorage.getItem(`resumeBuilder_content_${resume.name}`)
      if (savedContent) {
        onSelectResume(savedContent, resume.name)
        return
      }

      const modules = import.meta.glob('/src/resumes/*.md', { as: 'raw' })
      if (modules[resume.path]) {
        const content = await modules[resume.path]()
        onSelectResume(content as string, resume.name)
      }
    } catch (error) {
      console.error('Error opening resume:', error)
    }
  }

  const handleDeleteResume = (resume: ResumeFile, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Delete "${resume.name}"?`)) {
      const updated = resumes.filter(r => r.name !== resume.name)
      setResumes(updated)
      localStorage.setItem('resumeBuilder_files', JSON.stringify(updated))
      localStorage.removeItem(`resumeBuilder_content_${resume.name}`)
      localStorage.removeItem(`resumeBuilder_style_${resume.name}`)
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📄 Resume Builder</h1>
        <p>Create, edit, and manage your professional resumes</p>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-actions">
          <button className="btn-create-new" onClick={onCreateNew}>
            <span className="icon">+</span>
            Create New Resume
          </button>
        </div>

        <div className="resumes-section">
          <h2>Your Resumes</h2>
          
          {loading ? (
            <div className="loading">Loading resumes...</div>
          ) : resumes.length === 0 ? (
            <div className="empty-state">
              <p>No resumes yet. Create your first one!</p>
            </div>
          ) : (
            <div className="resumes-grid">
              {resumes.map((resume) => (
                <div 
                  key={resume.name} 
                  className="resume-card"
                  onClick={() => handleOpenResume(resume)}
                >
                  <div className="resume-card-icon">📄</div>
                  <div className="resume-card-info">
                    <h3>{resume.name}</h3>
                    {resume.lastModified && (
                      <span className="last-modified">Last edited: {resume.lastModified}</span>
                    )}
                  </div>
                  <button 
                    className="btn-delete-resume"
                    onClick={(e) => handleDeleteResume(resume, e)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
