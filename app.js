const STORAGE_KEY = "vscode-todo-items";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const dateInput = document.getElementById("todo-date");
const colorSelect = document.getElementById("todo-color");
const colorPreview = document.getElementById("color-preview");
const list = document.getElementById("todo-list");
const template = document.getElementById("todo-item-template");
const count = document.getElementById("task-count");
const emptyState = document.getElementById("empty-state");
const clearCompletedButton = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter");
const sortButtons = document.querySelectorAll(".sort");

let todos = loadTodos();
let filter = "all";
let sortMode = "date-asc";

const COLOR_CLASSES = ["blue", "green", "yellow", "red", "purple"];

function setFormColor(color) {
  const nextColor = COLOR_CLASSES.includes(color) ? color : "blue";
  form.dataset.color = nextColor;
  colorPreview.dataset.color = nextColor;
}

function todayValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function addTodo(text) {
  todos.unshift({
    id: crypto.randomUUID(),
    text,
    date: dateInput.value || todayValue(),
    completed: false,
    color: colorSelect.value,
  });
  saveTodos();
  render();
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo,
  );
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  render();
}

function clearCompleted() {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  render();
}

function getVisibleTodos() {
  const filtered =
    filter === "active"
      ? todos.filter((todo) => !todo.completed)
      : filter === "completed"
        ? todos.filter((todo) => todo.completed)
        : todos.slice();

  filtered.sort((a, b) => {
    const aTime = a.date ? new Date(`${a.date}T00:00:00`).getTime() : Number.POSITIVE_INFINITY;
    const bTime = b.date ? new Date(`${b.date}T00:00:00`).getTime() : Number.POSITIVE_INFINITY;

    if (aTime === bTime) return 0;
    if (sortMode === "date-desc") return bTime - aTime;
    return aTime - bTime;
  });

  return filtered;
}

function render() {
  const visibleTodos = getVisibleTodos();
  list.innerHTML = "";

  for (const todo of visibleTodos) {
    const item = template.content.firstElementChild.cloneNode(true);
    const checkbox = item.querySelector("input[type='checkbox']");
    const color = item.querySelector(".todo-color");
    const text = item.querySelector(".todo-text");
    const date = item.querySelector(".todo-date");
    const deleteButton = item.querySelector(".delete-btn");

    item.dataset.id = todo.id;
    item.dataset.color = todo.color || "blue";
    item.classList.toggle("completed", todo.completed);
    checkbox.checked = todo.completed;
    color.textContent = "";
    text.textContent = todo.text;
    if (todo.date) {
      date.textContent = `締切: ${formatDateLabel(todo.date)}`;
      const target = new Date(`${todo.date}T00:00:00`).getTime();
      const today = new Date(`${todayValue()}T00:00:00`).getTime();
      item.classList.toggle("due-soon", !todo.completed && target === today);
      item.classList.toggle("overdue", !todo.completed && target < today);
    } else {
      date.textContent = "";
      item.classList.remove("due-soon", "overdue");
    }

    checkbox.addEventListener("change", () => toggleTodo(todo.id));
    deleteButton.addEventListener("click", () => deleteTodo(todo.id));

    list.append(item);
  }

  count.textContent = `${todos.length} 件`;
  emptyState.hidden = todos.length > 0;
  clearCompletedButton.disabled = !todos.some((todo) => todo.completed);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = "";
  dateInput.value = todayValue();
  colorSelect.value = "blue";
  setFormColor("blue");
  input.focus();
});

colorSelect.addEventListener("change", () => {
  setFormColor(colorSelect.value);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filter = button.dataset.filter;
    filterButtons.forEach((btn) => btn.classList.toggle("active", btn === button));
    render();
  });
});

sortButtons.forEach((button) => {
  button.addEventListener("click", () => {
    sortMode = button.dataset.sort;
    sortButtons.forEach((btn) => btn.classList.toggle("active", btn === button));
    render();
  });
});

clearCompletedButton.addEventListener("click", clearCompleted);

dateInput.value = todayValue();
setFormColor(colorSelect.value);
render();
