/**
 * Mock Data Initialization for Local Testing
 * Provides hardcoded data directly to the app
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('Loading mock data for development');
  
  // Create a global namespace for our data
  window.mockData = {
    staff: [
      {"id": 1, "name": "John Smith"},
      {"id": 2, "name": "Sarah Johnson"},
      {"id": 3, "name": "Michael Brown"},
      {"id": 4, "name": "Emily Davis"},
      {"id": 5, "name": "David Wilson"},
      {"id": 6, "name": "Jessica Taylor"},
      {"id": 7, "name": "Daniel Martinez"},
      {"id": 8, "name": "Laura Anderson"},
      {"id": 9, "name": "Robert Thomas"},
      {"id": 10, "name": "Jennifer Garcia"}
    ],
    
    buildings: [
      {"id": 1, "name": "Main Hospital"},
      {"id": 2, "name": "Outpatient Center"},
      {"id": 3, "name": "Emergency Services"},
      {"id": 4, "name": "Administration Building"},
      {"id": 5, "name": "Research Wing"}
    ],
    
    departments: [
      {"id": 1, "name": "Emergency Room", "buildingId": 3},
      {"id": 2, "name": "Intensive Care Unit", "buildingId": 1},
      {"id": 3, "name": "Radiology", "buildingId": 1},
      {"id": 4, "name": "Laboratory", "buildingId": 1},
      {"id": 5, "name": "Pharmacy", "buildingId": 1},
      {"id": 6, "name": "General Surgery", "buildingId": 1},
      {"id": 7, "name": "Orthopedics", "buildingId": 1},
      {"id": 8, "name": "Cardiology", "buildingId": 2},
      {"id": 9, "name": "Neurology", "buildingId": 2},
      {"id": 10, "name": "Pediatrics", "buildingId": 1},
      {"id": 11, "name": "Oncology", "buildingId": 5},
      {"id": 12, "name": "Administration", "buildingId": 4},
      {"id": 13, "name": "Records", "buildingId": 4}
    ],
    
    jobTypes: [
      {"id": 1, "name": "Patient Transfer", "transportOptions": ["Bed", "Chair", "Walker", "Stretcher"]},
      {"id": 2, "name": "Lab Sample"},
      {"id": 3, "name": "Medication Delivery"},
      {"id": 4, "name": "Medical Equipment"},
      {"id": 5, "name": "Documents"},
      {"id": 6, "name": "Supplies"}
    ],
    
    jobCategories: [
      {"id": 1, "name": "Routine", "allowedTypes": [1, 2, 3, 4, 5, 6]},
      {"id": 2, "name": "Urgent", "allowedTypes": [1, 2, 3, 4, 5, 6]},
      {"id": 3, "name": "Emergency", "allowedTypes": [1, 2, 3, 4]},
      {"id": 4, "name": "Staff Request", "allowedTypes": [4, 5, 6]}
    ]
  };
  
  // Handle page-specific initializations
  if (document.querySelector('.simple-screen')) {
    console.log('Initializing home page with mock data');
    initializeHomePage();
  } else if (document.querySelector('.new-task-form')) {
    console.log('Initializing new task form with mock data');
    initializeNewTaskPage();
  } else if (document.querySelector('#pending-tasks-list')) {
    console.log('Initializing pending tasks page with mock data');
    initializePendingTasksPage();
  } else if (document.querySelector('#completed-tasks-list')) {
    console.log('Initializing completed tasks page with mock data');
    initializeCompletedTasksPage();
  } else if (document.querySelector('.report-header')) {
    console.log('Initializing shift report page with mock data');
    initializeShiftReportPage();
  }
  
  // Basic initialization for the home page
  function initializeHomePage() {
    // Set date to today
    const dateInput = document.getElementById('current-date');
    if (dateInput) {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      dateInput.value = formattedDate;
    }
    
    // Set up shift buttons
    const shiftButtons = document.querySelectorAll('.shift-btn');
    if (shiftButtons.length) {
      shiftButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          shiftButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }
    
    // Set up navigation
    setupNavigation();
  }
  
  // Initialize the new task page with form data
  function initializeNewTaskPage() {
    // Pre-populate dropdowns
    populateSelectOptions('job-category', window.mockData.jobCategories);
    populateSelectOptions('from-department', window.mockData.departments);
    populateSelectOptions('to-department', window.mockData.departments);
    
    // Set current time
    const timeInput = document.getElementById('time-received');
    if (timeInput) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      timeInput.value = `${hours}:${minutes}`;
    }
    
    // Setup job category change event
    const jobCategorySelect = document.getElementById('job-category');
    if (jobCategorySelect) {
      jobCategorySelect.addEventListener('change', () => {
        const categoryId = parseInt(jobCategorySelect.value);
        const category = window.mockData.jobCategories.find(c => c.id === categoryId);
        
        if (category && category.allowedTypes) {
          populateJobTypes(category.allowedTypes);
        }
      });
    }
    
    // Navigation
    setupNavigation();
  }
  
  // Initialize the pending tasks page
  function initializePendingTasksPage() {
    // Display any tasks from localStorage
    const pendingTasks = getTasksByStatus('pending');
    displayPendingTasks(pendingTasks);
    
    // Navigation
    setupNavigation();
  }
  
  // Initialize the completed tasks page
  function initializeCompletedTasksPage() {
    // Display any tasks from localStorage
    const completedTasks = getTasksByStatus('completed');
    displayCompletedTasks(completedTasks);
    
    // Navigation
    setupNavigation();
  }
  
  // Initialize the shift report page
  function initializeShiftReportPage() {
    // Show mock report data
    displayShiftReport();
    
    // Navigation
    setupNavigation();
  }
  
  // Helper functions
  function populateSelectOptions(selectId, options, valueProp = 'id', textProp = 'name') {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // Clear existing options (except first one)
    while (select.options.length > 1) {
      select.remove(1);
    }
    
    // Add new options
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option[valueProp];
      optionElement.textContent = option[textProp];
      select.appendChild(optionElement);
    });
  }
  
  function populateJobTypes(allowedTypeIds) {
    const itemTypeSelect = document.getElementById('item-type');
    if (!itemTypeSelect) return;
    
    // Clear existing options (except first one)
    while (itemTypeSelect.options.length > 1) {
      itemTypeSelect.remove(1);
    }
    
    // Add allowed job types
    const allowedTypes = window.mockData.jobTypes.filter(type => 
      allowedTypeIds.includes(type.id)
    );
    
    allowedTypes.forEach(type => {
      const option = document.createElement('option');
      option.value = type.id;
      option.textContent = type.name;
      itemTypeSelect.appendChild(option);
    });
  }
  
  function getTasksByStatus(status) {
    const tasksString = localStorage.getItem('porter_tasks') || '[]';
    const allTasks = JSON.parse(tasksString);
    return allTasks.filter(task => task.status === status);
  }
  
  function displayPendingTasks(tasks) {
    const tableBody = document.getElementById('pending-tasks-list');
    const emptyState = document.getElementById('empty-state');
    
    if (!tableBody) return;
    
    if (tasks.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Add task rows
    tasks.forEach(task => {
      const row = document.createElement('tr');
      
      // Find related data
      const jobType = window.mockData.jobTypes.find(t => t.id === task.itemTypeId);
      const fromDept = window.mockData.departments.find(d => d.id === task.fromDepartmentId);
      const toDept = window.mockData.departments.find(d => d.id === task.toDepartmentId);
      const staff = task.staffId ? window.mockData.staff.find(s => s.id === task.staffId) : null;
      
      row.innerHTML = `
        <td>${jobType ? jobType.name : 'Unknown'}</td>
        <td>${fromDept ? fromDept.name : 'Unknown'}</td>
        <td>${toDept ? toDept.name : 'Unknown'}</td>
        <td>${task.transportType || '-'}</td>
        <td>${task.timeReceived}</td>
        <td>${staff ? staff.name : 'Unassigned'}</td>
        <td class="action-cell">
          <button class="table-action-btn edit" data-id="${task.id}">Edit</button>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
  }
  
  function displayCompletedTasks(tasks) {
    const tableBody = document.getElementById('completed-tasks-list');
    const emptyState = document.getElementById('empty-state');
    
    if (!tableBody) return;
    
    if (tasks.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Add task rows
    tasks.forEach(task => {
      const row = document.createElement('tr');
      
      // Find related data
      const jobType = window.mockData.jobTypes.find(t => t.id === task.itemTypeId);
      const fromDept = window.mockData.departments.find(d => d.id === task.fromDepartmentId);
      const toDept = window.mockData.departments.find(d => d.id === task.toDepartmentId);
      const staff = task.staffId ? window.mockData.staff.find(s => s.id === task.staffId) : null;
      
      row.innerHTML = `
        <td>${jobType ? jobType.name : 'Unknown'}</td>
        <td>${fromDept ? fromDept.name : 'Unknown'}</td>
        <td>${toDept ? toDept.name : 'Unknown'}</td>
        <td>${task.transportType || '-'}</td>
        <td>${task.timeReceived}</td>
        <td>${task.timeCompleted}</td>
        <td>${staff ? staff.name : 'Unassigned'}</td>
        <td class="action-cell">
          <button class="table-action-btn edit" data-id="${task.id}">Edit</button>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
  }
  
  function displayShiftReport() {
    // Add mock data for the report
    document.getElementById('report-date').textContent = 'Date: March 27, 2025';
    document.getElementById('report-shift').textContent = 'Shift: Day Shift (08:00 - 20:00)';
    document.getElementById('total-tasks').textContent = '5';
    document.getElementById('completed-count').textContent = '3';
    document.getElementById('pending-count').textContent = '2';
    document.getElementById('generation-time').textContent = new Date().toLocaleString();
    
    // Add some sample tasks to the report
    const reportTable = document.getElementById('tasks-report-body');
    if (reportTable) {
      reportTable.innerHTML = `
        <tr>
          <td>Patient Transfer</td>
          <td>Emergency Room</td>
          <td>Radiology</td>
          <td>Stretcher</td>
          <td>09:15</td>
          <td>09:20</td>
          <td>09:45</td>
          <td>John Smith</td>
          <td>Completed</td>
        </tr>
        <tr>
          <td>Lab Sample</td>
          <td>Intensive Care Unit</td>
          <td>Laboratory</td>
          <td>-</td>
          <td>09:30</td>
          <td>09:35</td>
          <td>09:50</td>
          <td>Sarah Johnson</td>
          <td>Completed</td>
        </tr>
        <tr>
          <td>Medication Delivery</td>
          <td>Pharmacy</td>
          <td>Pediatrics</td>
          <td>-</td>
          <td>10:00</td>
          <td>10:05</td>
          <td>10:20</td>
          <td>Michael Brown</td>
          <td>Completed</td>
        </tr>
        <tr>
          <td>Patient Transfer</td>
          <td>Neurology</td>
          <td>Radiology</td>
          <td>Wheelchair</td>
          <td>10:15</td>
          <td>10:20</td>
          <td>-</td>
          <td>Emily Davis</td>
          <td>Pending</td>
        </tr>
        <tr>
          <td>Documents</td>
          <td>Administration</td>
          <td>Records</td>
          <td>-</td>
          <td>10:30</td>
          <td>-</td>
          <td>-</td>
          <td>Unassigned</td>
          <td>Pending</td>
        </tr>
      `;
    }
  }
  
  function setupNavigation() {
    // Add click handlers for navigation buttons if they exist
    const homeBtn = document.querySelector('.back-btn');
    if (homeBtn) {
      homeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/';
      });
    }
    
    const newTaskBtn = document.getElementById('new-task-btn');
    if (newTaskBtn) {
      newTaskBtn.addEventListener('click', () => {
        window.location.href = '/new-task';
      });
    }
    
    const pendingBtn = document.getElementById('pending-tasks-btn');
    if (pendingBtn) {
      pendingBtn.addEventListener('click', () => {
        window.location.href = '/pending-tasks';
      });
    }
    
    const completedBtn = document.getElementById('completed-tasks-btn');
    if (completedBtn) {
      completedBtn.addEventListener('click', () => {
        window.location.href = '/completed-tasks';
      });
    }
    
    const shiftCompleteBtn = document.getElementById('shift-complete-btn');
    if (shiftCompleteBtn) {
      shiftCompleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to complete this shift? This will archive all current tasks.')) {
          window.location.href = '/shift-report';
        }
      });
    }
  }
});
