const STORAGE_KEY = 'tasknova_tasks';

function getTasks() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export const api = {
  list: async () => {
    return getTasks();
  },

  create: async (task) => {
    const tasks = getTasks();
    const newTask = {
      id: Date.now(),
      title: task.title,
      description: task.description || '',
      status: task.status || 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    tasks.unshift(newTask);
    saveTasks(tasks);
    return newTask;
  },

  update: async (id, updates) => {
    const tasks = getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    
    tasks[index] = {
      ...tasks[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    saveTasks(tasks);
    return tasks[index];
  },

  remove: async (id) => {
    let tasks = getTasks();
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(tasks);
    return null;
  }
};
