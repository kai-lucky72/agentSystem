import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getPerformanceRecords, getPerformanceByUser } from '../../store/performanceSlice';
import Navbar from '../layout/Navbar';
import Sidebar from '../layout/Sidebar';
import { Chart } from 'chart.js/auto';

const PerformanceCharts = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { performanceRecords, userPerformance, loading } = useSelector(state => state.performance);
  
  // Chart references
  const attendanceChartRef = useRef(null);
  const reportChartRef = useRef(null);
  const clientChartRef = useRef(null);
  const performanceTrendChartRef = useRef(null);
  
  // Chart instances
  const [attendanceChart, setAttendanceChart] = useState(null);
  const [reportCompletionChart, setReportCompletionChart] = useState(null);
  const [clientChart, setClientChart] = useState(null);
  const [performanceTrendChart, setPerformanceTrendChart] = useState(null);
  
  // Filters
  const [period, setPeriod] = useState('weekly');
  const [dateRange, setDateRange] = useState({ 
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  useEffect(() => {
    // Load performance data
    dispatch(getPerformanceRecords({ period }));
    if (user) {
      dispatch(getPerformanceByUser(user.id));
    }
  }, [dispatch, user, period]);
  
  // Function to get performance metrics organized by date
  const getPerformanceDataByDate = (records) => {
    if (!records || records.length === 0) return { dates: [], attendance: [], reports: [], clients: [] };
    
    // Sort records by date
    const sortedRecords = [...records].sort((a, b) => {
      return new Date(a.period_start_date) - new Date(b.period_start_date);
    });
    
    const dates = sortedRecords.map(record => {
      const date = new Date(record.period_start_date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    const attendance = sortedRecords.map(record => {
      const metrics = record.metrics || {};
      return metrics.attendance_rate || 0;
    });
    
    const reports = sortedRecords.map(record => {
      const metrics = record.metrics || {};
      return metrics.report_completion || 0;
    });
    
    const clients = sortedRecords.map(record => {
      const metrics = record.metrics || {};
      return metrics.clients_added || 0;
    });
    
    return { dates, attendance, reports, clients };
  };
  
  // Create or update attendance chart
  useEffect(() => {
    if (!performanceRecords || performanceRecords.length === 0) return;
    
    const { dates, attendance } = getPerformanceDataByDate(performanceRecords);
    
    if (dates.length === 0) return;
    
    const ctx = attendanceChartRef.current.getContext('2d');
    
    // Destroy previous chart if it exists
    if (attendanceChart) {
      attendanceChart.destroy();
    }
    
    // Create new chart
    const newChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Attendance Rate (%)',
          data: attendance,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Attendance Performance',
            font: {
              size: 16
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Percent (%)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    });
    
    setAttendanceChart(newChart);
    
    // Return cleanup function
    return () => {
      if (newChart) {
        newChart.destroy();
      }
    };
  }, [performanceRecords, attendanceChartRef]);
  
  // Create or update report completion chart
  useEffect(() => {
    if (!performanceRecords || performanceRecords.length === 0) return;
    
    const { dates, reports } = getPerformanceDataByDate(performanceRecords);
    
    if (dates.length === 0) return;
    
    const ctx = reportChartRef.current.getContext('2d');
    
    // Destroy previous chart if it exists
    if (reportCompletionChart) {
      reportCompletionChart.destroy();
    }
    
    // Create new chart
    const newChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [{
          label: 'Report Completions',
          data: reports,
          backgroundColor: 'rgba(139, 92, 246, 0.5)',
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Report Completion',
            font: {
              size: 16
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Count'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    });
    
    setReportCompletionChart(newChart);
    
    // Return cleanup function
    return () => {
      if (newChart) {
        newChart.destroy();
      }
    };
  }, [performanceRecords, reportChartRef]);
  
  // Create or update client additions chart
  useEffect(() => {
    if (!performanceRecords || performanceRecords.length === 0) return;
    
    const { dates, clients } = getPerformanceDataByDate(performanceRecords);
    
    if (dates.length === 0) return;
    
    const ctx = clientChartRef.current.getContext('2d');
    
    // Destroy previous chart if it exists
    if (clientChart) {
      clientChart.destroy();
    }
    
    // Create new chart
    const newChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [{
          label: 'Clients Added',
          data: clients,
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Client Acquisitions',
            font: {
              size: 16
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Count'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    });
    
    setClientChart(newChart);
    
    // Return cleanup function
    return () => {
      if (newChart) {
        newChart.destroy();
      }
    };
  }, [performanceRecords, clientChartRef]);
  
  // Create or update performance trend chart (combine multiple metrics)
  useEffect(() => {
    if (!userPerformance || userPerformance.length === 0) return;
    
    // Sort records by date
    const sortedRecords = [...userPerformance].sort((a, b) => {
      return new Date(a.period_start_date) - new Date(b.period_start_date);
    });
    
    const labels = sortedRecords.map(record => {
      const date = new Date(record.period_start_date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    // Extract data for each metric
    const metrics = sortedRecords.map(record => record.metrics || {});
    
    // Calculate overall performance score (average of all metrics)
    const overallScores = metrics.map(metric => {
      const values = Object.values(metric).filter(val => typeof val === 'number');
      if (values.length === 0) return 0;
      
      const sum = values.reduce((total, val) => total + val, 0);
      return sum / values.length;
    });
    
    const ctx = performanceTrendChartRef.current.getContext('2d');
    
    // Destroy previous chart if it exists
    if (performanceTrendChart) {
      performanceTrendChart.destroy();
    }
    
    // Create new chart
    const newChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: Object.keys(metrics[0] || {}).filter(key => key !== 'last_updated'),
        datasets: [{
          label: 'Current Period',
          data: Object.values(metrics[0] || {}).filter(val => typeof val === 'number'),
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(16, 185, 129, 1)'
        },
        metrics.length > 1 ? {
          label: 'Previous Period',
          data: Object.values(metrics[1] || {}).filter(val => typeof val === 'number'),
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          borderColor: 'rgba(245, 158, 11, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(245, 158, 11, 1)'
        } : null].filter(Boolean)
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Performance Overview',
            font: {
              size: 16
            }
          },
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          r: {
            angleLines: {
              display: true
            },
            suggestedMin: 0,
            suggestedMax: 100
          }
        }
      }
    });
    
    setPerformanceTrendChart(newChart);
    
    // Return cleanup function
    return () => {
      if (newChart) {
        newChart.destroy();
      }
    };
  }, [userPerformance, performanceTrendChartRef]);
  
  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };
  
  const handleDateChange = (e, field) => {
    setDateRange({
      ...dateRange,
      [field]: e.target.value
    });
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Performance Dashboard</h1>
              
              {/* Filters */}
              <div className="flex space-x-4">
                <div>
                  <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                  <select
                    id="period"
                    value={period}
                    onChange={handlePeriodChange}
                    className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateChange(e, 'startDate')}
                    className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateChange(e, 'endDate')}
                    className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {/* Attendance Performance Chart */}
                  <div className="bg-white shadow rounded-lg p-6">
                    <div className="h-80">
                      <canvas ref={attendanceChartRef}></canvas>
                    </div>
                  </div>
                  
                  {/* Report Performance Chart */}
                  <div className="bg-white shadow rounded-lg p-6">
                    <div className="h-80">
                      <canvas ref={reportChartRef}></canvas>
                    </div>
                  </div>
                  
                  {/* Client Acquisitions Chart */}
                  <div className="bg-white shadow rounded-lg p-6">
                    <div className="h-80">
                      <canvas ref={clientChartRef}></canvas>
                    </div>
                  </div>
                </div>
                
                {/* Performance Radar Chart */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-medium text-gray-900 mb-4">Personal Performance Overview</h2>
                  <div className="h-80">
                    <canvas ref={performanceTrendChartRef}></canvas>
                  </div>
                </div>
                
                {/* Performance Summary */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-medium text-gray-900 mb-4">Performance Summary</h2>
                  
                  {userPerformance && userPerformance.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Rate</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reports Completed</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clients Added</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {userPerformance.slice(0, 5).map((record, index) => {
                            const metrics = record.metrics || {};
                            const lastUpdated = metrics.last_updated ? new Date(metrics.last_updated).toLocaleString() : 'N/A';
                            
                            return (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{record.period}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {`${new Date(record.period_start_date).toLocaleDateString()} - ${new Date(record.period_end_date).toLocaleDateString()}`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${metrics.attendance_rate || 0}%` }}></div>
                                    </div>
                                    <span>{metrics.attendance_rate ? `${metrics.attendance_rate.toFixed(1)}%` : '0%'}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metrics.report_completion || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metrics.clients_added || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lastUpdated}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No performance data available for the selected period.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PerformanceCharts;