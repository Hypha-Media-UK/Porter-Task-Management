/**
 * Core functionality for Porter Task Management System
 */

// API Service - This will be replaced with actual API calls to Craft CMS
const apiService = {
  // Fetch data methods - these will be replaced with API calls in Craft implementation
  async fetchStaff() {
    try {
      // In CraftCMS, this would be a fetch to an API endpoint
      const response = await fetch('/src/data/staff.json');
      if (!response.ok) throw new Error('Failed to fetch staff');
      return await response.json();
    } catch (error) {
      console.error('Error fetching staff:', error);
      return [];
    }
  },
  
  async fetchBuildings() {
    try {
      const response = await fetch('/src/data/buildings.json');
      if (!response.ok) throw new Error('Failed to fetch buildings');
      return await response.json();
    } catch (error) {
      console.error('Error fetching buildings:', error);
      return [];
    }
  },
  
  async fetchDepartments() {
    try {
      const response = await fetch('/src/data/departments.json');
      if (!response.ok) throw new Error('Failed to fetch departments');
      return await response.json();
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  },
  
  async fetchJobTypes() {
    try {
      const response = await fetch('/src/data/jobTypes.json');
      if (!response.ok) throw new Error('Failed to fetch job types');
      return await response.json();
    } catch (error) {
      console.error('Error fetching job types:', error);
      return [];
    }
  },
  
  async fetchJobCategories() {
    try {
      const response = await fetch('/src/data/jobCategories.json');
      if (!response.ok) throw new Error('Failed to fetch job categories');
      return await response.json();
    } catch (error) {
      console.error('Error fetching job categories:', error);
      return [];
    }
  },
  
  // Task operations
  getTasks() {
    return JSON.parse(localStorage.getItem('porter_tasks') || '[]');
  },
  
  saveTask(task) {
    const tasks = this.getTasks();
    task.id = Date.now(); // Generate a unique ID
    tasks.push(task);
    localStorage.setItem('porter_tasks', JSON.stringify(tasks));
    return task;
  },
  
  updateTask(taskId, updates) {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex] = {...tasks[taskIndex], ...updates};
      localStorage.setItem('porter_tasks', JSON.stringify(tasks));
      return tasks[taskIndex];
    }
    return null;
  },
  
  deleteTask(taskId) {
    const tasks = this.getTasks();
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem('porter_tasks', JSON.stringify(updatedTasks));
    return taskId;
  },
  
  // Archives
  getArchivedShifts() {
    return JSON.parse(localStorage.getItem('porter_archived_shifts') || '[]');
  },
  
  saveArchivedShift(shift) {
    const archivedShifts = this.getArchivedShifts();
    archivedShifts.push(shift);
    localStorage.setItem('porter_archived_shifts', JSON.stringify(archivedShifts));
    return shift;
  }
};

