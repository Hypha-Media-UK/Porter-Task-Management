/**
 * Utility functions for Porter Task Management
 * 
 * This module contains shared functionality used across different pages
 * to reduce code duplication and make the transition to Craft CMS easier.
 */

const utils = {
  /**
   * Format a date to display format (e.g., "March 26, 2025")
   */
  formatDate(date) {
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },
  
  /**
   * Format date for input fields (YYYY-MM-DD)
   */
  formatDateForInput(date) {
    return date.toISOString().split('T')[0];
  },
  
  /**
   * Get the current time formatted as HH:MM
   */
  getCurrentTimeString() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  },
  
  /**
   * Populate a dropdown with options
   * @param {HTMLSelectElement} selectElement - The select element to populate
   * @param {Array} items - Array of items to add as options
   * @param {string} valueProperty - The property name to use for option value
   * @param {string} textProperty - The property name to use for option text
   * @param {boolean} includeEmptyOption - Whether to include an empty option
   */
  populateDropdown(selectElement, items, valueProperty, textProperty, includeEmptyOption = true) {
    // Clear existing options
    while (selectElement.options.length > (includeEmptyOption ? 1 : 0)) {
      selectElement.remove(includeEmptyOption ? 1 : 0);
    }
    
    // Add options for each item
    items.forEach(item => {
      const option = document.createElement('option');
      option.value = item[valueProperty];
      option.textContent = item[textProperty];
      selectElement.appendChild(option);
    });
  },
  
  /**
   * Set up a staff search field with predictive search
   * @param {HTMLInputElement} inputElement - The input field for staff search
   * @param {HTMLElement} resultsContainer - The container for displaying search results
   * @param {Function} onSelect - Callback when a staff member is selected
   */
  setupStaffSearch(inputElement, resultsContainer, onSelect) {
    inputElement.addEventListener('input', () => {
      const query = inputElement.value.trim();
      
      if (query.length < 2) {
        resultsContainer.style.display = 'none';
        return;
      }
      
      const results = app.searchStaffByName(query);
      
      if (results.length === 0) {
        resultsContainer.style.display = 'none';
        return;
      }
      
      // Clear previous results
      resultsContainer.innerHTML = '';
      
      // Add new results
      results.forEach(staff => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('search-result-item');
        resultItem.textContent = staff.name;
        resultItem.addEventListener('click', () => {
          inputElement.value = staff.name;
          inputElement.dataset.staffId = staff.id;
          resultsContainer.style.display = 'none';
          
          if (onSelect && typeof onSelect === 'function') {
            onSelect(staff);
          }
        });
        
        resultsContainer.appendChild(resultItem);
      });
      
      resultsContainer.style.display = 'block';
    });
    
    // Hide results when clicking outside
    document.addEventListener('click', (event) => {
      if (!inputElement.contains(event.target) && !resultsContainer.contains(event.target)) {
        resultsContainer.style.display = 'none';
      }
    });
  },
  
  /**
   * Set up job category and item type dropdowns with conditional logic
   * @param {HTMLSelectElement} categorySelect - The job category select element
   * @param {HTMLSelectElement} itemTypeSelect - The item type select element
   * @param {HTMLElement} transportOptions - The container for transport options
   * @param {HTMLSelectElement} transportSelect - The transport type select element
   */
  setupCategoryItemTypeRelationship(categorySelect, itemTypeSelect, transportOptions, transportSelect) {
    // Add event listener for job category change
    categorySelect.addEventListener('change', () => {
      const categoryId = parseInt(categorySelect.value);
      if (!categoryId) return;
      
      // Find the selected category
      const category = app.data.jobCategories.find(c => c.id === categoryId);
      
      if (category && category.allowedTypes && category.allowedTypes.length > 0) {
        // Get allowed job types for this category
        const allowedTypes = app.data.jobTypes.filter(type => 
          category.allowedTypes.includes(type.id)
        );
        
        // Populate dropdown
        utils.populateDropdown(itemTypeSelect, allowedTypes, 'id', 'name');
      }
    });
    
    // Add event listener for item type change
    itemTypeSelect.addEventListener('change', () => {
      const itemTypeId = parseInt(itemTypeSelect.value);
      if (!itemTypeId) return;
      
      const jobType = app.data.jobTypes.find(t => t.id === itemTypeId);
      
      // If it's a patient transfer, show transport options
      if (jobType && jobType.name === 'Patient Transfer' && jobType.transportOptions) {
        transportOptions.style.display = 'block';
        
        // Clear existing options
        while (transportSelect.options.length > 1) {
          transportSelect.remove(1);
        }
        
        // Add transport options
        jobType.transportOptions.forEach(option => {
          const transportOption = document.createElement('option');
          transportOption.value = option;
          transportOption.textContent = option;
          transportSelect.appendChild(transportOption);
        });
      } else {
        transportOptions.style.display = 'none';
      }
    });
  },
  
  /**
   * Update a time input to show the current time and update automatically
   * @param {HTMLInputElement} timeInput - The time input element to update
   * @param {number} updateInterval - Update interval in milliseconds (optional)
   */
  setupCurrentTimeInput(timeInput, updateInterval = 60000) {
    // Set initial time
    const updateTime = () => {
      timeInput.value = utils.getCurrentTimeString();
    };
    
    updateTime();
    
    // Update every minute
    if (updateInterval > 0) {
      setInterval(updateTime, updateInterval);
    }
    
    return updateTime;
  },
  
  /**
   * Convert a modal to use a tabular layout
   * @param {HTMLElement} modalContent - The modal content container
   * @param {Object} task - The task object with data to display
   */
  populateTaskDetailsTable(container, task) {
    const fromDepartment = app.getDepartmentName(task.fromDepartmentId);
    const toDepartment = app.getDepartmentName(task.toDepartmentId);
    const itemType = app.getJobTypeName(task.itemTypeId);
    const category = app.getJobCategoryName(task.jobCategoryId);
    const staffName = task.staffId ? app.getStaffName(task.staffId) : 'Unassigned';
    
    container.innerHTML = `
      <table class="details-table">
        <tr>
          <th>Task Type:</th>
          <td>${category} - ${itemType}</td>
        </tr>
        <tr>
          <th>From Department:</th>
          <td>${fromDepartment}</td>
        </tr>
        <tr>
          <th>To Department:</th>
          <td>${toDepartment}</td>
        </tr>
        ${task.transportType ? `
        <tr>
          <th>Transport Type:</th>
          <td>${task.transportType}</td>
        </tr>` : ''}
        <tr>
          <th>Staff Member:</th>
          <td>${staffName}</td>
        </tr>
        <tr>
          <th>Time Received:</th>
          <td>${task.timeReceived}</td>
        </tr>
        <tr>
          <th>Time Allocated:</th>
          <td>${task.timeAllocated || 'N/A'}</td>
        </tr>
        <tr>
          <th>Time Completed:</th>
          <td>${task.timeCompleted || 'N/A'}</td>
        </tr>
      </table>
    `;
  }
};
