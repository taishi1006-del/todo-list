const STORAGE_KEY = "vscode-todo-items";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const colorSelect = document.getElementById("todo-color");
const list = document.getElementById("todo-list");
const template = document.getElementById("todo-item-template");
const count = document.getElementById("task-count");
const emptyState = document.getElementById("empty-state");
const clearCompletedButton = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter");

let todos = loadTodos();
let filter = "all";

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
  if (filter === "active") {
    return todos.filter((todo) => !todo.completed);
  }
  if (filter === "completed") {
    return todos.filter((todo) => todo.completed);
  }
  return todos;
}

function render() {
  const visibleTodos = getVisibleTodos();
  list.innerHTML = "";

  for (const todo of visibleTodos) {
    const item = template.content.firstElementChild.cloneNode(true);
    const checkbox = item.querySelector("input[type='checkbox']");
    const color = item.querySelector(".todo-color");
    const text = item.querySelector(".todo-text");
    const deleteButton = item.querySelector(".delete-btn");

    item.dataset.id = todo.id;
    item.dataset.color = todo.color || "blue";
    item.classList.toggle("completed", todo.completed);
    checkbox.checked = todo.completed;
    color.textContent = "";
    text.textContent = todo.text;

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
  colorSelect.value = "blue";
  input.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filter = button.dataset.filter;
    filterButtons.forEach((btn) => btn.classList.toggle("active", btn === button));
    render();
  });
});

clearCompletedButton.addEventListener("click", clearCompleted);

render();