// Main app global state
const app = {
  data: {
    staff: [],
    buildings: [],
    departments: [],
    jobTypes: [],
    jobCategories: [],
    tasks: []
  },
  settings: {
    dayShiftStart: '08:00',
    dayShiftEnd: '20:00',
    nightShiftStart: '20:00',
    nightShiftEnd: '08:00'
  },
  currentDate: new Date(),
  currentShift: 'day', // 'day' or 'night'
  
  // Initialize the application
  async init() {
    try {
      // Load all data
      await this.loadAllData();
      
      // Set current date to today's date
      const today = new Date();
      this.currentDate = today;
      
      // Determine current shift based on time
      const currentHour = today.getHours();
      const currentMinutes = today.getMinutes();
      const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
      
      if (this.isTimeBetween(currentTimeString, this.settings.dayShiftStart, this.settings.dayShiftEnd)) {
        this.currentShift = 'day';
      } else {
        this.currentShift = 'night';
      }
      
      // Load tasks from storage
      this.data.tasks = apiService.getTasks();
      
      // Initialize common elements on the page
      this.initCommonElements();
      
      return true;
    } catch (error) {
      console.error('Error initializing app:', error);
      return false;
    }
  },
  
  // Load all required data
  async loadAllData() {
    try {
      // Using our API service to fetch data
      const [staff, buildings, departments, jobTypes, jobCategories] = await Promise.all([
        apiService.fetchStaff(),
        apiService.fetchBuildings(),
        apiService.fetchDepartments(),
        apiService.fetchJobTypes(),
        apiService.fetchJobCategories()
      ]);
      
      this.data.staff = staff;
      this.data.buildings = buildings;
      this.data.departments = departments;
      this.data.jobTypes = jobTypes;
      this.data.jobCategories = jobCategories;
      
      return true;
    } catch (error) {
      console.error('Error loading data:', error);
      return false;
    }
  },
  
  // Initialize common page elements
  initCommonElements() {
    // Set up date inputs with current date if they exist
    const dateInputs = document.querySelectorAll('#current-date');
    if (dateInputs.length) {
      const formattedDate = this.formatDateForInput(this.currentDate);
      dateInputs.forEach(input => {
        input.value = formattedDate;
        input.addEventListener('change', (e) => {
          this.currentDate = new Date(e.target.value);
          this.saveState();
        });
      });
    }
    
    // Set up shift buttons if they exist
    const shiftButtons = document.querySelectorAll('.shift-btn');
    if (shiftButtons.length) {
      shiftButtons.forEach(btn => {
        if (btn.dataset.shift === this.currentShift) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
        
        btn.addEventListener('click', (e) => {
          shiftButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.currentShift = btn.dataset.shift;
          this.saveState();
        });
      });
    }
    
    // Set up date and shift displays if they exist
    this.updateShiftDisplays();
    
    // Set up navigation buttons if they exist
    this.setupNavigationButtons();
  },
  
  // Update date and shift display elements
  updateShiftDisplays() {
    const dateDisplays = document.querySelectorAll('#current-date-display');
    if (dateDisplays.length) {
      const formattedDate = this.formatDate(this.currentDate);
      dateDisplays.forEach(el => {
        el.textContent = `Date: ${formattedDate}`;
      });
    }
    
    const shiftDisplays = document.querySelectorAll('#current-shift-display');
    if (shiftDisplays.length) {
      const shiftText = this.currentShift === 'day' 
        ? `Day Shift (${this.settings.dayShiftStart} - ${this.settings.dayShiftEnd})` 
        : `Night Shift (${this.settings.nightShiftStart} - ${this.settings.nightShiftEnd})`;
      
      shiftDisplays.forEach(el => {
        el.textContent = `Shift: ${shiftText}`;
      });
    }
  },
  
  // Set up navigation buttons
  setupNavigationButtons() {
    // New task button
    const newTaskBtn = document.getElementById('new-task-btn');
    if (newTaskBtn) {
      newTaskBtn.addEventListener('click', () => {
        window.location.href = '/new-task';
      });
    }
    
    // Pending tasks button
    const pendingTasksBtn = document.getElementById('pending-tasks-btn');
    if (pendingTasksBtn) {
      pendingTasksBtn.addEventListener('click', () => {
        window.location.href = '/pending-tasks';
      });
    }
    
    // Completed tasks button
    const completedTasksBtn = document.getElementById('completed-tasks-btn');
    if (completedTasksBtn) {
      completedTasksBtn.addEventListener('click', () => {
        window.location.href = '/completed-tasks';
      });
    }
    
    // Shift complete button
    const shiftCompleteBtn = document.getElementById('shift-complete-btn');
    if (shiftCompleteBtn) {
      shiftCompleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to complete this shift? This will archive all current tasks.')) {
          this.completeShift();
          window.location.href = '/shift-report';
        }
      });
    }
  },
  
  // Format date for display (e.g., "March 26, 2025")
  formatDate(date) {
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },
  
  // Format date for input fields (YYYY-MM-DD)
  formatDateForInput(date) {
    return date.toISOString().split('T')[0];
  },
  
  // Format time for display (e.g., "14:30")
  formatTime(timeString) {
    return timeString;
  },
  
  // Check if a time is between two times
  isTimeBetween(time, startTime, endTime) {
    // For day shift, simple comparison works
    if (startTime < endTime) {
      return time >= startTime && time < endTime;
    } 
    // For night shift that crosses midnight
    else {
      return time >= startTime || time < endTime;
    }
  },
  
  // Save app state to localStorage
  saveState() {
    localStorage.setItem('porter_current_date', this.formatDateForInput(this.currentDate));
    localStorage.setItem('porter_current_shift', this.currentShift);
    localStorage.setItem('porter_tasks', JSON.stringify(this.data.tasks));
    
    // Update any displayed information
    this.updateShiftDisplays();
  },
  
  // Load app state from localStorage
  loadState() {
    const savedDate = localStorage.getItem('porter_current_date');
    if (savedDate) {
      this.currentDate = new Date(savedDate);
    }
    
    const savedShift = localStorage.getItem('porter_current_shift');
    if (savedShift) {
      this.currentShift = savedShift;
    }
    
    // Update UI based on loaded state
    this.updateShiftDisplays();
  },
  
  // Add a new task
  addTask(task) {
    // Add the date and shift information
    task.date = this.formatDateForInput(this.currentDate);
    task.shift = this.currentShift;
    
    // Use the API service to save
    const savedTask = apiService.saveTask(task);
    
    // Update our local cache
    this.data.tasks = apiService.getTasks();
    
    return savedTask;
  },
  
  // Update an existing task
  updateTask(taskId, updates) {
    // Use the API service to update
    const updatedTask = apiService.updateTask(taskId, updates);
    
    // Refresh our local cache
    this.data.tasks = apiService.getTasks();
    
    return updatedTask;
  },
  
  // Delete a task
  deleteTask(taskId) {
    // Use the API service to delete
    apiService.deleteTask(taskId);
    
    // Refresh our local cache
    this.data.tasks = apiService.getTasks();
    
    return true;
  },
  
  // Complete a shift and archive tasks
  completeShift() {
    // Create a new archived shift
    const newArchive = {
      date: this.formatDateForInput(this.currentDate),
      shift: this.currentShift,
      shiftStart: this.currentShift === 'day' ? this.settings.dayShiftStart : this.settings.nightShiftStart,
      shiftEnd: this.currentShift === 'day' ? this.settings.dayShiftEnd : this.settings.nightShiftEnd,
      tasks: [...this.data.tasks],
      archivedAt: new Date().toISOString()
    };
    
    // Use the API service to save the archive
    apiService.saveArchivedShift(newArchive);
    
    // Clear current tasks
    this.data.tasks.forEach(task => {
      apiService.deleteTask(task.id);
    });
    
    // Refresh our local cache
    this.data.tasks = [];
    
    return newArchive;
  },
  
  // Get tasks for the current shift and date
  getCurrentShiftTasks() {
    const currentDateStr = this.formatDateForInput(this.currentDate);
    return this.data.tasks.filter(task => 
      task.date === currentDateStr && task.shift === this.currentShift
    );
  },
  
  // Get pending tasks
  getPendingTasks() {
    return this.getCurrentShiftTasks().filter(task => 
      task.status === 'pending'
    );
  },
  
  // Get completed tasks
  getCompletedTasks() {
    return this.getCurrentShiftTasks().filter(task => 
      task.status === 'completed'
    );
  },
  
  // Utility functions to get data by ID
  getDepartmentName(id) {
    const department = this.data.departments.find(d => d.id === id);
    return department ? department.name : 'Unknown Department';
  },
  
  getJobTypeName(id) {
    const jobType = this.data.jobTypes.find(j => j.id === id);
    return jobType ? jobType.name : 'Unknown Type';
  },
  
  getJobCategoryName(id) {
    const category = this.data.jobCategories.find(c => c.id === id);
    return category ? category.name : 'Unknown Category';
  },
  
  getStaffName(id) {
    const staff = this.data.staff.find(s => s.id === id);
    return staff ? staff.name : 'Unassigned';
  },
  
  // Search staff by name (for predictive search)
  searchStaffByName(query) {
    if (!query || query.length < 2) return [];
    
    const lowerQuery = query.toLowerCase();
    return this.data.staff.filter(staff => 
      staff.name.toLowerCase().includes(lowerQuery)
    );
  }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  app.init().then(() => {
    app.loadState();
    
    // Check if there's a page-specific initialization function
    if (typeof initPage === 'function') {
      initPage();
    }
  });
});
