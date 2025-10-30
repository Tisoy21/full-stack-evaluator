import { useEffect, useState } from 'react';
import api from "./api/axios";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data ?? []);
    } catch (err) {
      console.error("API ERROR:", err);
    }
  };

  // CREATE
  const addTask = async () => {
    if (!newTaskTitle.trim()) return; // prevent empty tasks
    try {
      const response = await api.post("/tasks", {
        title: newTaskTitle,
        isDone: false,
        userId: 1
      });
      setTasks(prev => [...prev, response.data]);
      setNewTaskTitle(""); // clear input after adding
    } catch (error) {
      console.error("ADD TASK ERROR:", error.response?.data || error);
    }
  };

  // UPDATE (toggle done)
  const toggleTask = async (task) => {
    try {
      const updatedTask = { ...task, isDone: !task.isDone };
      const response = await api.put(`/tasks/${task.id}`, updatedTask);
      setTasks(prev => prev.map(t => t.id === task.id ? response.data : t));
    } catch (error) {
      console.error("UPDATE TASK ERROR:", error.response?.data || error);
    }
  };

  // UPDATE (inline edit)
  const saveTaskTitle = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const updatedTask = { ...task, title: editingTitle };
      const response = await api.put(`/tasks/${taskId}`, updatedTask);

      setTasks(prev => prev.map(t => t.id === taskId ? response.data : t));
      setEditingTaskId(null);
      setEditingTitle("");
    } catch (error) {
      console.error("EDIT TASK ERROR:", error.response?.data || error);
    }
  };

  // DELETE
  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error("DELETE TASK ERROR:", error.response?.data || error);
    }
  };

  return (
    <div>
      <h2>Tasks</h2>
      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Enter new task..."
          style={{ marginRight: '10px' }}
        />
        <button onClick={addTask}>Add</button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {tasks.map(task => (
          <li key={task.id} style={{ marginBottom: '15px' }}>
            {editingTaskId === task.id ? (
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={() => saveTaskTitle(task.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTaskTitle(task.id);
                  if (e.key === "Escape") {
                    setEditingTaskId(null);
                    setEditingTitle("");
                  }
                }}
                autoFocus
                style={{ marginRight: '10px' }}
              />
            ) : (
              <span
                onClick={() => toggleTask(task)}
                style={{
                  cursor: 'pointer',
                  textDecoration: task.isDone ? 'line-through' : 'none',
                  marginRight: '10px'
                }}
              >
                {task.title} {task.isDone ? '✅' : '❌'}
              </span>
            )}
            {editingTaskId !== task.id && (
              <button
                onClick={() => {
                  setEditingTaskId(task.id);
                  setEditingTitle(task.title);
                }}
                style={{ marginRight: '10px' }}
              >
                Edit
              </button>
            )}
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Tasks;
