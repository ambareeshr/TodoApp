import React from 'react';
import TodoList from '../components/TodoList';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Your Dashboard</h1>
      <TodoList />
    </div>
  );
};

export default Dashboard;
