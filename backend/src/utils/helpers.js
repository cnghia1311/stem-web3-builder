/**
 * Hàm tiện ích chung
 */

// Tạo slug an toàn cho filename
export const slugify = (text) =>
  text.replace(/[^a-z0-9]/gi, '-').toLowerCase().replace(/-+/g, '-')

// Tạo ID ngắn random
export const generateId = () => Math.random().toString(36).substr(2, 9)

// Format ObjectId — loại bỏ field _destroy, thêm trường tùy ý
export const pickFields = (object, fields) => {
  const result = {}
  fields.forEach(field => {
    if (object[field] !== undefined) {
      result[field] = object[field]
    }
  })
  return result
}
