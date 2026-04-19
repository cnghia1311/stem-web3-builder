import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import AppBar from '~/components/AppBar/AppBar'
import { generateId, formatDate } from '~/utils/formatters'
import './Dashboard.css'

function Dashboard({ user, onLogout, projects, setProjects, maxProjects = 5 }) {
  const navigate = useNavigate()

  const handleCreateProject = () => {
    if (projects.length >= maxProjects) {
      toast.warning(`Tối đa ${maxProjects} dự án! Hãy xóa dự án cũ để tạo mới.`)
      return
    }

    const newProject = {
      _id: generateId(),
      title: 'Dự Án Mới',
      description: 'Mô tả dự án...',
      config: { tokenName: 'TOKEN', theme: 'dark', layout: 'mobile' },
      contracts: {},
      tabs: [
        {
          id: 'tab-1',
          name: '🏠 Trang Chủ',
          rows: []
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setProjects(prev => [newProject, ...prev])
    navigate(`/builder/${newProject._id}`)
  }

  const handleDeleteProject = (e, projectId) => {
    e.preventDefault()
    e.stopPropagation()
    setProjects(prev => prev.filter(p => p._id !== projectId))
    toast.success('Đã xóa dự án! 🗑️')
  }

  return (
    <div className="dashboard">
      <AppBar user={user} onLogout={onLogout} />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>📁 Dự Án Của Tôi</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {projects.length}/{maxProjects}
            </span>
            <button
              className="btn-view-apps"
              onClick={() => navigate('/apps')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 20px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              📱 Xem Apps Đã Xuất
            </button>
            <button
              className="btn-new-project"
              onClick={handleCreateProject}
              style={{
                opacity: projects.length >= maxProjects ? 0.5 : 1
              }}
            >
              ＋ Tạo Dự Án Mới
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧱</div>
            <h3>Chưa có dự án nào</h3>
            <p>Bấm &quot;Tạo Dự Án Mới&quot; để bắt đầu xây dựng ứng dụng Web3</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(project => (
              <div
                key={project._id}
                className="project-card"
                onClick={() => navigate(`/builder/${project._id}`)}
              >
                <button
                  className="btn-delete-project"
                  onClick={(e) => handleDeleteProject(e, project._id)}
                >
                  ✕
                </button>
                <div className="project-card-icon">🧱</div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="project-card-footer">
                  <span>{formatDate(project.updatedAt)}</span>
                  <div className="project-card-blocks">
                    <span>{project.tabs?.[0]?.rows?.length || 0} hàng</span>
                    <span>{project.tabs?.length || 1} trang</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
