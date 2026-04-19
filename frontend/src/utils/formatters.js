export const generateId = () => Math.random().toString(36).substr(2, 9)

export const slugify = (text) =>
  text.replace(/[^a-z0-9]/gi, '-').toLowerCase().replace(/-+/g, '-')

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
