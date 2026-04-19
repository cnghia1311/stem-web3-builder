import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '../config/mongodb.js'
import { USER_ROLES } from '../utils/constants.js'

// Collection name
const USER_COLLECTION_NAME = 'users'

// Schema validation cho collection
const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string().email().required().trim().lowercase(),
  password: Joi.string().required().min(6),
  displayName: Joi.string().required().trim().min(2).max(50),
  avatar: Joi.string().uri().allow('').default(''),
  role: Joi.string().valid(USER_ROLES.STUDENT, USER_ROLES.TEACHER).default(USER_ROLES.STUDENT),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Chỉ validate những field cho phép khi update
const INVALID_UPDATE_FIELDS = ['_id', 'email', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  const validData = await validateBeforeCreate(data)
  return await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validData)
}

const findOneById = async (id) => {
  return await GET_DB().collection(USER_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
}

const findOneByEmail = async (email) => {
  return await GET_DB().collection(USER_COLLECTION_NAME).findOne({ email: email.toLowerCase() })
}

const findOneByDisplayName = async (displayName) => {
  // Tìm kiếm case-insensitive
  return await GET_DB().collection(USER_COLLECTION_NAME).findOne({ 
    displayName: { $regex: new RegExp(`^${displayName}$`, 'i') } 
  })
}

const update = async (id, updateData) => {
  // Lọc bỏ field không cho phép update
  Object.keys(updateData).forEach(fieldName => {
    if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
      delete updateData[fieldName]
    }
  })

  const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...updateData, updatedAt: Date.now() } },
    { returnDocument: 'after' }
  )

  return result
}

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  findOneByEmail,
  findOneByDisplayName,
  update
}
