import React from 'react';
import TaskList from './components/TaskList';

const App: React.FC = () => {
    return (
        <div>
            <h1>{"To-Do Manager"}</h1>
            <TaskList />
        </div>
    );
};

export default App;
