import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '../config/mongodb.js'

// Collection name
const APP_COLLECTION_NAME = 'apps'

// Schema validation cho collection
const APP_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required(), // Ref → users — ai đã xuất app này
  authorEmail: Joi.string().email().required().trim(), // Email của người tạo (để tìm kiếm)
  filename: Joi.string().required().trim(), // "app-mnv47cm8.html"
  title: Joi.string().required().trim().min(1).max(200), // Tên app do user đặt
  url: Joi.string().required().trim(), // "/apps/app-mnv47cm8.html"
  size: Joi.number().integer().min(0).default(0), // Dung lượng file (bytes)
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  _destroy: Joi.boolean().default(false)
})

// Field không cho phép update
const INVALID_UPDATE_FIELDS = ['_id', 'userId', 'filename', 'url', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await APP_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  const validData = await validateBeforeCreate(data)
  return await GET_DB().collection(APP_COLLECTION_NAME).insertOne(validData)
}

const findOneById = async (id) => {
  return await GET_DB().collection(APP_COLLECTION_NAME).findOne({
    _id: new ObjectId(id),
    _destroy: false
  })
}

const findOneByFilename = async (filename) => {
  return await GET_DB().collection(APP_COLLECTION_NAME).findOne({
    filename: filename,
    _destroy: false
  })
}

/**
 * Lấy danh sách apps của 1 user (Trang "Apps Của Tôi")
 */
const getListByUserId = async (userId) => {
  return await GET_DB().collection(APP_COLLECTION_NAME).find({
    userId: userId,
    _destroy: false
  }).sort({ createdAt: -1 }).toArray()
}

/**
 * Khám phá apps công khai (Trang "Explore")
 * Hỗ trợ: phân trang, tìm kiếm theo title, lọc theo author, sắp xếp
 */
const explore = async ({ page = 1, limit = 12, search = '', author = '', sort = 'newest' }) => {
  const filter = { _destroy: false }

  // Tìm theo title
  if (search) {
    filter.title = { $regex: search, $options: 'i' }
  }

  // Lọc theo email người tạo
  if (author) {
    filter.authorEmail = { $regex: author, $options: 'i' }
  }

  // Sắp xếp
  const sortOption = sort === 'oldest'
    ? { createdAt: 1 }
    : { createdAt: -1 } // mặc định: mới nhất

  const skip = (page - 1) * limit

  const [apps, totalApps] = await Promise.all([
    GET_DB().collection(APP_COLLECTION_NAME)
      .find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .toArray(),
    GET_DB().collection(APP_COLLECTION_NAME)
      .countDocuments(filter)
  ])

  return {
    apps,
    pagination: {
      page,
      limit,
      totalApps,
      totalPages: Math.ceil(totalApps / limit)
    }
  }
}

/**
 * Xóa app (hard delete) — kiểm tra ownership ở tầng Service
 */
const deleteOneById = async (id) => {
  return await GET_DB().collection(APP_COLLECTION_NAME).deleteOne({
    _id: new ObjectId(id)
  })
}

export const appModel = {
  APP_COLLECTION_NAME,
  APP_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  findOneByFilename,
  getListByUserId,
  explore,
  deleteOneById
}
