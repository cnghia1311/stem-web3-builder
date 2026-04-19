import { useNavigate } from 'react-router-dom'
import './AppBar.css'

function AppBar({ user, onLogout, projectId }) {
  const navigate = useNavigate()

  return (
    <header className="appbar">
      <div className="appbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        🧱 <span>STEM Web3 Builder</span>
      </div>

      <div className="appbar-actions">
        {projectId && (
          <button 
            className="btn-preview" 
            onClick={() => navigate(`/preview/${projectId}`)}
            style={{
              padding: '6px 14px',
              background: 'var(--color-primary)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              color: 'white',
              fontSize: '13px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            👁️ Xem trước
          </button>
        )}
        {user && (
          <>
            <div className="appbar-user" onClick={() => navigate('/')}>
              <div className="appbar-avatar">
                {user.displayName?.charAt(0)?.toUpperCase() || '?'}
              </div>
              {user.displayName}
            </div>
            <button className="btn-logout" onClick={onLogout}>
              Đăng xuất
            </button>
          </>
        )}
      </div>
    </header>
  )
}

export default AppBar
