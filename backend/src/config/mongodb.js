import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './environment.js'

// Khởi tạo instance MongoClient
let stemDatabaseInstance = null

const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

// Kết nối tới MongoDB
export const CONNECT_DB = async () => {
  // Gọi kết nối tới MongoDB Atlas
  await mongoClientInstance.connect()

  // Kết nối thành công lấy Database theo tên
  stemDatabaseInstance = mongoClientInstance.db('stem-web3')
}

// Hàm GET Database Instance (dùng ở Models)
export const GET_DB = () => {
  if (!stemDatabaseInstance) throw new Error('Must connect to Database first!')
  return stemDatabaseInstance
}

// Đóng kết nối
export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}
