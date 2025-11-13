import React, { useState, useEffect } from 'react';

interface ReportsProps {
  onClose: () => void;
}

const Reports: React.FC<ReportsProps> = ({ onClose }) => {
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'summary'>('daily');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Daily report states
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Monthly report states  
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);
  
  // Summary report states
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = userData.id || 1;

  const generateReport = async () => {
    setLoading(true);
    try {
      let url = '';
      
      switch (reportType) {
        case 'daily':
          url = `https://localhost:7081/api/reports/daily?userId=${userId}&date=${dailyDate}`;
          break;
        case 'monthly':
          url = `https://localhost:7081/api/reports/monthly?userId=${userId}&year=${monthlyYear}&month=${monthlyMonth}`;
          break;
        case 'summary':
          url = `https://localhost:7081/api/reports/summary?userId=${userId}&startDate=${startDate}&endDate=${endDate}`;
          break;
      }

      const response = await fetch(url);
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report');
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    generateReport();
  }, []);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2>📊 Reports</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        <div style={styles.content}>
          {/* Report Type Selection */}
          <div style={styles.reportTypeSection}>
            <label style={styles.label}>Report Type: </label>
            <select 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value as any)}
              style={styles.select}
            >
              <option value="daily">Daily Report</option>
              <option value="monthly">Monthly Report</option>
              <option value="summary">Summary Report</option>
            </select>
          </div>

          {/* Report Parameters */}
          <div style={styles.parametersSection}>
            {reportType === 'daily' && (
              <div style={styles.parameterGroup}>
                <label style={styles.label}>Date: </label>
                <input
                  type="date"
                  value={dailyDate}
                  onChange={(e) => setDailyDate(e.target.value)}
                  style={styles.input}
                />
              </div>
            )}

            {reportType === 'monthly' && (
              <div style={styles.parameterGroup}>
                <div style={styles.parameterRow}>
                  <label style={styles.label}>Year: </label>
                  <input
                    type="number"
                    value={monthlyYear}
                    onChange={(e) => setMonthlyYear(parseInt(e.target.value))}
                    style={styles.input}
                    min="2020"
                    max="2030"
                  />
                </div>
                <div style={styles.parameterRow}>
                  <label style={styles.label}>Month: </label>
                  <select 
                    value={monthlyMonth} 
                    onChange={(e) => setMonthlyMonth(parseInt(e.target.value))}
                    style={styles.select}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2000, i).toLocaleString('en', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {reportType === 'summary' && (
              <div style={styles.parameterGroup}>
                <div style={styles.parameterRow}>
                  <label style={styles.label}>Start Date: </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.parameterRow}>
                  <label style={styles.label}>End Date: </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>
            )}

            <button 
              onClick={generateReport} 
              style={styles.generateButton}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>

          {/* Report Results */}
          {reportData && (
            <div style={styles.resultsSection}>
              <h3>Report Results</h3>
              
              {reportType === 'daily' && (
                <div>
                  <div style={styles.summaryCards}>
                    <div style={styles.summaryCard}>
                      <h4>Total Tasks</h4>
                      <p style={styles.summaryNumber}>{reportData.totalTasks}</p>
                    </div>
                    <div style={styles.summaryCard}>
                      <h4>Total Amount</h4>
                      <p style={styles.summaryNumber}>{formatCurrency(reportData.totalAmount)}</p>
                    </div>
                    <div style={styles.summaryCard}>
                      <h4>Total Duration</h4>
                      <p style={styles.summaryNumber}>{formatDuration(reportData.totalDuration)}</p>
                    </div>
                  </div>

                  {reportData.tasks && reportData.tasks.length > 0 && (
                    <div style={styles.tasksList}>
                      <h4>Tasks Details</h4>
                      {reportData.tasks.map((task: any, index: number) => (
                        <div key={index} style={styles.taskItem}>
                          <strong>{task.title}</strong>
                          <div style={styles.taskDetails}>
                            <span>Amount: {formatCurrency(task.amount)}</span>
                            <span>Duration: {task.duration}</span>
                            <span>Type: {task.type}</span>
                            {task.sharedWithName && (
                              <span>Shared with: {task.sharedWithName} ({task.sharePercentage}%)</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {reportType === 'monthly' && (
                <div>
                  <div style={styles.summaryCards}>
                    <div style={styles.summaryCard}>
                      <h4>Total Tasks</h4>
                      <p style={styles.summaryNumber}>{reportData.totalTasks}</p>
                    </div>
                    <div style={styles.summaryCard}>
                      <h4>Total Amount</h4>
                      <p style={styles.summaryNumber}>{formatCurrency(reportData.totalAmount)}</p>
                    </div>
                    <div style={styles.summaryCard}>
                      <h4>Total Duration</h4>
                      <p style={styles.summaryNumber}>{formatDuration(reportData.totalDuration)}</p>
                    </div>
                  </div>

                  {reportData.dailyStats && reportData.dailyStats.length > 0 && (
                    <div style={styles.dailyStats}>
                      <h4>Daily Statistics</h4>
                      {reportData.dailyStats.map((stat: any, index: number) => (
                        <div key={index} style={styles.dailyStat}>
                          <strong>{stat.date}</strong>
                          <div style={styles.statDetails}>
                            <span>Tasks: {stat.tasksCount}</span>
                            <span>Amount: {formatCurrency(stat.totalAmount)}</span>
                            <span>Duration: {formatDuration(stat.totalDuration)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {reportType === 'summary' && (
                <div style={styles.summaryCards}>
                  <div style={styles.summaryCard}>
                    <h4>Total Tasks</h4>
                    <p style={styles.summaryNumber}>{reportData.totalTasks}</p>
                  </div>
                  <div style={styles.summaryCard}>
                    <h4>Total Amount</h4>
                    <p style={styles.summaryNumber}>{formatCurrency(reportData.totalAmount)}</p>
                  </div>
                  <div style={styles.summaryCard}>
                    <h4>Total Duration</h4>
                    <p style={styles.summaryNumber}>{formatDuration(reportData.totalDuration)}</p>
                  </div>
                  <div style={styles.summaryCard}>
                    <h4>Avg Daily Amount</h4>
                    <p style={styles.summaryNumber}>{formatCurrency(reportData.averageDailyAmount)}</p>
                  </div>
                  <div style={styles.summaryCard}>
                    <h4>Avg Daily Tasks</h4>
                    <p style={styles.summaryNumber}>{reportData.averageDailyTasks.toFixed(1)}</p>
                  </div>
                </div>
              )}
            </div>
          )}
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
    maxWidth: '900px',
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
  reportTypeSection: {
    marginBottom: '20px'
  },
  parametersSection: {
    backgroundColor: '#f8fafc',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  parameterGroup: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '15px'
  },
  parameterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  label: {
    fontWeight: 'bold' as 'bold',
    minWidth: '100px'
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    minWidth: '150px'
  },
  generateButton: {
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '10px'
  },
  resultsSection: {
    marginTop: '20px'
  },
  summaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '20px'
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center' as 'center'
  },
  summaryNumber: {
    fontSize: '24px',
    fontWeight: 'bold' as 'bold',
    color: '#4299e1',
    margin: '10px 0 0 0'
  },
  tasksList: {
    marginTop: '20px'
  },
  taskItem: {
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '15px',
    marginBottom: '10px',
    backgroundColor: 'white'
  },
  taskDetails: {
    display: 'flex',
    gap: '15px',
    marginTop: '8px',
    fontSize: '14px',
    color: '#718096'
  },
  dailyStats: {
    marginTop: '20px'
  },
  dailyStat: {
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '15px',
    marginBottom: '10px',
    backgroundColor: 'white'
  },
  statDetails: {
    display: 'flex',
    gap: '15px',
    marginTop: '8px',
    fontSize: '14px',
    color: '#718096'
  }
};

export default Reports;