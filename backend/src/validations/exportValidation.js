import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'

const exportHtml = async (req, res, next) => {
  const schema = Joi.object({
    projectId: Joi.string().required(),
    // Hoặc truyền trực tiếp tabs + config
    tabs: Joi.array().items(Joi.object()),
    config: Joi.object(),
    contracts: Joi.object()
  }).or('projectId', 'tabs') // Cần ít nhất 1 trong 2

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const exportSave = async (req, res, next) => {
  const schema = Joi.object({
    projectId: Joi.string().required(),
    filename: Joi.string().max(100).trim(),
    tabs: Joi.array().items(Joi.object()),
    config: Joi.object(),
    contracts: Joi.object()
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const exportValidation = {
  exportHtml,
  exportSave
}
