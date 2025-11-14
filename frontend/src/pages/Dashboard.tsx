import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import UserManagement from '../components/UserManagement';
import Reports from '../components/Reports';
import { API_BASE } from '../config';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalTasks: 0, totalAmount: 0, totalDuration: 0 });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showReports, setShowReports] = useState(false);

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = userData.id || 1;

  useEffect(() => {
    fetchUsers();
    fetchTasks();
    fetchSummary();
  }, [selectedDate]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/Auth/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      console.log('Fetching tasks for user:', userId, 'on date:', selectedDate);
      
      const response = await fetch(`${API_BASE}/tasks?userId=${userId}`);
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Tasks received:', data);
      
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_BASE}/tasks?userId=${userId}`);
      const data = await response.json();
      setSummary({
        totalTasks: data.totalTasks,
        totalAmount: data.totalAmount,
        totalDuration: data.totalDuration
      });
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleSaveTask = async (taskData: any) => {
    try {
      console.log('Current user:', userData);
      console.log('Task data to save:', taskData);

      const taskWithUser = {
        ...taskData,
        userId: userId
      };

      const response = await fetch(`${API_BASE}/tasks?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskWithUser)
      });

      console.log('Server response status:', response.status);

      if (response.ok) {
        const savedTask = await response.json();
        console.log('Task saved:', savedTask);
        
        // Add to local list
        setTasks(prevTasks => [...prevTasks, savedTask]);
        
        // Update summary
        setSummary(prevSummary => ({
          totalTasks: prevSummary.totalTasks + 1,
          totalAmount: prevSummary.totalAmount + savedTask.amount,
          totalDuration: prevSummary.totalDuration + savedTask.duration
        }));
        
        setShowTaskForm(false);
        setEditingTask(null);
        alert('Task added successfully');
      } else {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        alert('Error saving task');
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Server connection error');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await fetch(`${API_BASE}/tasks?userId=${userId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          // Remove from local list
          setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
          
          // Update summary
          const deletedTask = tasks.find(task => task.id === taskId);
          if (deletedTask) {
            setSummary(prevSummary => ({
              totalTasks: prevSummary.totalTasks - 1,
              totalAmount: prevSummary.totalAmount - deletedTask.amount,
              totalDuration: prevSummary.totalDuration - deletedTask.duration
            }));
          }
          
          alert('Task deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task');
      }
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Task Management Dashboard</h1>
        <div style={styles.userInfo}>
          <span>Welcome, <strong>{userData.fullName}</strong> ({userData.role === 'Admin' ? 'Admin' : 'Employee'})</span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={styles.summarySection}>
        <div style={styles.summaryCard}>
          <h3>📊 Today's Tasks</h3>
          <p style={styles.summaryNumber}>{summary.totalTasks}</p>
        </div>
        <div style={styles.summaryCard}>
          <h3>💰 Today's Income</h3>
          <p style={styles.summaryNumber}>{formatCurrency(summary.totalAmount)}</p>
        </div>
        <div style={styles.summaryCard}>
          <h3>⏰ Total Time</h3>
          <p style={styles.summaryNumber}>{formatDuration(summary.totalDuration)}</p>
        </div>
      </div>

      {/* Date Filter and Add Button */}
      <div style={styles.actionsSection}>
        <div style={styles.dateFilter}>
          <label>Date: </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.dateInput}
          />
        </div>
        <button 
          onClick={() => { setShowTaskForm(true); setEditingTask(null); }} 
          style={styles.addButton}
        >
          ➕ Add New Task
        </button>
      </div>

      {/* Admin Actions */}
      {userData.role === 'Admin' && (
        <div style={styles.actionsSection}>
          <div style={styles.adminActions}>
            <button 
              onClick={() => setShowUserManagement(true)} 
              style={styles.managementButton}
            >
              👥 User Management
            </button>
            <button 
              onClick={() => setShowReports(true)} 
              style={styles.reportsButton}
            >
              📊 Reports
            </button>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div style={styles.tasksSection}>
        <h2>📋 Tasks List</h2>
        {tasks.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No tasks found for this date.</p>
            <button 
              onClick={() => setShowTaskForm(true)} 
              style={styles.primaryButton}
            >
              Add First Task
            </button>
          </div>
        ) : (
          <div style={styles.tasksList}>
            {tasks.map(task => (
              <div key={task.id} style={styles.taskCard}>
                <div style={styles.taskHeader}>
                  <h4 style={styles.taskTitle}>{task.title}</h4>
                  <div style={styles.taskActions}>
                    <button 
                      onClick={() => handleEditTask(task)}
                      style={styles.editButton}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      style={styles.deleteButton}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
                <div style={styles.taskDetails}>
                  <div style={styles.taskDetail}>
                    <span>Amount:</span>
                    <strong>{formatCurrency(task.amount)}</strong>
                  </div>
                  <div style={styles.taskDetail}>
                    <span>Duration:</span>
                    <strong>{formatDuration(task.duration)}</strong>
                  </div>
                  <div style={styles.taskDetail}>
                    <span>Type:</span>
                    <strong>{task.type === 'individual' ? 'Individual' : 'Shared'}</strong>
                  </div>
                  {task.type === 'shared' && task.sharedWith && (
                    <div style={styles.taskDetail}>
                      <span>Colleague:</span>
                      <strong>
                        {users.find(u => u.id === task.sharedWith)?.fullName || 'Unknown'}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onSave={handleSaveTask}
          onCancel={() => { setShowTaskForm(false); setEditingTask(null); }}
          editingTask={editingTask}
          users={users}
        />
      )}

      {/* User Management Modal */}
      {showUserManagement && (
        <UserManagement onClose={() => setShowUserManagement(false)} />
      )}

      {/* Reports Modal */}
      {showReports && (
        <Reports onClose={() => setShowReports(false)} />
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f7fafc',
    direction: 'ltr' as 'ltr',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    padding: '20px'
  },
  header: {
    backgroundColor: 'white',
    padding: '20px 30px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  title: {
    color: '#2d3748',
    margin: 0
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  logoutButton: {
    backgroundColor: '#e53e3e',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  summarySection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center' as 'center'
  },
  summaryNumber: {
    fontSize: '24px',
    fontWeight: 'bold' as 'bold',
    color: '#4299e1',
    margin: '10px 0 0 0'
  },
  actionsSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  dateFilter: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  dateInput: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '5px'
  },
  addButton: {
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  adminActions: {
    display: 'flex',
    gap: '10px'
  },
  managementButton: {
    backgroundColor: '#9f7aea',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  reportsButton: {
    backgroundColor: '#38b2ac',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  tasksSection: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  emptyState: {
    textAlign: 'center' as 'center',
    padding: '40px',
    color: '#718096'
  },
  primaryButton: {
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '15px'
  },
  tasksList: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '15px'
  },
  taskCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#f8fafc'
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px'
  },
  taskTitle: {
    margin: 0,
    color: '#2d3748',
    fontSize: '18px'
  },
  taskActions: {
    display: 'flex',
    gap: '10px'
  },
  editButton: {
    backgroundColor: '#ed8936',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  deleteButton: {
    backgroundColor: '#e53e3e',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  taskDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px'
  },
  taskDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '5px 0',
    borderBottom: '1px solid #e2e8f0'
  }
};

export default Dashboard;