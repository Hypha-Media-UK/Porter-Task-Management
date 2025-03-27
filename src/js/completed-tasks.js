/**
 * Completed Tasks Page Functionality
 */

function initPage() {
  // Get page elements
  const completedTasksList = document.getElementById('completed-tasks-list');
  const refreshBtn = document.getElementById('refresh-btn');
  const printBtn = document.getElementById('print-btn');
  
  // Task details modal elements
  const taskDetailsModal = document.getElementById('task-details-modal');
  const taskDetailsContent = document.getElementById('task-details-content');
  const editTaskBtn = document.getElementById('edit-task-btn');
  
  // Task edit modal elements
  const taskEditModal = document.getElementById('task-edit-modal');
  const editTaskForm = document.getElementById('edit-task-form');
  const editTaskId = document.getElementById('edit-task-id');
  const editJobCategory = document.getElementById('edit-job-category');
  const editFromDepartment = document.getElementById('edit-from-department');
  const editToDepartment = document.getElementById('edit-to-department');
  const editItemType = document.getElementById('edit-item-type');
  const editTransportOptions = document.querySelector('.edit-transport-options');
  const editTransportType = document.getElementById('edit-transport-type');
  const editStaffMember = document.getElementById('edit-staff-member');
  const editStaffResults = document.getElementById('edit-staff-results');
  const editTimeReceived = document.getElementById('edit-time-received');
  const editTimeCompleted = document.getElementById('edit-time-completed');
  const updateTaskBtn = document.getElementById('update-task-btn');
  const closeModalButtons = document.querySelectorAll('.close-modal');
  
  // Initialize the page
  loadCompletedTasks();
  populateEditDropdowns();
  setupEventListeners();
  setupStaffSearch();
  
  /**
   * Load and display completed tasks
   */
  function loadCompletedTasks() {
    const completedTasks = app.getCompletedTasks();
    console.log('Completed tasks:', completedTasks);
    
    // Clear existing content
    completedTasksList.innerHTML = '';
    const emptyState = document.getElementById('empty-state');
    
    if (completedTasks.length === 0) {
      // Show empty state, hide table
      emptyState.style.display = 'block';
      completedTasksList.parentElement.style.display = 'none';
      return;
    }
    
    // Hide empty state, show table
    emptyState.style.display = 'none';
    completedTasksList.parentElement.style.display = 'table';
    
    // Create and append task rows
    completedTasks.forEach(task => {
      const taskRow = createTaskRow(task);
      completedTasksList.appendChild(taskRow);
    });
  }
  
  /**
   * Create a task table row
   */
  function createTaskRow(task) {
    const taskRow = document.createElement('tr');
    taskRow.dataset.taskId = task.id;
    
    const fromDepartment = app.getDepartmentName(task.fromDepartmentId);
    const toDepartment = app.getDepartmentName(task.toDepartmentId);
    const itemType = app.getJobTypeName(task.itemTypeId);
    const category = app.getJobCategoryName(task.jobCategoryId);
    const staffName = app.getStaffName(task.staffId);
    const transport = task.transportType || 'N/A';
    
    taskRow.innerHTML = `
      <td>${category} - ${itemType}</td>
      <td>${fromDepartment}</td>
      <td>${toDepartment}</td>
      <td>${transport}</td>
      <td>${task.timeReceived}</td>
      <td>${task.timeCompleted}</td>
      <td>${staffName}</td>
      <td class="action-cell">
        <button class="table-action-btn edit" title="Edit Task">Edit</button>
        <button class="table-action-btn delete" title="Delete Task">Delete</button>
      </td>
    `;
    
    // Add edit button functionality
    const editBtn = taskRow.querySelector('.edit');
    editBtn.addEventListener('click', () => {
      openEditModal(task);
    });
    
    // Add delete button functionality
    const deleteBtn = taskRow.querySelector('.delete');
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete this task?`)) {
        app.deleteTask(task.id);
        loadCompletedTasks(); // Refresh the list
      }
    });
    
    return taskRow;
  }
  
  /**
   * Populate dropdown fields in edit form
   */
  function populateEditDropdowns() {
    // Populate job categories
    app.data.jobCategories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      editJobCategory.appendChild(option);
    });
    
    // Populate departments for both from and to selectors
    app.data.departments.forEach(department => {
      // From department
      const fromOption = document.createElement('option');
      fromOption.value = department.id;
      fromOption.textContent = department.name;
      editFromDepartment.appendChild(fromOption);
      
      // To department
      const toOption = document.createElement('option');
      toOption.value = department.id;
      toOption.textContent = department.name;
      editToDepartment.appendChild(toOption);
    });
    
    // Add event listener for job category change
    editJobCategory.addEventListener('change', () => {
      const categoryId = parseInt(editJobCategory.value);
      updateItemTypes(categoryId);
    });
    
    // Add event listener for item type change
    editItemType.addEventListener('change', () => {
      const itemTypeId = parseInt(editItemType.value);
      const jobType = app.data.jobTypes.find(t => t.id === itemTypeId);
      
      // If it's a patient transfer, show transport options
      if (jobType && jobType.name === 'Patient Transfer' && jobType.transportOptions) {
        editTransportOptions.style.display = 'block';
        
        // Clear existing options
        while (editTransportType.options.length > 1) {
          editTransportType.remove(1);
        }
        
        // Add transport options
        jobType.transportOptions.forEach(option => {
          const transportOption = document.createElement('option');
          transportOption.value = option;
          transportOption.textContent = option;
          editTransportType.appendChild(transportOption);
        });
      } else {
        editTransportOptions.style.display = 'none';
      }
    });
  }
  
  /**
   * Update item types dropdown based on selected job category
   */
  function updateItemTypes(categoryId) {
    // Clear existing options
    while (editItemType.options.length > 1) {
      editItemType.remove(1);
    }
    
    // Find the selected category
    const category = app.data.jobCategories.find(c => c.id === categoryId);
    
    if (category && category.allowedTypes && category.allowedTypes.length > 0) {
      // Get allowed job types for this category
      const allowedTypes = app.data.jobTypes.filter(type => 
        category.allowedTypes.includes(type.id)
      );
      
      // Add options for each allowed type
      allowedTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.name;
        editItemType.appendChild(option);
      });
    }
  }
  
  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Refresh button
    refreshBtn.addEventListener('click', loadCompletedTasks);
    
    // Print button
    printBtn.addEventListener('click', () => {
      window.location.href = 'shift-report.html';
    });
    
    // Close modal buttons
    closeModalButtons.forEach(button => {
      button.addEventListener('click', () => {
        taskDetailsModal.style.display = 'none';
        taskEditModal.style.display = 'none';
      });
    });
    
    // Click outside modal to close
    window.addEventListener('click', (event) => {
      if (event.target === taskDetailsModal) {
        taskDetailsModal.style.display = 'none';
      }
      if (event.target === taskEditModal) {
        taskEditModal.style.display = 'none';
      }
    });
    
    // Edit task button in details modal
    editTaskBtn.addEventListener('click', () => {
      const taskId = parseInt(taskDetailsModal.dataset.taskId);
      const task = app.data.tasks.find(t => t.id === taskId);
      
      if (task) {
        openEditModal(task);
        taskDetailsModal.style.display = 'none';
      }
    });
    
    // Update task button in edit modal
    updateTaskBtn.addEventListener('click', updateTask);
  }
  
  /**
   * Set up staff search functionality for the edit form
   */
  function setupStaffSearch() {
    editStaffMember.addEventListener('input', () => {
      const query = editStaffMember.value.trim();
      
      if (query.length < 2) {
        editStaffResults.style.display = 'none';
        return;
      }
      
      const results = app.searchStaffByName(query);
      
      if (results.length === 0) {
        editStaffResults.style.display = 'none';
        return;
      }
      
      // Clear previous results
      editStaffResults.innerHTML = '';
      
      // Add new results
      results.forEach(staff => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('search-result-item');
        resultItem.textContent = staff.name;
        resultItem.addEventListener('click', () => {
          editStaffMember.value = staff.name;
          editStaffMember.dataset.staffId = staff.id;
          editStaffResults.style.display = 'none';
        });
        
        editStaffResults.appendChild(resultItem);
      });
      
      editStaffResults.style.display = 'block';
    });
    
    // Hide results when clicking outside
    document.addEventListener('click', (event) => {
      if (!editStaffMember.contains(event.target) && !editStaffResults.contains(event.target)) {
        editStaffResults.style.display = 'none';
      }
    });
  }
  
  /**
   * Open details modal for a task
   */
  function openDetailsModal(task) {
    // Store task ID in modal
    taskDetailsModal.dataset.taskId = task.id;
    
    const fromDepartment = app.getDepartmentName(task.fromDepartmentId);
    const toDepartment = app.getDepartmentName(task.toDepartmentId);
    const itemType = app.getJobTypeName(task.itemTypeId);
    const category = app.getJobCategoryName(task.jobCategoryId);
    const staffName = app.getStaffName(task.staffId);
    
    // Generate details HTML
    taskDetailsContent.innerHTML = `
      <div class="detail-item">
        <strong>Task Type:</strong> ${category} - ${itemType}
      </div>
      <div class="detail-item">
        <strong>From Department:</strong> ${fromDepartment}
      </div>
      <div class="detail-item">
        <strong>To Department:</strong> ${toDepartment}
      </div>
      ${task.transportType ? `
      <div class="detail-item">
        <strong>Transport Type:</strong> ${task.transportType}
      </div>` : ''}
      <div class="detail-item">
        <strong>Staff Member:</strong> ${staffName}
      </div>
      <div class="detail-item">
        <strong>Time Received:</strong> ${task.timeReceived}
      </div>
      <div class="detail-item">
        <strong>Time Allocated:</strong> ${task.timeAllocated || 'N/A'}
      </div>
      <div class="detail-item">
        <strong>Time Completed:</strong> ${task.timeCompleted}
      </div>
    `;
    
    // Show modal
    taskDetailsModal.style.display = 'block';
  }
  
  /**
   * Open edit modal for a task
   */
  function openEditModal(task) {
    // Set current task ID
    editTaskId.value = task.id;
    
    // Populate form with current values
    editJobCategory.value = task.jobCategoryId;
    updateItemTypes(task.jobCategoryId);
    
    editFromDepartment.value = task.fromDepartmentId;
    editToDepartment.value = task.toDepartmentId;
    
    setTimeout(() => {
      editItemType.value = task.itemTypeId;
      
      // Show transport options if applicable
      const jobType = app.data.jobTypes.find(t => t.id === task.itemTypeId);
      if (jobType && jobType.name === 'Patient Transfer' && jobType.transportOptions) {
        editTransportOptions.style.display = 'block';
        
        // Clear existing options
        while (editTransportType.options.length > 1) {
          editTransportType.remove(1);
        }
        
        // Add transport options
        jobType.transportOptions.forEach(option => {
          const transportOption = document.createElement('option');
          transportOption.value = option;
          transportOption.textContent = option;
          editTransportType.appendChild(transportOption);
        });
        
        editTransportType.value = task.transportType || '';
      } else {
        editTransportOptions.style.display = 'none';
      }
    }, 0);
    
    // Set staff
    const staff = app.data.staff.find(s => s.id === task.staffId);
    if (staff) {
      editStaffMember.value = staff.name;
      editStaffMember.dataset.staffId = staff.id;
    } else {
      editStaffMember.value = '';
      delete editStaffMember.dataset.staffId;
    }
    
    // Set times
    editTimeReceived.value = task.timeReceived;
    editTimeCompleted.value = task.timeCompleted;
    
    // Show modal
    taskEditModal.style.display = 'block';
  }
  
  /**
   * Update a task based on edit form
   */
  function updateTask() {
    // Validate form
    if (!editJobCategory.value) {
      alert('Please select a job category.');
      return;
    }
    
    if (!editFromDepartment.value) {
      alert('Please select a from department.');
      return;
    }
    
    if (!editToDepartment.value) {
      alert('Please select a to department.');
      return;
    }
    
    if (!editItemType.value) {
      alert('Please select an item type.');
      return;
    }
    
    // Check if patient transfer and transport type is required
    const itemTypeIdForValidation = parseInt(editItemType.value);
    const jobType = app.data.jobTypes.find(t => t.id === itemTypeIdForValidation);
    
    if (jobType && jobType.name === 'Patient Transfer' && 
        editTransportOptions.style.display !== 'none' && 
        !editTransportType.value) {
      alert('Please select a transport type for patient transfer.');
      return;
    }
    
    if (!editStaffMember.dataset.staffId) {
      alert('Please select a staff member.');
      return;
    }
    
    if (!editTimeReceived.value) {
      alert('Please enter the time received.');
      return;
    }
    
    if (!editTimeCompleted.value) {
      alert('Please enter the completion time.');
      return;
    }
    
    // Get task ID and form values
    const taskId = parseInt(editTaskId.value);
    const jobCategoryId = parseInt(editJobCategory.value);
    const fromDepartmentId = parseInt(editFromDepartment.value);
    const toDepartmentId = parseInt(editToDepartment.value);
    const itemTypeIdForUpdate = parseInt(editItemType.value);
    const transportType = editTransportType.value || null;
    const staffId = parseInt(editStaffMember.dataset.staffId);
    const timeReceived = editTimeReceived.value;
    const timeCompleted = editTimeCompleted.value;
    
    // Create updates object
    const updates = {
      jobCategoryId,
      fromDepartmentId,
      toDepartmentId,
      itemTypeId: itemTypeIdForUpdate,
      transportType,
      staffId,
      timeReceived,
      timeCompleted
    };
    
    // Update task in app state
    app.updateTask(taskId, updates);
    
    // Close modal
    taskEditModal.style.display = 'none';
    
    // Refresh task list
    loadCompletedTasks();
  }
}
