import React, { useState } from 'react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('در حال ارسال درخواست به سرور...');
      
      const response = await fetch('https://localhost:7081/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          username: username, 
          password: password 
        }),
      });

      console.log('وضعیت پاسخ:', response.status);
      console.log('وضعیت OK:', response.ok);

      if (!response.ok) {
        throw new Error(`خطای HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('داده دریافتی:', data);

      if (data.success) {
        console.log('ورود موفق:', data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert(`خوش آمدید ${data.user.fullName}`);
        // ریدایرکت به داشبورد
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'نام کاربری یا رمز عبور اشتباه است');
      }
    } catch (err: any) {
      console.error('خطای کامل:', err);
      setError(`خطا در ارتباط با سرور: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // استایل‌ها (همان کد قبلی)
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    },
    loginBox: {
      backgroundColor: 'white',
      padding: '40px 30px',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
      width: '100%',
      maxWidth: '420px',
      textAlign: 'center' as 'center'
    },
    header: {
      marginBottom: '30px'
    },
    logo: {
      fontSize: '50px',
      marginBottom: '15px'
    },
    title: {
      color: '#2d3748',
      marginBottom: '8px',
      fontSize: '28px',
      fontWeight: 'bold' as 'bold'
    },
    subtitle: {
      color: '#718096',
      fontSize: '16px',
      marginBottom: '0'
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as 'column'
    },
    inputGroup: {
      marginBottom: '25px',
      textAlign: 'right' as 'right'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      color: '#4a5568',
      fontWeight: '600' as '600',
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '14px',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '16px',
      outline: 'none',
      transition: 'all 0.3s ease',
      textAlign: 'right' as 'right'
    },
    button: {
      backgroundColor: '#4299e1',
      color: 'white',
      border: 'none',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 'bold' as 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '10px'
    },
    buttonDisabled: {
      backgroundColor: '#a0aec0',
      cursor: 'not-allowed'
    },
    error: {
      backgroundColor: '#fed7d7',
      color: '#c53030',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
      textAlign: 'center' as 'center'
    },
    footer: {
      marginTop: '30px',
      paddingTop: '20px',
      borderTop: '1px solid #e2e8f0'
    },
    footerText: {
      color: '#a0aec0',
      fontSize: '14px',
      margin: '0'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <div style={styles.header}>
          <div style={styles.logo}>✅</div>
          <h1 style={styles.title}>سیستم مدیریت وظایف</h1>
          <p style={styles.subtitle}>Task Management System</p>
        </div>
        
        <form onSubmit={handleLogin} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>نام کاربری / Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="نام کاربری خود را وارد کنید"
              required
              disabled={loading}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>رمز عبور / Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="رمز عبور خود را وارد کنید"
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
            disabled={loading}
          >
            {loading ? 'در حال ورود...' : 'ورود به سیستم / Login'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>نسخه ۱.۰</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;