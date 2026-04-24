import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import AppBar from '~/components/AppBar/AppBar'
import { fetchMyApps, exploreApps, deleteApp } from '~/apis/appsApi'
import './Apps.css'

function Apps({ user, onLogout }) {
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState('my') // 'my' hoặc 'explore'
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingApp, setDeletingApp] = useState(null)

  // Explore state
  const [searchText, setSearchText] = useState('')
  const [authorText, setAuthorText] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalApps: 0 })

  const BACKEND_URL = 'http://localhost:3000'

  useEffect(() => {
    loadApps()
  }, [activeView])

  const loadApps = async (page = 1) => {
    try {
      setLoading(true)
      if (activeView === 'my') {
        const data = await fetchMyApps()
        setApps(data || [])
      } else {
        const data = await exploreApps({
          page,
          limit: 12,
          search: searchText,
          author: authorText,
          sort: sortBy
        })
        setApps(data.apps || [])
        setPagination(data.pagination || { page: 1, totalPages: 1, totalApps: 0 })
      }
    } catch (error) {
      toast.error('Không thể tải danh sách app!')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadApps(1)
  }

  const handleOpenApp = (app) => {
    window.open(BACKEND_URL + app.url, '_blank')
  }

  const handleDeleteApp = async (e, app) => {
    e.stopPropagation()
    if (deletingApp) return

    setDeletingApp(app.filename)
    try {
      await deleteApp(app.filename)
      setApps(prev => prev.filter(a => a.filename !== app.filename))
      toast.success(`Đã xóa ${app.title}! 🗑️`)
    } catch (error) {
      const msg = error.response?.data?.message || 'Lỗi khi xóa app!'
      toast.error(msg)
    } finally {
      setDeletingApp(null)
    }
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (isoStr) => {
    if (!isoStr) return ''
    const d = new Date(isoStr)
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="apps-page">
      <AppBar user={user} onLogout={onLogout} />

      <div className="apps-content">
        <div className="apps-header">
          <div className="apps-header-left">
            <button className="btn-back" onClick={() => navigate('/')}>
              ← Quay lại
            </button>

            {/* Tab switch */}
            <div className="apps-tabs">
              <button
                className={`apps-tab ${activeView === 'my' ? 'active' : ''}`}
                onClick={() => setActiveView('my')}
              >
                📱 Apps Của Tôi
              </button>
              <button
                className={`apps-tab ${activeView === 'explore' ? 'active' : ''}`}
                onClick={() => setActiveView('explore')}
              >
                🌐 Khám Phá
              </button>
            </div>

            <span className="apps-count">
              {activeView === 'my' ? `${apps.length} app` : `${pagination.totalApps} app`}
            </span>
          </div>
          <button className="btn-refresh" onClick={() => loadApps()} disabled={loading}>
            🔄 Làm mới
          </button>
        </div>

        {/* Search bar cho Explore */}
        {activeView === 'explore' && (
          <form className="apps-search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="🔍 Tìm theo tên app..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
            />
            <input
              type="text"
              placeholder="📧 Lọc theo email tác giả..."
              value={authorText}
              onChange={(e) => setAuthorText(e.target.value)}
              className="search-input"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
            <button type="submit" className="btn-search">Tìm</button>
          </form>
        )}

        {loading ? (
          <div className="apps-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách app...</p>
          </div>
        ) : apps.length === 0 ? (
          <div className="apps-empty">
            <div className="apps-empty-icon">📦</div>
            <h3>{activeView === 'my' ? 'Bạn chưa xuất app nào' : 'Không tìm thấy app'}</h3>
            <p>
              {activeView === 'my'
                ? 'Tạo dự án và bấm "🚀 Mở Tab Test" trong Builder để xuất app đầu tiên'
                : 'Thử tìm kiếm với từ khóa khác'
              }
            </p>
            {activeView === 'my' && (
              <button className="btn-go-builder" onClick={() => navigate('/')}>
                🧱 Về Dashboard
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="apps-grid">
              {apps.map(app => (
                <div
                  key={app.filename}
                  className="app-card"
                  onClick={() => handleOpenApp(app)}
                >
                  <div className="app-card-glow"></div>

                  {/* Chỉ hiện nút xóa ở tab "Của Tôi" */}
                  {activeView === 'my' && (
                    <button
                      className="btn-delete-app"
                      onClick={(e) => handleDeleteApp(e, app)}
                      disabled={deletingApp === app.filename}
                    >
                      {deletingApp === app.filename ? '⏳' : '✕'}
                    </button>
                  )}

                  <div className="app-card-icon">
                    <span className="app-icon-emoji">🌐</span>
                    <div className="app-icon-ring"></div>
                  </div>

                  <h3 className="app-card-title">{app.title}</h3>

                  {/* Hiện email tác giả ở Explore */}
                  {activeView === 'explore' && app.authorEmail && (
                    <p className="app-card-author">📧 {app.authorEmail}</p>
                  )}

                  <p className="app-card-filename">{app.filename}</p>

                  <div className="app-card-meta">
                    <span className="meta-badge meta-size">
                      📄 {formatSize(app.size)}
                    </span>
                    <span className="meta-badge meta-date">
                      🕐 {formatDate(app.createdAt)}
                    </span>
                  </div>

                  <div className="app-card-action">
                    <span>Bấm để mở ↗</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Phân trang cho Explore */}
            {activeView === 'explore' && pagination.totalPages > 1 && (
              <div className="apps-pagination">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => loadApps(pagination.page - 1)}
                >
                  ← Trước
                </button>
                <span>Trang {pagination.page}/{pagination.totalPages}</span>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadApps(pagination.page + 1)}
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Apps
