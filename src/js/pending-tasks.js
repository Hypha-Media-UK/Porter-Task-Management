/**
 * Pending Tasks Page Functionality
 */

function initPage() {
  // Get page elements
  const pendingTasksList = document.getElementById('pending-tasks-list');
  const refreshBtn = document.getElementById('refresh-btn');
  const taskEditModal = document.getElementById('task-edit-modal');
  const editTaskForm = document.getElementById('edit-task-form');
  const editTaskId = document.getElementById('edit-task-id');
  const editStaffMember = document.getElementById('edit-staff-member');
  const editStaffResults = document.getElementById('edit-staff-results');
  const editTimeCompleted = document.getElementById('edit-time-completed');
  const updatePendingBtn = document.getElementById('update-pending-btn');
  const updateCompleteBtn = document.getElementById('update-complete-btn');
  const closeModalButtons = document.querySelectorAll('.close-modal');
  
  // Initialize the page
  loadPendingTasks();
  populateEditDropdowns();
  setupEventListeners();
  setupStaffSearch();
  
  /**
   * Load and display pending tasks
   */
  function loadPendingTasks() {
    const pendingTasks = app.getPendingTasks();
    console.log('Pending tasks:', pendingTasks);
    
    // Clear existing content
    pendingTasksList.innerHTML = '';
    const emptyState = document.getElementById('empty-state');
    
    if (pendingTasks.length === 0) {
      // Show empty state, hide table
      emptyState.style.display = 'block';
      pendingTasksList.parentElement.style.display = 'none';
      return;
    }
    
    // Hide empty state, show table
    emptyState.style.display = 'none';
    pendingTasksList.parentElement.style.display = 'table';
    
    // Create and append task rows
    pendingTasks.forEach(task => {
      const taskRow = createTaskRow(task);
      pendingTasksList.appendChild(taskRow);
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
    const staffName = task.staffId ? app.getStaffName(task.staffId) : 'Unassigned';
    const transport = task.transportType || 'N/A';
    
    taskRow.innerHTML = `
      <td>${category} - ${itemType}</td>
      <td>${fromDepartment}</td>
      <td>${toDepartment}</td>
      <td>${transport}</td>
      <td>${task.timeReceived}</td>
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
        loadPendingTasks(); // Refresh the list
      }
    });
    
    return taskRow;
  }
  
  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Refresh button
    refreshBtn.addEventListener('click', loadPendingTasks);
    
    // Close modal buttons
    closeModalButtons.forEach(button => {
      button.addEventListener('click', () => {
        taskEditModal.style.display = 'none';
      });
    });
    
    // Click outside modal to close
    window.addEventListener('click', (event) => {
      if (event.target === taskEditModal) {
        taskEditModal.style.display = 'none';
      }
    });
    
    // Update as pending button
    updatePendingBtn.addEventListener('click', () => {
      updateTask(false);
    });
    
    // Mark as complete button
    updateCompleteBtn.addEventListener('click', () => {
      // Validate staff is assigned and time completed is set
      const staffId = editStaffMember.dataset.staffId;
      
      if (!staffId) {
        alert('Please select a staff member to mark the task as complete.');
        return;
      }
      
      if (!editTimeCompleted.value) {
        alert('Please enter a completion time to mark the task as complete.');
        return;
      }
      
      updateTask(true);
    });
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
   * Populate dropdown fields in edit form
   */
  function populateEditDropdowns() {
    // Get form elements
    const editJobCategory = document.getElementById('edit-job-category');
    const editFromDepartment = document.getElementById('edit-from-department');
    const editToDepartment = document.getElementById('edit-to-department');
    const editItemType = document.getElementById('edit-item-type');
    const editTransportOptions = document.querySelector('.edit-transport-options');
    const editTransportType = document.getElementById('edit-transport-type');
    
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
    const editItemType = document.getElementById('edit-item-type');
    
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
   * Open edit modal for a task
   */
  function openEditModal(task) {
    // Get form elements
    const editJobCategory = document.getElementById('edit-job-category');
    const editFromDepartment = document.getElementById('edit-from-department');
    const editToDepartment = document.getElementById('edit-to-department');
    const editItemType = document.getElementById('edit-item-type');
    const editTransportOptions = document.querySelector('.edit-transport-options');
    const editTransportType = document.getElementById('edit-transport-type');
    const editTimeReceived = document.getElementById('edit-time-received');
    
    // Set current task ID
    editTaskId.value = task.id;
    
    // Populate form with current values
    editJobCategory.value = task.jobCategoryId;
    updateItemTypes(task.jobCategoryId);
    
    editFromDepartment.value = task.fromDepartmentId;
    editToDepartment.value = task.toDepartmentId;
    editTimeReceived.value = task.timeReceived;
    
    // We need to set the item type after the options have been populated
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
    
    // Set current staff if assigned
    if (task.staffId) {
      const staff = app.data.staff.find(s => s.id === task.staffId);
      if (staff) {
        editStaffMember.value = staff.name;
        editStaffMember.dataset.staffId = staff.id;
      } else {
        editStaffMember.value = '';
        delete editStaffMember.dataset.staffId;
      }
    } else {
      editStaffMember.value = '';
      delete editStaffMember.dataset.staffId;
    }
    
    // Set completion time if available
    editTimeCompleted.value = task.timeCompleted || '';
    
    // Show modal
    taskEditModal.style.display = 'block';
  }
  
  /**
   * Update a task based on edit form
   */
  function updateTask(isComplete) {
    // Get form elements
    const editJobCategory = document.getElementById('edit-job-category');
    const editFromDepartment = document.getElementById('edit-from-department');
    const editToDepartment = document.getElementById('edit-to-department');
    const editItemType = document.getElementById('edit-item-type');
    const editTransportType = document.getElementById('edit-transport-type');
    const editTimeReceived = document.getElementById('edit-time-received');
    
    // Validate required fields
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
    
    if (!editTimeReceived.value) {
      alert('Please enter the time received.');
      return;
    }
    
    if (isComplete) {
      // Validate staff and time completed if marking as complete
      const staffId = editStaffMember.dataset.staffId;
      
      if (!staffId) {
        alert('Please select a staff member to mark the task as complete.');
        return;
      }
      
      if (!editTimeCompleted.value) {
        alert('Please enter a completion time to mark the task as complete.');
        return;
      }
    }
    
    const taskId = parseInt(editTaskId.value);
    const staffId = editStaffMember.dataset.staffId ? parseInt(editStaffMember.dataset.staffId) : null;
    
    // Get the current time formatted as HH:MM
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Use the provided completion time or current time if marking as complete
    const timeCompleted = isComplete ? (editTimeCompleted.value || currentTime) : null;
    
    // Get form values
    const jobCategoryId = parseInt(editJobCategory.value);
    const fromDepartmentId = parseInt(editFromDepartment.value);
    const toDepartmentId = parseInt(editToDepartment.value);
    const itemTypeId = parseInt(editItemType.value);
    const transportType = editTransportType.value || null;
    const timeReceived = editTimeReceived.value;
    
    // Create updates object
    const updates = {
      jobCategoryId,
      fromDepartmentId,
      toDepartmentId,
      itemTypeId,
      transportType,
      timeReceived,
      staffId,
      timeAllocated: staffId ? (app.data.tasks.find(t => t.id === taskId)?.timeAllocated || currentTime) : null,
      timeCompleted,
      status: isComplete ? 'completed' : 'pending'
    };
    
    // Update task in app state
    app.updateTask(taskId, updates);
    
    // Close modal
    taskEditModal.style.display = 'none';
    
    // Refresh task list
    loadPendingTasks();
  }
}
