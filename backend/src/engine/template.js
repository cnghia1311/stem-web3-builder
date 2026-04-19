/**
 * HTML Shell Template — boilerplate cho app xuất ra
 * Tương tự exportEngine.js cũ nhưng tách riêng
 */

export const getHtmlShell = (config = {}) => {
  const { tokenName = 'STEM', theme = 'dark', layout = 'mobile' } = config
  const maxWidth = layout === 'mobile' ? '440px' : '100%'

  return {
    head: `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${tokenName} — Web3 App</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Segoe UI',sans-serif;min-height:100vh;display:flex;justify-content:center;
${theme === 'dark'
    ? 'background:linear-gradient(135deg,#0f172a,#1e293b);color:#e2e8f0;'
    : theme === 'neon'
      ? 'background:linear-gradient(135deg,#0a0015,#1a0030);color:#e0d0ff;'
      : 'background:#f0f4f8;color:#1e293b;'
}}
.app-container{width:100%;max-width:${maxWidth};padding:16px 12px;margin:0 auto;}
.tab-bar{display:flex;gap:6px;margin-bottom:16px;overflow-x:auto;}
.tab-btn{padding:8px 18px;border:none;border-radius:20px;cursor:pointer;font-size:13px;font-weight:600;transition:all .2s;
${theme === 'dark'
    ? 'background:rgba(255,255,255,0.06);color:#94a3b8;'
    : theme === 'neon'
      ? 'background:rgba(139,92,246,0.15);color:#a78bfa;'
      : 'background:#e2e8f0;color:#475569;'
}}
.tab-btn.active{
${theme === 'dark'
    ? 'background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;'
    : theme === 'neon'
      ? 'background:linear-gradient(135deg,#8b5cf6,#ec4899);color:#fff;'
      : 'background:#6366f1;color:#fff;'
}}
.tab-content{display:none;}
.tab-content.active{display:block;}
.row{display:grid;gap:12px;margin-bottom:12px;}
.row-1{grid-template-columns:1fr;}
.row-2{grid-template-columns:1fr 1fr;}
.row-3{grid-template-columns:1fr 1fr 1fr;}
.khoi{
${theme === 'dark'
    ? 'background:rgba(30,41,59,0.8);border:1px solid #334155;'
    : theme === 'neon'
      ? 'background:rgba(20,0,50,0.6);border:1px solid rgba(139,92,246,0.3);'
      : 'background:#ffffff;border:1px solid #e2e8f0;'
}
border-radius:16px;padding:20px;border-left:4px solid;position:relative;}
.khoi-title{font-size:15px;font-weight:700;margin-bottom:12px;}
button{width:100%;padding:12px;border:none;border-radius:10px;color:#fff;font-weight:600;cursor:pointer;font-size:14px;transition:all .2s;}
button:hover{opacity:0.9;transform:translateY(-1px);}
select,input{font-family:inherit;}
.toast-container{position:fixed;top:16px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;}
.toast{padding:12px 20px;border-radius:10px;color:#fff;font-size:13px;font-weight:500;opacity:0;transform:translateX(100px);animation:toastIn .3s ease forwards;}
.toast.success{background:linear-gradient(135deg,#10b981,#34d399);}
.toast.error{background:linear-gradient(135deg,#ef4444,#f87171);}
.toast.info{background:linear-gradient(135deg,#3b82f6,#60a5fa);}
@keyframes toastIn{to{opacity:1;transform:translateX(0);}}
</style>
</head>
<body>
<div class="toast-container" id="toast-container"></div>
<div class="app-container">
`,

    foot: `
</div>
<script>
let provider,signer,userAddr;
function toast(type,msg){
  const c=document.getElementById('toast-container');
  const d=document.createElement('div');d.className='toast '+type;d.textContent=msg;
  c.appendChild(d);setTimeout(()=>d.remove(),3500);
}
</script>
`
  }
}
