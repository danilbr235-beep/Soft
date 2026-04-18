document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('goal-form');
  const input = document.getElementById('goal-input');
  const list = document.getElementById('goals-list');

  async function fetchGoals() {
    const res = await fetch('/api/goals');
    const goals = await res.json();
    list.innerHTML = '';
    goals.forEach(goal => {
      const li = document.createElement('li');
      li.textContent = goal.text;
      if (goal.completed) {
        li.classList.add('completed');
      }
      const actions = document.createElement('div');
      const completeBtn = document.createElement('button');
      completeBtn.textContent = goal.completed ? 'Undo' : 'Complete';
      completeBtn.addEventListener('click', async () => {
        await fetch(`/api/goals/${goal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: !goal.completed })
        });
        fetchGoals();
      });
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', async () => {
        await fetch(`/api/goals/${goal.id}`, { method: 'DELETE' });
        fetchGoals();
      });
      actions.appendChild(completeBtn);
      actions.appendChild(deleteBtn);
      li.appendChild(actions);
      list.appendChild(li);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    input.value = '';
    fetchGoals();
  });

  fetchGoals();
});
