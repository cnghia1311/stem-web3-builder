/**
 * Assembler — Nối HTML hoàn chỉnh từ project data
 * GỌI HÀM trực tiếp trên block objects (không đọc string templates)
 */
import { getHtmlShell } from './template.js'

class Assembler {
  /**
   * Build full HTML từ project data
   * @param {Array} tabs - Mảng tab, mỗi tab có { id, name, rows: [{ id, columns, blocks: ["wallet", "balance", null] }] }
   * @param {Object} config - Cấu hình app { title, theme, layout, tokenName }
   * @param {Object} contracts - Contract addresses { balance: { tokenAddress: "0x..." }, ... }
   * @param {BlockCache} cache - Block cache instance
   */
  buildFullHtml(tabs, config, contracts, cache) {
    const tokenName = config.tokenName || config.title || 'STEM'
    const shell = getHtmlShell({ ...config, tokenName })

    let bodyHtml = ''
    const engineParts = []
    const globalParts = []
    const bindingParts = []
    const usedBlockIds = new Set()

    // ═══ Tab bar ═══
    if (tabs.length > 1) {
      bodyHtml += '<div class="tab-bar">\n'
      tabs.forEach((tab, i) => {
        bodyHtml += `  <button class="tab-btn${i === 0 ? ' active' : ''}" onclick="switchTab(${i})">${tab.name}</button>\n`
      })
      bodyHtml += '</div>\n'
    }

    // ═══ Từng tab ═══
    tabs.forEach((tab, tabIdx) => {
      bodyHtml += `<div class="tab-content${tabIdx === 0 ? ' active' : ''}" id="tab-${tabIdx}">\n`

      const rows = tab.rows || []
      for (const row of rows) {
        const cols = row.columns || 1
        bodyHtml += `  <div class="row row-${cols}">\n`

        const blocks = row.blocks || []
        for (let i = 0; i < cols; i++) {
          const rawBlock = blocks[i]

          // Hỗ trợ cả string "wallet" và object { blockId: "wallet" }
          const blockId = typeof rawBlock === 'string' ? rawBlock
            : (rawBlock?.blockId || null)

          if (blockId) {
            const block = cache.getBlock(blockId)

            if (block && block.exportHtml) {
              // Lấy contract data cho block này
              const contractData = contracts?.[blockId] || {}

              // Xây dựng token list (cho balance/transfer multiToken)
              const tokenList = contractData.tokenAddress
                ? [contractData.tokenAddress]
                : (contractData.tokens || [])

              // Gọi HÀM exportHtml — truyền tham số đúng chuẩn
              const blockHtml = typeof block.exportHtml === 'function'
                ? block.exportHtml(tokenName, tokenList.length > 0 ? tokenList : contractData)
                : block.exportHtml

              bodyHtml += blockHtml + '\n'

              // Thu thập engine code — gọi hàm với prefix rỗng ''
              if (block.engineCode && !usedBlockIds.has(blockId + '-engine')) {
                usedBlockIds.add(blockId + '-engine')
                const code = typeof block.engineCode === 'function'
                  ? block.engineCode('')
                  : block.engineCode
                if (code) engineParts.push(code)
              }

              // Thu thập global code (chỉ 1 lần per blockId)
              if (block.globalCode && !usedBlockIds.has(blockId + '-global')) {
                usedBlockIds.add(blockId + '-global')
                const code = typeof block.globalCode === 'function'
                  ? block.globalCode()
                  : block.globalCode
                if (code) globalParts.push(code)
              }

              // Thu thập bindings
              if (block.bindings && !usedBlockIds.has(blockId + '-bind')) {
                usedBlockIds.add(blockId + '-bind')
                block.bindings.forEach(b => {
                  const event = b.event || 'click'
                  bindingParts.push(
                    `document.getElementById('${b.btn}')?.addEventListener('${event}',${b.fn});`
                  )
                })
              }
            } else {
              bodyHtml += `    <div class="khoi" style="border-left-color:#666;opacity:0.5;"><div class="khoi-title">⚠️ Block not found: ${blockId}</div></div>\n`
            }
          } else {
            bodyHtml += `    <div></div>\n`
          }
        }

        bodyHtml += '  </div>\n'
      }

      bodyHtml += '</div>\n'
    })

    // ═══ Tab switching script ═══
    const tabScript = tabs.length > 1
      ? `\nfunction switchTab(idx){
  document.querySelectorAll('.tab-content').forEach((t,i)=>{t.classList.toggle('active',i===idx);});
  document.querySelectorAll('.tab-btn').forEach((b,i)=>{b.classList.toggle('active',i===idx);});
}\n`
      : ''

    // ═══ Nối tất cả ═══
    const fullHtml = shell.head
      + bodyHtml
      + shell.foot
      + '\n<script>\n'
      + '// ═══ GLOBAL CODE ═══\n'
      + globalParts.join('\n')
      + '\n// ═══ ENGINE CODE ═══\n'
      + engineParts.join('\n')
      + '\n// ═══ TAB SWITCHING ═══\n'
      + tabScript
      + '\n// ═══ BINDINGS ═══\n'
      + bindingParts.join('\n')
      + '\n</script>\n</body>\n</html>'

    return fullHtml
  }
}

export const assembler = new Assembler()
