// Porter Task Management App

document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // Initialize the current time for time fields
    updateCurrentTime();
    
    // Set up event listeners
    setupFormListeners();
    setupTaskListeners();
    
    // Handle form filtering logic
    setupFormFilterLogic();
}

/**
 * Updates the current time in the time-received field
 */
function updateCurrentTime() {
    const timeReceivedInput = document.getElementById('time-received');
    
    if (timeReceivedInput) {
        const updateTime = () => {
            const now = new Date();
            let hours = now.getHours().toString().padStart(2, '0');
            let minutes = now.getMinutes().toString().padStart(2, '0');
            timeReceivedInput.value = `${hours}:${minutes}`;
        };
        
        // Initial update
        updateTime();
        
        // Update every minute
        setInterval(updateTime, 60000);
    }
}

/**
 * Sets up all form event listeners
 */
function setupFormListeners() {
    const taskForm = document.getElementById('task-form');
    const jobCategorySelect = document.getElementById('job-category');
    const pendingButton = document.getElementById('pending-button');
    const completedButton = document.getElementById('completed-button');
    
    if (taskForm) {
        // We won't prevent default form submission since we want Craft to handle it
        // But we can still add custom validation if needed
    }
    
    if (pendingButton) {
        pendingButton.addEventListener('click', function(e) {
            // We're using direct form submission with the status-field now
            // The button behavior is handled in each template
        });
    }
    
    if (completedButton) {
        completedButton.addEventListener('click', function(e) {
            // We're using direct form submission with the status-field now
            // The button behavior is handled in each template
        });
    }
    
    // Handle showing/hiding transport type vs item type based on job category
    if (jobCategorySelect) {
        jobCategorySelect.addEventListener('change', function() {
            toggleTransportItemFields(this);
        });
        
        // Call once on page load if a value is already selected
        if (jobCategorySelect.value) {
            toggleTransportItemFields(jobCategorySelect);
        }
    }
}

/**
 * Toggles between Transport Type and Item Type fields based on Job Category
 * Also handles default department selection based on category
 * Uses data attributes for more template-driven approach
 */
function toggleTransportItemFields(jobCategorySelect) {
    const selectedCategoryText = jobCategorySelect.options[jobCategorySelect.selectedIndex]?.text?.toLowerCase() || '';
    const itemTypeRow = document.getElementById('item-type-row');
    const transportTypeRow = document.getElementById('transport-type-row');
    const itemTypeSelect = document.getElementById('item-type');
    const transportTypeSelect = document.getElementById('transport-type');
    const toDepartmentSelect = document.getElementById('to-department');
    const fromDepartmentSelect = document.getElementById('from-department');
    
    // Always set "To Department" to Pathology when "Samples" category is selected
    if (selectedCategoryText === 'samples' && toDepartmentSelect) {
        // For Samples, set "To Department" to Pathology
        Array.from(toDepartmentSelect.options).forEach(option => {
            if (option.text.toLowerCase() === 'pathology') {
                toDepartmentSelect.value = option.value;
            }
        });
    }
    
    // Only set defaults for Transfusion category for From Department
    if (selectedCategoryText === 'transfusion' && fromDepartmentSelect) {
        // For Transfusion category, set "From Department" to Pathology
        Array.from(fromDepartmentSelect.options).forEach(option => {
            if (option.text.toLowerCase() === 'pathology') {
                fromDepartmentSelect.value = option.value;
            }
        });
    }
    
    // Toggle fields based on category
    if (selectedCategoryText.includes('patient')) {
        // For Patient Transfer, show Transport Type and hide Item Type
        if (itemTypeRow) itemTypeRow.style.display = 'none';
        if (transportTypeRow) transportTypeRow.style.display = '';
        
        // Make transport type required and item type not required
        if (itemTypeSelect) itemTypeSelect.required = false;
        if (transportTypeSelect) transportTypeSelect.required = true;
    } else {
        // For other categories, show Item Type and hide Transport Type
        if (itemTypeRow) itemTypeRow.style.display = '';
        if (transportTypeRow) transportTypeRow.style.display = 'none';
        
        // Make item type required and transport type not required
        if (itemTypeSelect) itemTypeSelect.required = true;
        if (transportTypeSelect) transportTypeSelect.required = false;
    }
}

/**
 * Sets up task list item event listeners
 */
function setupTaskListeners() {
    const taskItems = document.querySelectorAll('.task-item');
    
    taskItems.forEach(item => {
        item.addEventListener('click', function() {
            const taskId = this.getAttribute('data-task-id');
            if (taskId) {
                // The URL format is now handled in the template
            }
        });
    });
}

/**
 * Sets up the filtering logic for the form fields
 * - Job category filters the available item types
 */
function setupFormFilterLogic() {
    const jobCategorySelect = document.getElementById('job-category');
    const itemTypeSelect = document.getElementById('item-type');
    
    if (jobCategorySelect && itemTypeSelect) {
        // Clear default option selections and make them based on category
        const optgroups = itemTypeSelect.querySelectorAll('optgroup');
        
        // Define category mappings
        const categoryMapping = {
            'patient transfer': 'transfer-type',
            'samples': 'samples',
            'sample transfer': 'samples',
            'asset movement': 'assets',
            'transfusion': 'transfusion',
            'gases': 'gases',
            'general items': 'ad-hoc',
            'ad-hoc': 'ad-hoc'
        };
        
        // Initial filtering based on default selection
        if (jobCategorySelect.value) {
            filterItemTypesByCategory(jobCategorySelect, itemTypeSelect, optgroups);
        }
        
        // Set up change handler
        jobCategorySelect.addEventListener('change', function() {
            // First toggle transport vs item fields
            toggleTransportItemFields(this);
            
            // Then filter the item types if showing
            if (document.getElementById('item-type-row').style.display !== 'none') {
                filterItemTypesByCategory(this, itemTypeSelect, optgroups);
            }
        });
        
        // Trigger the change handler if there's a default value
        if (jobCategorySelect.value) {
            jobCategorySelect.dispatchEvent(new Event('change'));
        }
    }
}

/**
 * Filters the item types dropdown based on the selected job category
 * Uses the fd_jobCategory relationship field data from CMS
 */
function filterItemTypesByCategory(jobCategorySelect, itemTypeSelect) {
    const selectedCategoryId = jobCategorySelect.value;
    if (!selectedCategoryId) {
        // If nothing selected, no filtering
        return;
    }
    
    // Get the selected category text for logging
    const selectedCategoryText = jobCategorySelect.options[jobCategorySelect.selectedIndex].text;
    
    console.log(`Selected category: "${selectedCategoryText}" (ID: ${selectedCategoryId})`);
    
    // Get all options (except the first placeholder)
    const options = Array.from(itemTypeSelect.querySelectorAll('option:not(:first-child)'));
    
    // First hide all options
    options.forEach(option => {
        option.style.display = 'none';
    });
    
    // Then show only the relevant ones based on category ID
    options.forEach(option => {
        // Use data-category-ids for direct job category relationship
        const categoryIds = option.getAttribute('data-category-ids');
        
        if (categoryIds && categoryIds.split(',').includes(selectedCategoryId)) {
            option.style.display = '';
            console.log(`Showing item: ${option.textContent.trim()}`);
        }
    });
    
    // Reset selection if current selection is now hidden
    if (itemTypeSelect.selectedIndex > 0 && 
        itemTypeSelect.options[itemTypeSelect.selectedIndex].style.display === 'none') {
        itemTypeSelect.value = '';
    }
}
