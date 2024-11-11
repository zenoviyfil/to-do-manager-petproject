import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tasks';

export const fetchTasks = () => axios.get(API_URL);
export const createTask = (task: any) => axios.post(API_URL, task);
export const updateTask = (id: string, updatedTask: any) => axios.put(`${API_URL}/${id}`, updatedTask);
export const deleteTask = (id: string) => axios.delete(`${API_URL}/${id}`);
