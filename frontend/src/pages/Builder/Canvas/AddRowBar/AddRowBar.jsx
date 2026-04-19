import './AddRowBar.css'

function AddRowBar({ onAddRow }) {
  return (
    <div className="add-row-bar">
      <button className="add-row-btn" onClick={() => onAddRow(1)}>＋ 1 cột</button>
      <button className="add-row-btn" onClick={() => onAddRow(2)}>＋ 2 cột</button>
      <button className="add-row-btn" onClick={() => onAddRow(3)}>＋ 3 cột</button>
    </div>
  )
}

export default AddRowBar
