/**
 * Shift Report Page Functionality
 */

function initPage() {
  // Get page elements
  const reportDate = document.getElementById('report-date');
  const reportShift = document.getElementById('report-shift');
  const totalTasks = document.getElementById('total-tasks');
  const completedCount = document.getElementById('completed-count');
  const pendingCount = document.getElementById('pending-count');
  const tasksReportBody = document.getElementById('tasks-report-body');
  const generationTime = document.getElementById('generation-time');
  const printReportBtn = document.getElementById('print-report');
  
  // Initialize the page
  loadReportData();
  setupEventListeners();
  
  /**
   * Load data for the report
   */
  function loadReportData() {
    // Get the most recent archive if available
    const archivedShifts = JSON.parse(localStorage.getItem('porter_archived_shifts') || '[]');
    
    let reportData;
    let tasks;
    
    if (archivedShifts.length > 0) {
      // Use the most recent archive
      reportData = archivedShifts[archivedShifts.length - 1];
      tasks = reportData.tasks;
      
      // Set date display
      const date = new Date(reportData.date);
      reportDate.textContent = `Date: ${app.formatDate(date)}`;
      
      // Set shift display
      const shiftText = reportData.shift === 'day' 
        ? `Day Shift (${reportData.shiftStart} - ${reportData.shiftEnd})`
        : `Night Shift (${reportData.shiftStart} - ${reportData.shiftEnd})`;
      reportShift.textContent = `Shift: ${shiftText}`;
      
      // Set generation time
      const archiveDate = new Date(reportData.archivedAt);
      generationTime.textContent = `${archiveDate.toLocaleDateString()} ${archiveDate.toLocaleTimeString()}`;
    } else {
      // Use current tasks
      tasks = app.getCurrentShiftTasks();
      
      // Set date display
      reportDate.textContent = `Date: ${app.formatDate(app.currentDate)}`;
      
      // Set shift display
      const shiftText = app.currentShift === 'day' 
        ? `Day Shift (${app.settings.dayShiftStart} - ${app.settings.dayShiftEnd})`
        : `Night Shift (${app.settings.nightShiftStart} - ${app.settings.nightShiftEnd})`;
      reportShift.textContent = `Shift: ${shiftText}`;
      
      // Set generation time
      const now = new Date();
      generationTime.textContent = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    }
    
    // Update counts
    const completedTasks = tasks.filter(task => task.timeCompleted && task.staffId);
    const pendingTasks = tasks.filter(task => !task.timeCompleted || !task.staffId);
    
    totalTasks.textContent = tasks.length;
    completedCount.textContent = completedTasks.length;
    pendingCount.textContent = pendingTasks.length;
    
    // Populate table
    generateTasksTable(tasks);
  }
  
  /**
   * Generate the tasks table for the report
   */
  function generateTasksTable(tasks) {
    // Clear table
    tasksReportBody.innerHTML = '';
    
    if (tasks.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = '<td colspan="9" class="empty-state">No tasks available for this shift</td>';
      tasksReportBody.appendChild(emptyRow);
      return;
    }
    
    // Sort tasks by timeReceived
    const sortedTasks = [...tasks].sort((a, b) => {
      // First by status (completed first)
      if (a.status === 'completed' && b.status !== 'completed') return -1;
      if (a.status !== 'completed' && b.status === 'completed') return 1;
      
      // Then by time received
      return a.timeReceived.localeCompare(b.timeReceived);
    });
    
    // Add each task to the table
    sortedTasks.forEach(task => {
      const row = document.createElement('tr');
      
      const itemType = app.getJobTypeName(task.itemTypeId);
      const fromDepartment = app.getDepartmentName(task.fromDepartmentId);
      const toDepartment = app.getDepartmentName(task.toDepartmentId);
      const transportType = task.transportType || 'N/A';
      const timeReceived = task.timeReceived;
      const timeAllocated = task.timeAllocated || 'N/A';
      const timeCompleted = task.timeCompleted || 'N/A';
      const staffName = task.staffId ? app.getStaffName(task.staffId) : 'Unassigned';
      const status = task.status === 'completed' ? 'Completed' : 'Pending';
      
      row.innerHTML = `
        <td>${itemType}</td>
        <td>${fromDepartment}</td>
        <td>${toDepartment}</td>
        <td>${itemType === 'Patient Transfer' ? transportType : 'N/A'}</td>
        <td>${timeReceived}</td>
        <td>${timeAllocated}</td>
        <td>${timeCompleted}</td>
        <td>${staffName}</td>
        <td>${status}</td>
      `;
      
      // Add classes based on status
      if (status === 'Pending') {
        row.classList.add('pending-row');
      }
      
      tasksReportBody.appendChild(row);
    });
  }
  
  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Print report button
    printReportBtn.addEventListener('click', () => {
      window.print();
    });
  }
}
