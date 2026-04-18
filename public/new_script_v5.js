// Скрипт c поиском, фильтрами, сортировкой, статистикой

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('goal-form');
  const input = document.getElementById('goal-input');
  const dueDateInput = document.getElementById('due-date-input');
  const categoryInput = document.getElementById('category-input');
  const list = document.getElementById('goals-list');

  // Элементы фильтров
  const filterCategorySelect = document.getElementById('filter-category');
  const filterOverdueCheckbox = document.getElementById('filter-overdue');
  const filterDueWithinInput = document.getElementById('filter-due-within');
  const filterSearchInput = document.getElementById('filter-search');
  const applyFiltersBtn = document.getElementById('apply-filters');

  // Элементы статистики и сортировки
  const summaryDiv = document.getElementById('summary');
  const sortSelect = document.getElementById('sort-by');

  // Контейнер для уведомлений
  const notificationsContainer = document.getElementById('notifications');

  // Локальное кэширование
  let allGoals = [];

  function showNotification(message, type = 'success') {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    notificationsContainer.appendChild(notif);
    setTimeout(() => {
      notif.remove();
    }, 3000);
  }

  // Обновление опций фильтра категории
  function updateCategoryFilterOptions() {
    const categories = new Set();
    allGoals.forEach(goal => {
      if (goal.category) categories.add(goal.category);
    });
    while (filterCategorySelect.options.length > 1) {
      filterCategorySelect.remove(1);
    }
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      filterCategorySelect.appendChild(option);
    });
  }

  // Проверяем, удовлетворяет ли цель фильтрам
  function goalMatchesFilters(goal) {
    const selectedCategory = filterCategorySelect.value;
    if (selectedCategory && goal.category !== selectedCategory) return false;
    if (filterOverdueCheckbox.checked) {
      if (!goal.dueDate) return false;
      const now = new Date();
      const due = new Date(goal.dueDate);
      if (due >= now) return false;
    }
    const dueWithinValue = filterDueWithinInput.value;
    if (dueWithinValue) {
      const days = parseInt(dueWithinValue, 10);
      if (!isNaN(days)) {
        const now = new Date();
        const limit = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        if (!goal.dueDate) return false;
        const due = new Date(goal.dueDate);
        if (due > limit) return false;
      }
    }
    const searchQuery = filterSearchInput.value.trim().toLowerCase();
    if (searchQuery && !goal.text.toLowerCase().includes(searchQuery)) return false;
    return true;
  }

  // Счет статистики
  function updateStatistics() {
    const now = new Date();
    let total = 0, completed = 0, overdue = 0, dueSoon = 0;
    allGoals.forEach(goal => {
      if (!goalMatchesFilters(goal)) return;
      total++;
      if (goal.completed) completed++;
      if (!goal.completed && goal.dueDate) {
        const due = new Date(goal.dueDate);
        if (due < now) overdue++;
        if (due >= now && due <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) dueSoon++;
      }
    });
    summaryDiv.innerHTML =
      `<span>\u0412сего: ${total}</span> <span>\u0417авершено: ${completed}</span> <span>\u041fросрочено: ${overdue}</span> <span>\u0414о 7 дней: ${dueSoon}</span>`;
  }

  // Сортировка целей
  function sortGoals(array) {
    const criterion = sortSelect.value;
    if (criterion === 'due') {
      return array.slice().sort((a, b) => {
        const aDate = a.dueDate ? new Date(a.dueDate) : null;
        const bDate = b.dueDate ? new Date(b.dueDate) : null;
        if (aDate && bDate) return aDate - bDate;
        if (aDate) return -1;
        if (bDate) return 1;
        return 0;
      });
    } else if (criterion === 'category') {
      return array.slice().sort((a, b) => {
        if (a.category && b.category) return a.category.localeCompare(b.category);
        if (a.category) return -1;
        if (b.category) return 1;
        return 0;
      });
    } else if (criterion === 'completed') {
      return array.slice().sort((a, b) => {
        return (a.completed === b.completed) ? 0 : (a.completed ? 1 : -1);
      });
    }
    return array;
  }

  // Отрисовка списка
  function renderGoals() {
    list.innerHTML = '';
    const now = new Date();
    const goalsToRender = sortGoals(allGoals.filter(goal => goalMatchesFilters(goal)));
    goalsToRender.forEach(goal => {
      const li = document.createElement('li');

      const textSpan = document.createElement('span');
      textSpan.textContent = goal.text;
      li.appendChild(textSpan);

      if (goal.category) {
        const categorySpan = document.createElement('span');
        categorySpan.className = 'meta';
        categorySpan.textContent = ` (${goal.category})`;
        li.appendChild(categorySpan);
      }
      if (goal.dueDate) {
        const dueSpan = document.createElement('span');
        dueSpan.className = 'meta';
        const date = new Date(goal.dueDate);
        dueSpan.textContent = ` [до: ${date.toLocaleDateString()}]`;
        li.appendChild(dueSpan);
      }

      if (goal.completed) {
        li.classList.add('completed');
      } else if (goal.dueDate && new Date(goal.dueDate) < now) {
        li.classList.add('overdue');
      }

      const actions = document.createElement('div');
      actions.className = 'actions';

      const completeBtn = document.createElement('button');
      completeBtn.innerHTML = goal.completed ? '<i class="fas fa-undo"></i> \u041eтменить' : '<i class="fas fa-check"></i> \u0417авершить';
      completeBtn.addEventListener('click', async () => {
        const res = await fetch('/api/goals/' + goal.id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: !goal.completed })
        });
        if (res.ok) showNotification(goal.completed ? '\u0426ель восстановлена' : '\u0426ель выполнена');
        await fetchGoals();
      });
      actions.appendChild(completeBtn);

      const editBtn = document.createElement('button');
      editBtn.classList.add('edit');
      editBtn.innerHTML = '<i class="fas fa-edit"></i> \u0418зменить';
      editBtn.addEventListener('click', async e => {
        e.stopPropagation();
        const newText = prompt('\u0418зменить текст цели:', goal.text);
        if (newText === null) return;
        const newDueDate = prompt('Изменить дату (YYYY-MM-DD) или оставьте пустым для удаления:', goal.dueDate || '');
        const newCategory = prompt('Изменить категорию или оставьте пустым для удаления:', goal.category || '');
        const payload = {};
        if (newText.trim() !== '' && newText !== goal.text) payload.text = newText.trim();
        if (newDueDate !== null) {
          const trimmedDate = newDueDate.trim();
          payload.dueDate = trimmedDate === '' ? null : trimmedDate;
        }
        if (newCategory !== null) {
          const trimmedCat = newCategory.trim();
          payload.category = trimmedCat === '' ? null : trimmedCat;
        }
        if (Object.keys(payload).length > 0) {
          const res = await fetch('/api/goals/' + goal.id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) showNotification('\u0426ель изменена');
          await fetchGoals();
        }
      });
      actions.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('delete');
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i> \u0423далить';
      deleteBtn.addEventListener('click', async e => {
        e.stopPropagation();
        const res = await fetch('/api/goals/' + goal.id, { method: 'DELETE' });
        if (res.ok) showNotification('\u0426ель удалена', 'error');
        await fetchGoals();
      });
      actions.appendChild(deleteBtn);

      li.appendChild(actions);
      list.appendChild(li);
    });
    updateStatistics();
  }

  async function fetchGoals() {
    const res = await fetch('/api/goals');
    allGoals = await res.json();
    updateCategoryFilterOptions();
    renderGoals();
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const text = input.value.trim();
    const dueDate = dueDateInput.value;
    const category = categoryInput.value.trim();
    if (!text) {
      alert('Введите цель');
      return;
    }
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, dueDate: dueDate || null, category })
    });
    if (res.ok) showNotification('\u0426ель добавлена');
    input.value = '';
    dueDateInput.value = '';
    categoryInput.value = '';
    await fetchGoals();
  });

  applyFiltersBtn.addEventListener('click', () => {
    renderGoals();
  });

  sortSelect.addEventListener('change', () => {
    renderGoals();
  });

  filterSearchInput.addEventListener('input', () => {
    renderGoals();
  });

  fetchGoals();
});
