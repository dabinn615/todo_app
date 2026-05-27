const STORAGE_KEY = 'todos';
const MOOD_KEY = 'moods';

let todos = [];
let filter = 'all';
let moods = {};
let calYear, calMonth;

// --- 날짜 키 ---
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// --- 기분 ---
function loadMoods() {
  try { moods = JSON.parse(localStorage.getItem(MOOD_KEY)) || {}; }
  catch { moods = {}; }
}

function saveMoods() {
  localStorage.setItem(MOOD_KEY, JSON.stringify(moods));
}

function setMood(mood, emoji) {
  moods[todayKey()] = { mood, emoji };
  saveMoods();
  document.getElementById('mood-overlay').classList.remove('visible');
}

function checkMoodOverlay() {
  document.getElementById('mood-overlay').classList.add('visible');
}

// --- 할 일 ---
function load() {
  try { todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { todos = []; }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  todos.push({ id: Date.now(), text: trimmed, completed: false, priority: 0 });
  save();
  render();
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) { todo.completed = !todo.completed; save(); render(); }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  save();
  render();
}

function setPriority(id, stars) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.priority = todo.priority === stars ? 0 : stars;
    save();
    render();
  }
}

function deleteCompleted() {
  todos = todos.filter(t => !t.completed);
  save();
  render();
}

function setFilter(f) {
  filter = f;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === f);
  });
  render();
}

function getFiltered() {
  let result;
  if (filter === 'active') result = todos.filter(t => !t.completed);
  else if (filter === 'completed') result = todos.filter(t => t.completed);
  else result = [...todos];
  return result.sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

function render() {
  const list = document.getElementById('todo-list');
  const emptyMsg = document.getElementById('empty-msg');
  const stats = document.getElementById('stats');
  const clearBtn = document.getElementById('clear-completed-btn');

  const filtered = getFiltered();
  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;

  stats.textContent = totalCount > 0 ? `완료 ${completedCount}개 / 전체 ${totalCount}개` : '';
  clearBtn.style.display = completedCount > 0 ? 'block' : 'none';
  list.innerHTML = '';

  if (filtered.length === 0) {
    emptyMsg.classList.add('visible');
  } else {
    emptyMsg.classList.remove('visible');
    filtered.forEach(todo => {
      const li = document.createElement('li');
      li.className = `todo-item${todo.completed ? ' completed' : ''}`;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'todo-checkbox';
      checkbox.checked = todo.completed;
      checkbox.addEventListener('change', () => toggleTodo(todo.id));

      const span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = todo.text;

      const stars = document.createElement('div');
      stars.className = 'priority-stars';
      for (let i = 1; i <= 3; i++) {
        const star = document.createElement('button');
        star.className = 'star-btn' + (i <= (todo.priority || 0) ? ' active' : '');
        star.textContent = '★';
        star.setAttribute('aria-label', `우선순위 ${i}`);
        star.addEventListener('click', () => setPriority(todo.id, i));
        stars.appendChild(star);
      }

      const delBtn = document.createElement('button');
      delBtn.className = 'delete-btn';
      delBtn.textContent = '✕';
      delBtn.setAttribute('aria-label', '삭제');
      delBtn.addEventListener('click', () => deleteTodo(todo.id));

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(stars);
      li.appendChild(delBtn);
      list.appendChild(li);
    });
  }
}

// --- 달력 ---
function renderCalendar() {
  const title = document.getElementById('cal-title');
  const grid = document.getElementById('calendar-grid');

  const firstDay = new Date(calYear, calMonth, 1);
  const lastDay = new Date(calYear, calMonth + 1, 0);
  const startDow = firstDay.getDay();
  const totalDays = lastDay.getDate();

  title.textContent = `${calYear}년 ${calMonth + 1}월`;
  grid.innerHTML = '';

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  dayNames.forEach((d, i) => {
    const cell = document.createElement('div');
    cell.className = 'cal-header-cell' + (i === 0 ? ' sun' : i === 6 ? ' sat' : '');
    cell.textContent = d;
    grid.appendChild(cell);
  });

  for (let i = 0; i < startDow; i++) {
    const cell = document.createElement('div');
    cell.className = 'cal-cell empty';
    grid.appendChild(cell);
  }

  const today = todayKey();
  for (let d = 1; d <= totalDays; d++) {
    const dow = (startDow + d - 1) % 7;
    const dateKey = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const moodData = moods[dateKey];

    const cell = document.createElement('div');
    cell.className = 'cal-cell'
      + (dateKey === today ? ' today' : '')
      + (dow === 0 ? ' sun' : dow === 6 ? ' sat' : '');

    const num = document.createElement('span');
    num.className = 'cal-date';
    num.textContent = d;
    cell.appendChild(num);

    if (moodData) {
      const emojiEl = document.createElement('span');
      emojiEl.className = 'cal-mood';
      emojiEl.textContent = moodData.emoji;
      cell.appendChild(emojiEl);
    }

    grid.appendChild(cell);
  }
}

// --- 탭 ---
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  document.getElementById(`view-${tab}`).classList.remove('hidden');
  if (tab === 'calendar') renderCalendar();
}

// --- 초기화 ---
document.addEventListener('DOMContentLoaded', () => {
  load();
  loadMoods();

  const now = new Date();
  calYear = now.getFullYear();
  calMonth = now.getMonth();

  render();
  checkMoodOverlay();

  document.getElementById('todo-form').addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('todo-input');
    addTodo(input.value);
    input.value = '';
    input.focus();
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  document.getElementById('clear-completed-btn').addEventListener('click', deleteCompleted);

  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => setMood(btn.dataset.mood, btn.dataset.emoji));
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.getElementById('cal-prev').addEventListener('click', () => {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });

  document.getElementById('cal-next').addEventListener('click', () => {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });
});
