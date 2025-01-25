import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { v4 as uuidv4 } from 'uuid';


function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [priority, setPriority] = useState('Low');

  // States for editing functionality
  const [editingTask, setEditingTask] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingPriority, setEditingPriority] = useState('Low');

  useEffect(() => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = uuidv4(); // Generate a new unique ID
      localStorage.setItem('userId', userId);
    }
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      const userId = localStorage.getItem('userId');
      const response = await axios.get('http://localhost:5000/tasks', {
        params: { priority: priorityFilter, userId }, // Include userId in the query
      });
      setTasks(response.data);
    };

    fetchTasks();
  }, [priorityFilter]);



  const addTask = () => {
    if (!newTask) return;
    const userId = localStorage.getItem('userId'); // Get the userId from localStorage
    axios.post('http://localhost:5000/tasks', { title: newTask, priority, userId }).then((response) => {
      setTasks([...tasks, response.data]);
      setNewTask('');
      setPriority('Low');
    });
  };



  const updateTask = (id, updatedTask) => {
    axios.put(`http://localhost:5000/tasks/${id}`, updatedTask).then((response) => {
      setTasks(tasks.map((task) => (task._id === id ? response.data : task)));
      setEditingTask(null); // Reset editing state
    });
  };

  const deleteTask = (id) => {
    axios.delete(`http://localhost:5000/tasks/${id}`).then(() => {
      setTasks(tasks.filter((task) => task._id !== id));
    });
  };

  const toggleComplete = (id, task) => {
    axios
      .put(`http://localhost:5000/tasks/${id}`, { ...task, completed: !task.completed })
      .then((response) => {
        setTasks(tasks.map((task) => (task._id === id ? response.data : task)));
      });
  };

  const startEditing = (task) => {
    setEditingTask(task._id);
    setEditingValue(task.title);
    setEditingPriority(task.priority);
  };

  const saveEditing = (taskId) => {
    updateTask(taskId, { title: editingValue, priority: editingPriority });
  };

  const cancelEditing = () => {
    setEditingTask(null);
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      <div class="floating-icon">
  <img src="https://cdn-icons-png.flaticon.com/512/1828/1828970.png" alt="Icon 1" />
</div>
<div class="floating-icon">
  <img src="https://cdn-icons-png.flaticon.com/512/1828/1828969.png" alt="Icon 2" />
</div>
<div class="floating-icon">
  <img src="https://cdn-icons-png.flaticon.com/512/1828/1828971.png" alt="Icon 3" />
</div>
<div class="floating-icon">
  <img src="https://cdn-icons-png.flaticon.com/512/1828/1828973.png" alt="Icon 4" />
</div>
<div class="floating-icon">
  <img src="https://cdn-icons-png.flaticon.com/512/1828/1828981.png" alt="Icon 5" />
</div>
<div class="floating-icon">
  <img src="https://cdn-icons-png.flaticon.com/512/1828/1828979.png" alt="Icon 6" />
</div>
<div class="floating-icon">
  <img src="https://cdn-icons-png.flaticon.com/512/1828/1828967.png" alt="Icon 7" />
</div>
<div class="floating-icon">
  <img src="https://cdn-icons-png.flaticon.com/512/1828/1828974.png" alt="Icon 8" />
</div>

      <h1>To-Do List</h1>

      {/* Add Task Section */}
      <div className="add-task-container">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="priority-select"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button onClick={addTask}>Add</button>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-container">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
        />
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="priority-filter"
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {/* Task Cards */}
      <div className="task-card-container">
        {filteredTasks.length === 0 ? (
          <p>No tasks found</p>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task._id}
              className={`task-card ${task.priority.toLowerCase()}`}
            >
              {editingTask === task._id ? (
                // Editing Mode
                <div className="editing-task">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    placeholder="Edit task..."
                  />
                  <select
                    value={editingPriority}
                    onChange={(e) => setEditingPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  <button onClick={() => saveEditing(task._id)}>Save</button>
                  <button onClick={cancelEditing} className="delete">
                    Cancel
                  </button>
                </div>

              ) : (
                // View Mode
                <div className="view-task">
                  <h3 className={`task-title ${task.completed ? 'completed' : ''}`}>
                    {task.title}
                  </h3>
                  <p className="task-priority">Priority: {task.priority}</p>
                  <p className="task-date">
                    Created: {new Date(task.createdAt).toLocaleDateString('en-GB')}
                  </p>
                  <div className="task-actions">
                    <button onClick={() => toggleComplete(task._id, task)}>
                      {task.completed ? 'Undo' : 'Complete'}
                    </button>
                    <button onClick={() => startEditing(task)}>Edit</button>
                    <button onClick={() => deleteTask(task._id)} className="delete">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
