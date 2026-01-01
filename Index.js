let tasksArray = []; 
let currentFilter = 'all';  
let tasksContainer, taskInput, addTaskBtn, counterTasks, btnClearCompleted, errorMsg;

function setFilter(filter) {
    currentFilter = filter;
    renderTasks();
}

window.setFilter = setFilter;

document.addEventListener('DOMContentLoaded', () => {
    tasksArray = JSON.parse(localStorage.getItem('tasks')) || [];
    currentFilter = 'all';
    addTaskBtn = document.getElementById('add-task-btn');
    tasksContainer = document.querySelector('.task-container');
    taskInput = document.getElementById('task-input');
    counterTasks = document.getElementById('counter-tasks');
    btnClearCompleted = document.getElementById('clear-completed');
    btnClearCompleted.onclick = clearCompleted;
    errorMsg = document.getElementById('error-message');    

    taskInput.addEventListener('input', validateInput);
    taskInput.addEventListener('keypress', e => e.key === 'Enter' && addTask());
    addTaskBtn.onclick = addTask;

    renderTasks();  
});

function getFilteredTasks () {
    return tasksArray.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    })
}

function renderTasks() {
    tasksContainer.innerHTML = '';
    const filteredTasks = getFilteredTasks();

    filteredTasks.forEach(task => renderTask(task));
    updateCounter();
}

function renderTask(task) {   
    const li = document.createElement('li');
    li.className = `list-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.onchange = () => toggleTask(task.id);

    const textSpan = document.createElement('span');
    textSpan.textContent = task.text;
    
    textSpan.ondblclick = () => editTask(task.id);
    textSpan.title = 'Двойной клик для редактирования';

    // li.ondblclick = () => editTask(task.id);
    // li.style.cursor = task.completed ? 'default' : 'pointer';

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '❌';
    deleteBtn.onclick = () => removeTask(task.id);

    li.append(checkbox, textSpan, deleteBtn);
    tasksContainer.appendChild(li);
}

function editTask(id) {
    const task = tasksArray.find(t => t.id === id);
    if (!task || task.completed) return;

    const li = tasksContainer.querySelector(`[data-id="${id}"]`);
    const textSpan = li.querySelector('span');

    li.classList.add('editing');
    textSpan.contentEditable = true;
    textSpan.textContent = task.text;
    textSpan.focus();

    const saveEdit = () => {
        const newText = textSpan.textContent.trim();
        if (newText && newText !== task.text) {
            task.text = newText;
            saveTasks();
            renderTasks();
        }
        textSpan.contentEditable = false;
        li.classList.remove('editing');
    }

    textSpan.onblur = saveEdit;
    textSpan.onkeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit();
        } else if (e.key === 'Escape') {
            textSpan.contentEditable = false;
            li.classList.remove('editing');
            textSpan.blur();
        }
    }
}

function toggleTask(id) {
    const task = tasksArray.find(t => t.id === id)
    if (task) task.completed = !task.completed;
    saveTasks();
    renderTasks();
}

function removeTask(id) {
    tasksArray = tasksArray.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasksArray));
}

function updateCounter() {
    const activeCount = tasksArray.filter(t => !t.completed).length;
    counterTasks.textContent = `Осталось ${activeCount} активных задач`
}

function addTask() {
    validateInput();
    const text = taskInput.value.trim();
    if (text) {
            const task = {
                id: Date.now(),
                text,
                completed: false
            };
        tasksArray.push(task);
        saveTasks();
        renderTasks();
        taskInput.value = '';
    }
}

function clearCompleted() {
    tasksArray = tasksArray.filter(t => !t.completed);
    saveTasks();
    renderTasks();
}

function validateInput() {
    const text = taskInput.value.trim();
    if (text.length === 0) {
        taskInput.classList.add('error');
        errorMsg.textContent = 'Введите текст задачи';
        errorMsg.classList.add('show');
    } else {
        taskInput.classList.remove('error');
        errorMsg.textContent = '';
        errorMsg.classList.remove('show');
    }
}

