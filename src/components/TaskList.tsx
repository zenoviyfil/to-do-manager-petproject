import React, { useState, useEffect } from "react";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";
import styles from "./TaskList.module.css";

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  completed: boolean;
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    deadline: "",
  });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTask, setEditedTask] = useState({
    title: "",
    description: "",
    deadline: "",
  });
  const [sortCriteria, setSortCriteria] = useState<string>("deadline");
  const [filterCriteria, setFilterCriteria] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks().then((response) => setTasks(response.data));
  }, []);

  const handleCreateTask = () => {
    createTask(newTask).then((response) => {
      setTasks([...tasks, response.data]);
      setNewTask({ title: "", description: "", deadline: "" });
    });
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id).then(() => {
      setTasks(tasks.filter((task) => task.id !== id));
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditedTask({
      title: task.title,
      description: task.description,
      deadline: task.deadline,
    });
  };

  const handleUpdateTask = (id: string) => {
    const updatedData = { ...editedTask };
    updateTask(id, updatedData).then((response) => {
      setTasks(tasks.map((task) => (task.id === id ? response.data : task)));
      setEditingTaskId(null);
    });
  };

  const handleUpdateStatusTask = (id: string, updatedFields: Partial<Task>) => {
    const updatedTask = tasks.find((task) => task.id === id);
    if (updatedTask) {
      const updatedData = { ...updatedTask, ...updatedFields };
      updateTask(id, updatedData).then((response) => {
        setTasks(tasks.map((task) => (task.id === id ? response.data : task)));
      });
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      filterCriteria === "all" ||
      (filterCriteria === "completed" && task.completed) ||
      (filterCriteria === "pending" && !task.completed);
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    switch (sortCriteria) {
      case "deadline":
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case "alphabetical":
        return a.title.localeCompare(b.title);
      case "status":
        return Number(a.completed) - Number(b.completed);
      default:
        return 0;
    }
  });

  const checkDeadline = (deadline: string) => {
    const currentDate = new Date();
    const deadlineDate = new Date(deadline);
    const timeDifference = deadlineDate.getTime() - currentDate.getTime();
    const daysDifference = timeDifference / (1000 * 60 * 60 * 24);

    if (daysDifference < 0) {
      return "Deadline missed";
    } else if (daysDifference < 3) {
      return "Deadline approaching";
    }
    return null;
  };

  const toggleDropdown = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>To-Do List</h2>
      <div className={styles.inputGroup}>
        <input
          type="text"
          placeholder="Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Description"
          value={newTask.description}
          onChange={(e) =>
            setNewTask({ ...newTask, description: e.target.value })
          }
          className={styles.input}
        />
        <input
          type="date"
          value={newTask.deadline}
          onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
          className={styles.input}
        />
        <button onClick={handleCreateTask} className={styles.button}>
          Add Task
        </button>
      </div>

      <div className={styles.searchContainer}>
        <label htmlFor="searchQuery">Search: </label>
        <input
          type="text"
          id="searchQuery"
          placeholder="Search tasks"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.filterContainer}>
        <label htmlFor="filterCriteria">Filter by status: </label>
        <select
          id="filterCriteria"
          value={filterCriteria}
          onChange={(e) => setFilterCriteria(e.target.value)}
          className={styles.select}
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className={styles.sortContainer}>
        <label htmlFor="sortCriteria">Sort by: </label>
        <select
          id="sortCriteria"
          value={sortCriteria}
          onChange={(e) => setSortCriteria(e.target.value)}
          className={styles.select}
        >
          <option value="deadline">Deadline</option>
          <option value="alphabetical">Alphabetical</option>
          <option value="status">Status</option>
        </select>
      </div>

      <ul className={styles.taskList}>
        {sortedTasks.map((task) => (
          <li key={task.id} className={styles.taskItem}>
            {editingTaskId === task.id ? (
              <div>
                <input
                  type="text"
                  value={editedTask.title}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask, title: e.target.value })
                  }
                  className={styles.input}
                  placeholder="Edit title"
                />
                <input
                  type="text"
                  value={editedTask.description}
                  onChange={(e) =>
                    setEditedTask({
                      ...editedTask,
                      description: e.target.value,
                    })
                  }
                  className={styles.input}
                  placeholder="Edit description"
                />
                <input
                  type="date"
                  value={editedTask.deadline}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask, deadline: e.target.value })
                  }
                  className={styles.input}
                />
                <button
                  onClick={() => handleUpdateTask(task.id)}
                  className={styles.button}
                >
                  {"Save"}
                </button>
                <button
                  onClick={() => setEditingTaskId(null)}
                  className={styles.button}
                >
                  {"Cancel"}
                </button>
              </div>
            ) : (
              <>
                <div className={styles.taskHeader}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() =>
                      handleUpdateStatusTask(task.id, {
                        completed: !task.completed,
                      })
                    }
                    className={styles.checkbox}
                  />
                  <span
                    style={{
                      textDecoration: task.completed ? "line-through" : "none",
                    }}
                    onClick={() => toggleDropdown(task.id)}
                    className={styles.taskTitle}
                  >
                    {task.title}
                  </span>
                </div>
                {expandedTaskId === task.id && (
                  <div className={styles.dropdownContent}>
                    <p>{task.description}</p>
                  </div>
                )}
                <div className={styles.taskControls}>
                  <button
                    onClick={() => handleEditTask(task)}
                    className={styles.button}
                  >
                    {"Edit"}
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className={styles.button}
                  >
                    {"Delete"}
                  </button>
                </div>
              </>
            )}
            <span
              className={
                checkDeadline(task.deadline) === "Deadline missed"
                  ? styles.deadlineMissed
                  : checkDeadline(task.deadline) === "Deadline approaching"
                  ? styles.deadlineApproaching
                  : ""
              }
            >
              {task.deadline}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
