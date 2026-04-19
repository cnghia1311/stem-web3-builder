import { StatusCodes } from 'http-status-codes'
import { blockCache } from '../engine/blockCache.js'
import { assembler } from '../engine/assembler.js'
import { appModel } from '../models/appModel.js'
import ApiError from '../utils/ApiError.js'
import { slugify } from '../utils/helpers.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const APPS_DIR = path.resolve(__dirname, '../../apps')

// Tạo thư mục apps nếu chưa có
if (!fs.existsSync(APPS_DIR)) fs.mkdirSync(APPS_DIR, { recursive: true })

/**
 * Build HTML từ data truyền trực tiếp (không cần DB)
 * Dùng cho Preview + Tab Test
 */
const buildHtmlFromData = async (reqBody) => {
  const tabs = reqBody.tabs
  const config = reqBody.config || {}
  const contracts = reqBody.contracts || {}

  if (!tabs || !Array.isArray(tabs)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu trường "tabs"!')
  }

  const html = assembler.buildFullHtml(tabs, config, contracts, blockCache)
  return { html }
}

/**
 * Build HTML + lưu file + ghi metadata vào MongoDB → trả URL
 * Dùng cho nút "🚀 Mở Tab Test"
 * @param {Object} reqBody - { tabs, config, contracts, appTitle }
 * @param {Object} userInfo - { _id, displayName } từ JWT (nếu có)
 */
const saveHtmlFromData = async (reqBody, userInfo = null) => {
  const { html } = await buildHtmlFromData(reqBody)

  // Tạo tên file an toàn
  const appTitle = reqBody.appTitle || reqBody.config?.tokenName || 'app'
  const timestamp = Date.now().toString(36)
  const safeName = 'app-' + timestamp + '.html'
  const filePath = path.join(APPS_DIR, safeName)

  fs.writeFileSync(filePath, html, 'utf-8')

  // Lưu metadata vào MongoDB (nếu có user đăng nhập)
  if (userInfo && userInfo._id) {
    try {
      await appModel.createNew({
        userId: userInfo._id,
        authorEmail: userInfo.email || 'Anonymous',
        filename: safeName,
        title: appTitle,
        url: '/apps/' + safeName,
        size: Buffer.byteLength(html, 'utf-8')
      })
    } catch (error) {
      // Nếu lưu metadata lỗi, file vẫn đã được tạo → không throw
      console.error('⚠️ Lưu metadata app thất bại:', error.message)
    }
  }

  return {
    url: '/apps/' + safeName,
    filename: safeName,
    title: appTitle
  }
}

/**
 * Hàm cũ — export từ projectId (cần DB)
 */
const exportHtml = async (reqBody) => {
  // Nếu truyền trực tiếp tabs → dùng hàm mới
  if (reqBody.tabs) {
    return buildHtmlFromData(reqBody)
  }

  throw new ApiError(StatusCodes.NOT_IMPLEMENTED, 'Chưa hỗ trợ export từ projectId!')
}

export const exportService = {
  buildHtmlFromData,
  saveHtmlFromData,
  exportHtml
}
