/**
 * Script tách blocks.js (105KB) → thư mục riêng cho từng block
 * Chạy 1 lần: node scripts/extract-blocks.js
 *
 * Input:  ../react-builder/src/data/blocks.js
 * Output: data/blocks/<id>/meta.json + export.html + engine.js + global.js + bindings.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Import BLOCKS từ react-builder
const blocksPath = path.resolve(__dirname, '../../react-builder/src/data/blocks.js')
const { BLOCKS } = await import('file:///' + blocksPath.replace(/\\/g, '/'))

const OUTPUT_DIR = path.resolve(__dirname, '../data/blocks')

console.log('🔄 Extract Blocks Script')
console.log('========================')
console.log(`📂 Source: ${blocksPath}`)
console.log(`📂 Output: ${OUTPUT_DIR}`)
console.log(`📦 Found ${BLOCKS.length} blocks`)
console.log('')

for (const block of BLOCKS) {
  const dir = path.join(OUTPUT_DIR, block.id)
  fs.mkdirSync(dir, { recursive: true })

  // ===== 1. meta.json =====
  const meta = {
    id: block.id,
    name: block.name,
    desc: block.desc,
    color: block.color,
    label: block.label
  }
  if (block.required) meta.required = true
  if (block.multiToken) meta.multiToken = true
  if (block.contractKey) meta.contractKey = block.contractKey
  if (block.contractPlaceholder) meta.contractPlaceholder = block.contractPlaceholder

  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf-8')

  // ===== 2. export.html =====
  if (typeof block.exportHtml === 'function') {
    let html = ''
    try {
      if (block.multiToken) {
        // balance, transfer: (tk, tokenList)
        // Gọi với tokenList rỗng → sẽ dùng default option
        html = block.exportHtml('TOKEN_NAME', [])
      } else if (block.contractKey) {
        // claim, gacha-drop, etc: (tk, contractAddr)
        html = block.exportHtml('TOKEN_NAME', 'CONTRACT_ADDRESS')
      } else {
        // wallet, etc: (tk) hoặc ()
        try {
          html = block.exportHtml('TOKEN_NAME')
        } catch (e) {
          html = block.exportHtml()
        }
      }
    } catch (e) {
      console.error(`  ⚠️  exportHtml error for ${block.id}:`, e.message)
    }

    if (html) {
      fs.writeFileSync(path.join(dir, 'export.html'), html.trim(), 'utf-8')
    }
  }

  // ===== 3. engine.js =====
  if (typeof block.engineCode === 'function') {
    let code = ''
    try {
      // Một số block nhận prefix: engineCode(pfx)
      code = block.engineCode(block.id)
    } catch (e) {
      try {
        code = block.engineCode()
      } catch (e2) {
        console.error(`  ⚠️  engineCode error for ${block.id}:`, e2.message)
      }
    }

    if (code) {
      fs.writeFileSync(path.join(dir, 'engine.js'), code.trim(), 'utf-8')
    }
  }

  // ===== 4. global.js =====
  if (typeof block.globalCode === 'function') {
    let code = ''
    try {
      code = block.globalCode()
    } catch (e) {
      console.error(`  ⚠️  globalCode error for ${block.id}:`, e.message)
    }

    if (code) {
      fs.writeFileSync(path.join(dir, 'global.js'), code.trim(), 'utf-8')
    }
  }

  // ===== 5. bindings.json =====
  if (block.bindings && block.bindings.length > 0) {
    fs.writeFileSync(path.join(dir, 'bindings.json'), JSON.stringify(block.bindings, null, 2), 'utf-8')
  }

  // Thống kê
  const files = fs.readdirSync(dir)
  console.log(`  ✅ ${block.id}/ → [${files.join(', ')}]`)
}

console.log('')
console.log(`✅ Đã tách ${BLOCKS.length} blocks thành công!`)
