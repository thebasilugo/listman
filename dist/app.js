"use strict";
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const listContainer = document.getElementById("list-container");
const filterButtons = document.querySelectorAll(".filter-btn");
const elements = {
	inputBox: $("#input-box"),
	addBtn: $("#add-btn"),
	listContainer: $("#list-container"),
	renderError: $("#error"),
	nameInput: $("#name"),
	toggleThemeBtn: $("#toggle-theme"),
	toggleThemeIcon: $("#toggle-theme-icon"),
	yearRangeElement: $("#year-range"),
	totalTasksElement: $("#total-tasks"),
	completedTasksElement: $("#completed-tasks"),
	completionRateElement: $("#completion-rate"),
	contributionGrid: $("#contribution-grid"),
};
const state = {
	todos: [],
	username: "",
	theme: "light",
	contributionGrid: { level: 0, date: new Date().toISOString() },
};
const STORAGE_KEYS = {
	TODOS: "listman_todos",
	USERNAME: "listman_username",
	THEME: "listman_theme",
	CONTRIBUTION_GRID: "listman_contribution_grid",
};
window.addEventListener("load", initializeApp);
elements.addBtn.addEventListener("click", addTask);
elements.inputBox.addEventListener("keypress", handleEnterKey);
elements.listContainer.addEventListener("click", handleListClick);
elements.nameInput.addEventListener("change", updateUsername);
elements.toggleThemeBtn.addEventListener("click", toggleTheme);
document.addEventListener("DOMContentLoaded", updateYearRange);
function initializeApp() {
	loadStateFromStorage();
	renderTodos();
	applyTheme();
	elements.nameInput.value = state.username;
}
function loadStateFromStorage() {
	state.todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS) || "[]");
	state.username = localStorage.getItem(STORAGE_KEYS.USERNAME) || "";
	state.theme = localStorage.getItem(STORAGE_KEYS.THEME) || "light";
}
function saveStateToStorage() {
	localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(state.todos));
	localStorage.setItem(STORAGE_KEYS.USERNAME, state.username);
	localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
}
function renderTodos() {
	if (elements.listContainer) {
		elements.listContainer.innerHTML = state.todos
			.map(
				(todo, index) => `
        <li class="list-item list-none items-center justify-between my-1 rounded pl-1 opacity-70 transition-all duration-200 ease-in-out break-words dark:bg-gray-900 dark:text-gray-50 dark:hover:bg-gray-900 hover:bg-gray-100 hover:opacity-100 md:py-2 ${
					todo.completed ? "checked" : ""
				}" data-id="${index}">
          <span class="todo-text ${
						todo.completed ? "completed" : ""
					}" data-action="edit">${todo.text}</span>
          <input type="text" class="todo-edit-input hidden text-gray-900 w-2/3 md:w-5/6" value="${
						todo.text
					}" data-action="edit-input">
          <div class="todo-actions flex">
            <button class="edit-btn ui icon button circular" data-action="edit">
              <i class="edit icon"></i>
            </button>
            <button class="delete-btn ui icon button circular">
              <i class="x icon"></i>
            </button>
          </div>
        </li>
      `
			)
			.join("");
	}
}
function addTask() {
	const todoText = elements.inputBox.value.trim();
	if (todoText === "") {
		showError("Error. You have to write something!");
		return;
	}
	state.todos.push({ text: todoText, completed: false, createdAt: new Date() });
	elements.inputBox.value = "";
	saveStateToStorage();
	renderTodos();
}
function handleEnterKey(event) {
	if (event.key === "Enter") {
		event.preventDefault();
		addTask();
	}
}
function handleListClick(e) {
	const target = e.target;
	const listItem = target.closest(".list-item");
	if (!listItem) return;
	const todoId = parseInt(listItem.dataset.id);
	if (target.closest(".delete-btn")) {
		removeTodo(todoId);
	} else if (target.closest(".edit-btn")) {
		toggleEdit(todoId);
	} else {
		toggleTodoComplete(todoId);
	}
}
function removeTodo(id) {
	state.todos.splice(id, 1);
	saveStateToStorage();
	renderTodos();
}
function toggleTodoComplete(id) {
	state.todos[id].completed = !state.todos[id].completed;
	saveStateToStorage();
	renderTodos();
}
function updateUsername(e) {
	const input = e.target;
	state.username = input.value;
	saveStateToStorage();
}
function toggleTheme() {
	state.theme = state.theme === "light" ? "dark" : "light";
	saveStateToStorage();
	applyTheme();
}
function applyTheme() {
	if (state.theme === "dark") {
		document.body.classList.add("dark-mode");
		elements.toggleThemeIcon.classList.remove("sun");
		elements.toggleThemeIcon.classList.add("moon");
	} else {
		document.body.classList.remove("dark-mode");
		elements.toggleThemeIcon.classList.remove("moon");
		elements.toggleThemeIcon.classList.add("sun");
	}
}
function showError(message) {
	elements.renderError.textContent = message;
	elements.renderError.classList.remove("hidden", "fade-out");
	elements.renderError.classList.add("fade-in");
	setTimeout(() => {
		elements.renderError.classList.add("fade-out");
		elements.renderError.classList.remove("fade-in");
		elements.renderError.textContent = "";
	}, 2000);
}
function updateYearRange() {
	const currentYear = new Date().getFullYear();
	const createdYear = 2023;
	elements.yearRangeElement.textContent =
		createdYear === currentYear
			? `${createdYear}`
			: `${createdYear} - ${currentYear}`;
}
function toggleEdit(id) {
	const listItem = elements.listContainer.querySelector(`[data-id="${id}"]`);
	const todoText = listItem.querySelector(".todo-text");
	const editInput = listItem.querySelector(".todo-edit-input");
	const editBtn = listItem.querySelector(".edit-btn");
	const isEditing = !editInput.classList.contains("hidden");
	todoText.classList.toggle("hidden");
	editInput.classList.toggle("hidden");
	editBtn.innerHTML = isEditing
		? '<i class="edit icon"></i>'
		: '<i class="check icon"></i>';
	if (!isEditing) {
		editInput.focus();
		editInput.addEventListener("blur", () =>
			saveEdit(id, editInput.value.trim())
		);
		editInput.addEventListener("keypress", (e) => {
			if (e.key === "Enter") {
				e.preventDefault();
				saveEdit(id, editInput.value.trim());
			}
		});
	}
}
function saveEdit(id, newText) {
	if (newText === "") {
		showError("Error. You cannot leave the todo empty!");
		return;
	}
	state.todos[id].text = newText;
	saveStateToStorage();
	renderTodos();
}
filterButtons.forEach((button) => {
	button.addEventListener("click", (e) => {
		var _a;
		const filter = e.target.id.replace("filter-", "");
		(_a = document.querySelector(".filter-btn.active")) === null ||
		_a === void 0
			? void 0
			: _a.classList.remove("active");
		e.target.classList.add("active");
		Array.from(listContainer.children).forEach((item) => {
			if (filter === "all") {
				item.classList.remove("hidden");
			} else if (filter === "completed") {
				item.classList.toggle("hidden", !item.classList.contains("checked"));
			} else if (filter === "incomplete") {
				item.classList.toggle("hidden", item.classList.contains("checked"));
			}
		});
	});
});
