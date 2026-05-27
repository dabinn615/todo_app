const STORAGE_KEY = 'todos';

let todos = [];
let filter = 'all';

function load() {
  try {
    todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    todos = [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  todos.push({ id: Date.now(), text: trimmed, completed: false });
  save();
  render();
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    save();
    render();
  }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
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
  if (filter === 'active') return todos.filter(t => !t.completed);
  if (filter === 'completed') return todos.filter(t => t.completed);
  return todos;
}

function render() {
  const list = document.getElementById('todo-list');
  const emptyMsg = document.getElementById('empty-msg');
  const stats = document.getElementById('stats');

  const filtered = getFiltered();
  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;

  stats.textContent = totalCount > 0
    ? `완료 ${completedCount}개 / 전체 ${totalCount}개`
    : '';

  list.innerHTML = '';

  if (filtered.length === 0) {
    emptyMsg.classList.add('visible');
  } else {
    emptyMsg.classList.remove('visible');
    filtered.forEach(todo => {
      const li = document.createElement('li');
      li.className = `todo-item${todo.completed ? ' completed' : ''}`;
      li.dataset.id = todo.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'todo-checkbox';
      checkbox.checked = todo.completed;
      checkbox.addEventListener('change', () => toggleTodo(todo.id));

      const span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = todo.text;

      const delBtn = document.createElement('button');
      delBtn.className = 'delete-btn';
      delBtn.textContent = '✕';
      delBtn.setAttribute('aria-label', '삭제');
      delBtn.addEventListener('click', () => deleteTodo(todo.id));

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(delBtn);
      list.appendChild(li);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  load();
  render();

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
});
