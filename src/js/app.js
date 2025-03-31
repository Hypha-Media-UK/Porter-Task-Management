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
 */
function toggleTransportItemFields(jobCategorySelect) {
    const selectedCategoryText = jobCategorySelect.options[jobCategorySelect.selectedIndex]?.text?.toLowerCase() || '';
    const itemTypeRow = document.getElementById('item-type-row');
    const transportTypeRow = document.getElementById('transport-type-row');
    const itemTypeSelect = document.getElementById('item-type');
    const transportTypeSelect = document.getElementById('transport-type');
    const toDepartmentSelect = document.getElementById('to-department');
    const fromDepartmentSelect = document.getElementById('from-department');
    
    // Set department defaults based on category
    if (selectedCategoryText === 'samples') {
        // For Samples, set "To Department" to Pathology
        if (toDepartmentSelect) {
            Array.from(toDepartmentSelect.options).forEach(option => {
                if (option.text.toLowerCase() === 'pathology') {
                    toDepartmentSelect.value = option.value;
                }
            });
        }
    } else if (selectedCategoryText === 'pathology' && fromDepartmentSelect) {
        // For Pathology category, set "From Department" to Pathology
        Array.from(fromDepartmentSelect.options).forEach(option => {
            if (option.text.toLowerCase() === 'pathology') {
                fromDepartmentSelect.value = option.value;
            }
        });
    }
    
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
            'patient transfer': 'transport-options',
            'samples': 'samples', // Corrected to show Samples entries, not Pathology
            'sample transfer': 'samples',
            'asset movement': 'assets',
            'pathology': 'pathology',
            'gases': 'gases',
            'general items': 'general-items',
            'ad-hoc': 'general-items'
        };
        
        // Initial filtering based on default selection
        if (jobCategorySelect.value) {
            filterItemTypesByCategory(jobCategorySelect, itemTypeSelect, optgroups, categoryMapping);
        }
        
        // Set up change handler
        jobCategorySelect.addEventListener('change', function() {
            // First toggle transport vs item fields
            toggleTransportItemFields(this);
            
            // Then filter the item types if showing
            if (document.getElementById('item-type-row').style.display !== 'none') {
                filterItemTypesByCategory(this, itemTypeSelect, optgroups, categoryMapping);
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
 */
function filterItemTypesByCategory(jobCategorySelect, itemTypeSelect, optgroups, categoryMapping) {
    const selectedCategoryId = jobCategorySelect.value;
    if (!selectedCategoryId) {
        // If nothing selected, no filtering
        return;
    }
    
    // Get the selected category text
    const selectedCategoryText = jobCategorySelect.options[jobCategorySelect.selectedIndex].text.toLowerCase();
    
    // Set default values
    let targetGroupName = null;
    
    // Direct mapping for specific categories
    if (selectedCategoryText === 'pathology') {
        targetGroupName = 'pathology';
    } else if (selectedCategoryText === 'samples') {
        targetGroupName = 'samples';
    } else {
        // Find the matching category map for other categories
        for (const categoryKey in categoryMapping) {
            if (selectedCategoryText === categoryKey || selectedCategoryText.includes(categoryKey)) {
                targetGroupName = categoryMapping[categoryKey];
                break;
            }
        }
    }
    
    console.log(`Selected category: "${selectedCategoryText}", target group: "${targetGroupName}"`);
    
    // Hide all optgroups and options first
    optgroups.forEach(group => {
        group.style.display = 'none';
        Array.from(group.querySelectorAll('option')).forEach(option => {
            option.style.display = 'none';
        });
    });
    
    // Handle specific case for showing the correct optgroup
    if (targetGroupName) {
        // Find the matching optgroup
        optgroups.forEach(group => {
            const groupName = group.label.toLowerCase().replace(/\s+/g, '-');
            if (groupName === targetGroupName || 
                (targetGroupName === 'transport-options' && groupName === 'patient-transfer')) {
                group.style.display = '';
                Array.from(group.querySelectorAll('option')).forEach(option => {
                    option.style.display = '';
                });
                console.log(`Showing optgroup: ${group.label}`);
            }
        });
    } else {
        // If no specific match, show all options for flexibility
        console.log("No specific match found, showing all optgroups");
        optgroups.forEach(group => {
            group.style.display = '';
            Array.from(group.querySelectorAll('option')).forEach(option => {
                option.style.display = '';
            });
        });
    }
    
    // Reset selection
    itemTypeSelect.value = '';
}
