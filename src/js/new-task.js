/**
 * New Task Page Functionality
 */

function initPage() {
  // Get form elements
  const timeReceivedInput = document.getElementById('time-received');
  const jobCategorySelect = document.getElementById('job-category');
  const fromDepartmentSelect = document.getElementById('from-department');
  const toDepartmentSelect = document.getElementById('to-department');
  const itemTypeSelect = document.getElementById('item-type');
  const transportTypeDiv = document.querySelector('.transport-options');
  const transportTypeSelect = document.getElementById('transport-type');
  const staffMemberInput = document.getElementById('staff-member');
  const staffResultsDiv = document.getElementById('staff-results');
  const timeCompletedInput = document.getElementById('time-completed');
  const pendingBtn = document.getElementById('pending-btn');
  const completeBtn = document.getElementById('complete-btn');
  
  // Initialize form elements
  utils.setupCurrentTimeInput(timeReceivedInput);
  populateDropdowns();
  setupFormRelationships();
  setupEventListeners();
  
  /**
   * Populate all dropdowns with data
   */
  function populateDropdowns() {
    // Populate job categories
    utils.populateDropdown(jobCategorySelect, app.data.jobCategories, 'id', 'name');
    
    // Populate departments for both from and to selectors
    utils.populateDropdown(fromDepartmentSelect, app.data.departments, 'id', 'name');
    utils.populateDropdown(toDepartmentSelect, app.data.departments, 'id', 'name');
  }
  
  /**
   * Set up form relationships between fields
   */
  function setupFormRelationships() {
    // Set up relationship between job category, item type, and transport options
    utils.setupCategoryItemTypeRelationship(
      jobCategorySelect, 
      itemTypeSelect, 
      transportTypeDiv, 
      transportTypeSelect
    );
    
    // Set up staff search with predictive search
    utils.setupStaffSearch(
      staffMemberInput, 
      staffResultsDiv
    );
  }
  
  /**
   * Set up event listeners for form actions
   */
  function setupEventListeners() {
    
    // Save as pending button
    pendingBtn.addEventListener('click', () => {
      if (validateRequiredFields()) {
        saveTask(false);
        window.location.href = 'index.html';
      }
    });
    
    // Mark as complete button
    completeBtn.addEventListener('click', () => {
      if (validateRequiredFields()) {
        // If completing, validate staff
        const staffId = staffMemberInput.dataset.staffId;
        if (!staffId) {
          alert('Please select a staff member to mark the task as complete.');
          return;
        }
        
        // Set completion time to current time if not provided
        if (!timeCompletedInput.value) {
          timeCompletedInput.value = utils.getCurrentTimeString();
        }
        
        saveTask(true);
        window.location.href = 'index.html';
      }
    });
  }
  
  /**
   * Validate required form fields
   */
  function validateRequiredFields() {
    if (!timeReceivedInput.value) {
      alert('Please enter the time the job was received.');
      return false;
    }
    
    if (!jobCategorySelect.value) {
      alert('Please select a job category.');
      return false;
    }
    
    if (!fromDepartmentSelect.value) {
      alert('Please select a from department.');
      return false;
    }
    
    if (!toDepartmentSelect.value) {
      alert('Please select a to department.');
      return false;
    }
    
    if (!itemTypeSelect.value) {
      alert('Please select an item type.');
      return false;
    }
    
    // Check if patient transfer and transport type is required
    const itemTypeId = parseInt(itemTypeSelect.value);
    const jobType = app.data.jobTypes.find(t => t.id === itemTypeId);
    
    if (jobType && jobType.name === 'Patient Transfer' && 
        transportTypeDiv.style.display !== 'none' && 
        !transportTypeSelect.value) {
      alert('Please select a transport type for patient transfer.');
      return false;
    }
    
    return true;
  }
  
  /**
   * Save task data to app state
   */
  function saveTask(isComplete) {
    // Get form values
    const timeReceived = timeReceivedInput.value;
    const jobCategoryId = parseInt(jobCategorySelect.value);
    const fromDepartmentId = parseInt(fromDepartmentSelect.value);
    const toDepartmentId = parseInt(toDepartmentSelect.value);
    const itemTypeId = parseInt(itemTypeSelect.value);
    const transportType = transportTypeSelect.value || null;
    const staffId = staffMemberInput.dataset.staffId ? parseInt(staffMemberInput.dataset.staffId) : null;
    
    // Get current time
    const currentTime = utils.getCurrentTimeString();
    
    // Use the provided completion time or current time if marking as complete
    const timeCompleted = isComplete ? timeCompletedInput.value || currentTime : null;
    
    // Create task object
    const task = {
      timeReceived,
      jobCategoryId,
      fromDepartmentId,
      toDepartmentId,
      itemTypeId,
      transportType,
      staffId,
      timeAllocated: staffId ? currentTime : null,
      timeCompleted,
      status: isComplete ? 'completed' : 'pending'
    };
    
    // Add to app state
    app.addTask(task);
  }
}
