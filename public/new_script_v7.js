// Client-side script with search, priority support, filters, statistics, sorting and theme toggle
// This script extends the previous versions by introducing a priority field for each goal.

document.addEventListener('DOMContentLoaded', () => {
  // Form elements
  const form = document.getElementById('goal-form');
  const input = document.getElementById('goal-input');
  const dueDateInput = document.getElementById('due-date-input');
  const categoryInput = document.getElementById('category-input');
  // Priority select in the add form
  const priorityInput = document.getElementById('priority-input');
  const list = document.getElementById('goals-list');

  // Filter elements
  const filterCategorySelect = document.getElementById('filter-category');
  const filterOverdueCheckbox = document.getElementById('filter-overdue');
  const filterDueWithinInput = document.getElementById('filter-due-within');
  const filterSearchInput = document.getElementById('filter-search');
  // Priority filter select
  const filterPrioritySelect = document.getElementById('filter-priority');
  const applyFiltersBtn = document.getElementById('apply-filters');

  // Summary and sorting
  const summaryDiv = document.getElementById('summary');
  const sortSelect = document.getElementById('sort-by');

  // Notification container
  const notificationsContainer = document.getElementById('notifications');

  // Theme toggle button
  const themeToggleBtn = document.getElementById('theme-toggle');

  // Local cache of goals
  let allGoals = [];

  /**
   * Show a toast-style notification. Type can be 'success' or 'error'.
   * @param {string} message
   * @param {'success'|'error'} type
   */
  function showNotification(message, type = 'success') {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    notificationsContainer.appendChild(notif);
    setTimeout(() => {
      notif.remove();
    }, 3000);
  }

  /**
   * Populate the category filter select based on categories present in allGoals.
   */
  function updateCategoryFilterOptions() {
    const categories = new Set();
    allGoals.forEach(goal => {
      if (goal.category) categories.add(goal.category);
    });
    // Remove existing options except the first one ("Все")
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

  /**
   * Determine if a goal should be shown based on current filters and search query.
   * @param {Object} goal
   * @returns {boolean}
   */
  function goalMatchesFilters(goal) {
    // Category filter
    const selectedCategory = filterCategorySelect.value;
    if (selectedCategory && goal.category !== selectedCategory) return false;
    // Priority filter
    const selectedPriority = filterPrioritySelect.value;
    if (selectedPriority && goal.priority !== selectedPriority) return false;
    // Overdue filter
    if (filterOverdueCheckbox.checked) {
      if (!goal.dueDate) return false;
      const now = new Date();
      const due = new Date(goal.dueDate);
      if (due >= now) return false;
    }
    // Due-within filter
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
    // Search filter
    const searchQuery = filterSearchInput.value.trim().toLowerCase();
    if (searchQuery && !goal.text.toLowerCase().includes(searchQuery)) return false;
    return true;
  }

  /**
   * Calculate and display summary statistics. Shows totals including counts by priority.
   */
  function updateStatistics() {
    const now = new Date();
    let total = 0;
    let completed = 0;
    let overdue = 0;
    let dueSoon = 0;
    let low = 0, medium = 0, high = 0;
    allGoals.forEach(goal => {
      if (!goalMatchesFilters(goal)) return;
      total++;
      if (goal.completed) completed++;
      // count priority
      if (goal.priority === 'low') low++;
      else if (goal.priority === 'medium') medium++;
      else if (goal.priority === 'high') high++;
      // Overdue and due soon
      if (!goal.completed && goal.dueDate) {
        const due = new Date(goal.dueDate);
        if (due < now) {
          overdue++;
        }
        if (due >= now && due <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
          dueSoon++;
        }
      }
    });
    summaryDiv.innerHTML = `
      <span>Всего: ${total}</span>
      <span>Завершено: ${completed}</span>
      <span>Просрочено: ${overdue}</span>
      <span>До 7 дней: ${dueSoon}</span>
      <span>Низкий приоритет: ${low}</span>
      <span>Средний приоритет: ${medium}</span>
      <span>Высокий приоритет: ${high}</span>
    `;
  }

  /**
   * Sort an array of goals by the current sorting criterion.
   * @param {Array} array
   * @returns {Array}
   */
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
      return array.slice().sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
    } else if (criterion === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2, undefined: 3 };
      return array.slice().sort((a, b) => {
        return (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3);
      });
    }
    // No sorting
    return array;
  }

  /**
   * Render the goals list applying filters and sorting.
   */
  function renderGoals() {
    list.innerHTML = '';
    const now = new Date();
    const filteredGoals = allGoals.filter(goal => goalMatchesFilters(goal));
    const sortedGoals = sortGoals(filteredGoals);
    sortedGoals.forEach(goal => {
      const li = document.createElement('li');

      // Goal text
      const textSpan = document.createElement('span');
      textSpan.textContent = goal.text;
      li.appendChild(textSpan);

      // Priority badge
      if (goal.priority) {
        const badge = document.createElement('span');
        badge.classList.add('badge');
        badge.textContent = goal.priority === 'low' ? 'Low' : goal.priority === 'medium' ? 'Medium' : 'High';
        // Add specific class for color
        if (goal.priority === 'low') badge.classList.add('badge-low');
        else if (goal.priority === 'medium') badge.classList.add('badge-medium');
        else if (goal.priority === 'high') badge.classList.add('badge-high');
        li.appendChild(badge);
      }

      // Category metadata
      if (goal.category) {
        const categorySpan = document.createElement('span');
        categorySpan.className = 'meta';
        categorySpan.textContent = ` (${goal.category})`;
        li.appendChild(categorySpan);
      }
      // Due date metadata
      if (goal.dueDate) {
        const dueSpan = document.createElement('span');
        dueSpan.className = 'meta';
        const date = new Date(goal.dueDate);
        dueSpan.textContent = ` [до: ${date.toLocaleDateString()}]`;
        li.appendChild(dueSpan);
      }

      // Styling for completed and overdue
      if (goal.completed) {
        li.classList.add('completed');
      } else if (goal.dueDate && new Date(goal.dueDate) < now) {
        li.classList.add('overdue');
      }

      // Actions container
      const actions = document.createElement('div');
      actions.className = 'actions';

      // Complete/Undo button
      const completeBtn = document.createElement('button');
      completeBtn.innerHTML = goal.completed ? '<i class="fas fa-undo"></i> Отменить' : '<i class="fas fa-check"></i> Завершить';
      completeBtn.addEventListener('click', async () => {
        const res = await fetch('/api/goals/' + goal.id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: !goal.completed })
        });
        if (res.ok) showNotification(goal.completed ? 'Цель восстановлена' : 'Цель выполнена');
        await fetchGoals();
      });
      actions.appendChild(completeBtn);

      // Edit button
      const editBtn = document.createElement('button');
      editBtn.classList.add('edit');
      editBtn.innerHTML = '<i class="fas fa-edit"></i> Изменить';
      editBtn.addEventListener('click', async e => {
        e.stopPropagation();
        const newText = prompt('Изменить текст цели:', goal.text);
        if (newText === null) return;
        const newDueDate = prompt('Изменить дату (YYYY-MM-DD) или оставьте пустым для удаления:', goal.dueDate || '');
        const newCategory = prompt('Изменить категорию или оставьте пустым для удаления:', goal.category || '');
        const newPriority = prompt('Изменить приоритет (low, medium, high) или оставьте пустым для удаления:', goal.priority || '');
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
        if (newPriority !== null) {
          const trimmedPr = newPriority.trim().toLowerCase();
          if (trimmedPr === '') {
            payload.priority = null;
          } else if (['low', 'medium', 'high'].includes(trimmedPr)) {
            payload.priority = trimmedPr;
          }
        }
        if (Object.keys(payload).length > 0) {
          const res = await fetch('/api/goals/' + goal.id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) showNotification('Цель изменена');
          await fetchGoals();
        }
      });
      actions.appendChild(editBtn);

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('delete');
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Удалить';
      deleteBtn.addEventListener('click', async e => {
        e.stopPropagation();
        const res = await fetch('/api/goals/' + goal.id, { method: 'DELETE' });
        if (res.ok) showNotification('Цель удалена', 'error');
        await fetchGoals();
      });
      actions.appendChild(deleteBtn);

      li.appendChild(actions);
      list.appendChild(li);
    });
    updateStatistics();
  }

  /**
   * Fetch goals from the API and refresh UI.
   */
  async function fetchGoals() {
    const res = await fetch('/api/goals');
    allGoals = await res.json();
    updateCategoryFilterOptions();
    renderGoals();
  }

  // Event handlers
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const text = input.value.trim();
    const dueDate = dueDateInput.value;
    const category = categoryInput.value.trim();
    const priority = priorityInput.value;
    if (!text) {
      alert('Введите цель');
      return;
    }
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        dueDate: dueDate || null,
        category,
        priority: priority || null
      })
    });
    if (res.ok) showNotification('Цель добавлена');
    input.value = '';
    dueDateInput.value = '';
    categoryInput.value = '';
    priorityInput.value = 'medium';
    await fetchGoals();
  });

  // Apply filters on button click
  applyFiltersBtn.addEventListener('click', () => {
    renderGoals();
  });

  // Re-render on sort change
  sortSelect.addEventListener('change', () => {
    renderGoals();
  });

  // Re-render on search input change
  filterSearchInput.addEventListener('input', () => {
    renderGoals();
  });

  // Re-render when priority filter changes
  filterPrioritySelect.addEventListener('change', () => {
    renderGoals();
  });

  // Theme toggle handling
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  });

  // On load, apply stored theme
  const savedTheme = localStorage.getItem('darkMode');
  if (savedTheme === 'true') {
    document.body.classList.add('dark-mode');
  }

  // Initial fetch of goals
  fetchGoals();
});