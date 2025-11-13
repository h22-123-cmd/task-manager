import React, { useState, useEffect } from 'react';

interface TaskFormProps {
  onSave: (task: any) => void;
  onCancel: () => void;
  editingTask?: any;
  users: any[];
}

const TaskForm: React.FC<TaskFormProps> = ({ onSave, onCancel, editingTask, users }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    duration: '',
    date: new Date().toISOString().split('T')[0],
    type: 'individual',
    sharedWith: '',
    sharePercentage: '50'
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        amount: editingTask.amount.toString(),
        duration: editingTask.duration.toString(),
        date: editingTask.date.split('T')[0],
        type: editingTask.type,
        sharedWith: editingTask.sharedWith?.toString() || '',
        sharePercentage: editingTask.sharePercentage?.toString() || '50'
      });
    }
  }, [editingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      title: formData.title,
      amount: parseFloat(formData.amount),
      duration: parseInt(formData.duration),
      date: formData.date,
      type: formData.type,
      sharedWith: formData.type === 'shared' ? parseInt(formData.sharedWith) : null,
      sharePercentage: formData.type === 'shared' ? parseInt(formData.sharePercentage) : null
    };

    onSave(taskData);
  };

  const otherUsers = users.filter(u => u.id !== parseInt(localStorage.getItem('userId') || '0'));

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{editingTask ? 'ویرایش کار' : 'کار جدید'}</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label>عنوان کار *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label>مبلغ (تومان) *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label>مدت زمان (دقیقه) *</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label>تاریخ *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label>نوع کار</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              style={styles.input}
            >
              <option value="individual">فردی</option>
              <option value="shared">اشتراکی</option>
            </select>
          </div>

          {formData.type === 'shared' && (
            <>
              <div style={styles.inputGroup}>
                <label>همکار مشارکت‌کننده</label>
                <select 
                  value={formData.sharedWith}
                  onChange={(e) => setFormData({...formData, sharedWith: e.target.value})}
                  style={styles.input}
                >
                  <option value="">انتخاب کنید</option>
                  {otherUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label>درصد سهم شما (%)</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={formData.sharePercentage}
                  onChange={(e) => setFormData({...formData, sharePercentage: e.target.value})}
                  style={styles.input}
                />
              </div>
            </>
          )}

          <div style={styles.buttons}>
            <button type="button" onClick={onCancel} style={styles.cancelButton}>
              انصراف
            </button>
            <button type="submit" style={styles.saveButton}>
              {editingTask ? 'ویرایش' : 'ذخیره'}
            </button>
          </div>
        </form>
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
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '20px'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
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
  buttons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '20px'
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
  }
};

export default TaskForm;