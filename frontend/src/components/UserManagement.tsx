import React, { useState, useEffect } from 'react';

interface UserManagementProps {
  onClose: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onClose }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'Employee'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://localhost:7081/api/Auth/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('خطا در دریافت کاربران:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingUser 
        ? `https://localhost:7081/api/Auth/users/${editingUser.id}`
        : 'https://localhost:7081/api/Auth/register';
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingUser(null);
        setFormData({ username: '', password: '', fullName: '', role: 'Employee' });
        fetchUsers();
        alert(editingUser ? 'کاربر با موفقیت ویرایش شد' : 'کاربر با موفقیت اضافه شد');
      }
    } catch (error) {
      console.error('خطا در ذخیره کاربر:', error);
      alert('خطا در ذخیره کاربر');
    }
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm('آیا از حذف این کاربر مطمئن هستید؟')) {
      try {
        const response = await fetch(`https://localhost:7081/api/Auth/users/${userId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchUsers();
          alert('کاربر با موفقیت حذف شد');
        }
      } catch (error) {
        console.error('خطا در حذف کاربر:', error);
        alert('خطا در حذف کاربر');
      }
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // پسورد رو خالی می‌ذاریم
      fullName: user.fullName,
      role: user.role
    });
    setShowForm(true);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2>👥 مدیریت کاربران</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        <div style={styles.content}>
          <button 
            onClick={() => { setShowForm(true); setEditingUser(null); setFormData({ username: '', password: '', fullName: '', role: 'Employee' }); }}
            style={styles.addButton}
          >
            ➕ افزودن کاربر جدید
          </button>

          {showForm && (
            <div style={styles.formContainer}>
              <h3>{editingUser ? 'ویرایش کاربر' : 'کاربر جدید'}</h3>
              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label>نام کامل *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label>نام کاربری *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label>رمز عبور {!editingUser && '*'}</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    style={styles.input}
                    required={!editingUser}
                    placeholder={editingUser ? "خالی بگذارید برای تغییر نکردن" : ""}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label>نقش *</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    style={styles.input}
                  >
                    <option value="Employee">کارمند</option>
                    <option value="Admin">مدیر</option>
                  </select>
                </div>

                <div style={styles.formButtons}>
                  <button type="button" onClick={() => { setShowForm(false); setEditingUser(null); }} style={styles.cancelButton}>
                    انصراف
                  </button>
                  <button type="submit" style={styles.saveButton}>
                    {editingUser ? 'ویرایش' : 'ذخیره'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={styles.usersList}>
            <h3>لیست کاربران ({users.length})</h3>
            {users.map(user => (
              <div key={user.id} style={styles.userCard}>
                <div style={styles.userInfo}>
                  <strong>{user.fullName}</strong>
                  <div style={styles.userDetails}>
                    <span>نام کاربری: {user.username}</span>
                    <span>نقش: {user.role === 'Admin' ? 'مدیر' : 'کارمند'}</span>
                    <span>وضعیت: {user.isActive ? 'فعال' : 'غیرفعال'}</span>
                  </div>
                </div>
                <div style={styles.userActions}>
                  <button onClick={() => handleEdit(user)} style={styles.editButton}>
                    ✏️ ویرایش
                  </button>
                  {user.id !== 1 && ( // کاربر ادمین اصلی رو نمی‌شه حذف کرد
                    <button onClick={() => handleDelete(user.id)} style={styles.deleteButton}>
                      🗑️ حذف
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed' as 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 30px',
    borderBottom: '1px solid #e2e8f0'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#718096'
  },
  content: {
    padding: '30px'
  },
  addButton: {
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '20px'
  },
  formContainer: {
    backgroundColor: '#f8fafc',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '15px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '5px'
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  formButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end'
  },
  cancelButton: {
    padding: '10px 20px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  saveButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#4299e1',
    color: 'white',
    cursor: 'pointer'
  },
  usersList: {
    marginTop: '20px'
  },
  userCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    marginBottom: '10px',
    backgroundColor: 'white'
  },
  userInfo: {
    flex: 1
  },
  userDetails: {
    display: 'flex',
    gap: '15px',
    marginTop: '5px',
    fontSize: '14px',
    color: '#718096'
  },
  userActions: {
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
  }
};

export default UserManagement;