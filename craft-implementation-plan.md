# Porter Task Management - Craft CMS 5.x Implementation Plan

## Phase 1: Setup Craft CMS Data Structure

### Step 1: Create Category Groups

Craft CMS 5.x uses Categories as a powerful way to organize related data. For our Porter Task Management app, we'll create four category groups:

1. **Buildings**
   - Navigate to Settings → Categories → New Category Group
   - Name: Buildings
   - Handle: buildings
   - Max Levels: 1
   - Site Settings: Enable for your site(s)
   - Field Layout: Just the Title field for now

2. **Departments**
   - Name: Departments
   - Handle: departments
   - Max Levels: 1
   - Field Layout:
     - Title field (default)
     - Add a new Categories field:
       - Field Name: Building
       - Handle: building
       - Source: Buildings category group
       - Limit: 1 (each department belongs to one building)
       - Required: Yes

3. **Job Types**
   - Name: Job Types
   - Handle: jobTypes
   - Max Levels: 1
   - Field Layout:
     - Title field
     - Add a new Table field:
       - Field Name: Transport Options
       - Handle: transportOptions
       - Add one column: "Option" (text)
       - Default Values: Empty (you'll add options for the Patient Transfer job type)
       - Required: No (only needed for Patient Transfer type)

4. **Job Categories**
   - Name: Job Categories
   - Handle: jobCategories
   - Max Levels: 1
   - Field Layout:
     - Title field
     - Add a new Categories field:
       - Field Name: Allowed Types
       - Handle: allowedTypes
       - Source: Job Types
       - Limit: No limit
       - Required: Yes

### Step 2: Create Custom Element Types

Create a module to house our custom element types. Start with:

```bash
ddev craft make module/porter
```

#### Implement Staff Element Type

1. Create `modules/porter/elements/Staff.php`
2. Create `modules/porter/migrations/Install.php` to create the necessary database table

#### Implement Task Element Type

1. Create `modules/porter/elements/Task.php`
2. Add task-related tables to the Install migration

### Step 3: Configure GraphQL API

1. Enable GraphQL in Craft settings
2. Create a schema for Porter Task Management
3. Create or generate GraphQL types for all your elements

## Phase 2: Update Frontend to Use Craft Data

### Step 1: Create Controller Actions

1. Create a Tasks controller in `modules/porter/controllers/TasksController.php`
2. Implement actions for:
   - `actionGetPendingTasks`
   - `actionGetCompletedTasks`
   - `actionCreateTask`
   - `actionUpdateTask`
   - `actionCompleteTask`
   - `actionArchiveShift`

### Step 2: Update Templates

Update your templates to leverage Craft's variables and template functions:

#### Example: Home Page (index.twig)
```twig
{% extends "_layout.twig" %}

{% block title %}Porter{% endblock %}

{% block content %}
<div class="simple-screen">
    <div class="simple-header">
        <input type="date" id="current-date" class="date-input" value="{{ now|date('Y-m-d') }}">
        <div class="shift-selector">
            <button class="shift-btn active" data-shift="day">Day</button> / 
            <button class="shift-btn" data-shift="night">Night</button>
        </div>
    </div>
    
    <div class="main-button">
        <a href="{{ url('tasks/new') }}" id="new-task-btn">New Task</a>
    </div>
    
    <div class="bottom-buttons">
        <a href="{{ url('tasks/pending') }}" id="pending-tasks-btn">Pending Tasks</a>
        <a href="{{ url('tasks/completed') }}" id="completed-tasks-btn">Completed Tasks</a>
        <button id="shift-complete-btn" class="shift-btn">Shift Complete</button>
    </div>
</div>
{% endblock %}

{% block scripts %}
<script>
// Simplified script that will call Craft controller actions
document.addEventListener('DOMContentLoaded', function() {
    // Get shift complete button
    const shiftCompleteBtn = document.getElementById('shift-complete-btn');
    
    // Add event listener
    if (shiftCompleteBtn) {
        shiftCompleteBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to complete this shift?')) {
                const currentDate = document.getElementById('current-date').value;
                const currentShift = document.querySelector('.shift-btn.active').dataset.shift;
                
                // Use Craft's CSRF token
                const csrfToken = '{{ craft.app.request.csrfToken }}';
                
                // Call Craft controller action
                fetch('/actions/porter/tasks/archive-shift', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfToken
                    },
                    body: JSON.stringify({
                        date: currentDate,
                        shift: currentShift
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = '/tasks/report';
                    } else {
                        alert('Failed to complete shift: ' + data.error);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred. Please try again.');
                });
            }
        });
    }
});
</script>
{% endblock %}
```

#### Example: New Task Form
```twig
{% extends "_layout.twig" %}

{% block title %}New Task{% endblock %}

{% block content %}
<div class="new-task-form">
    <form method="post" action="" accept-charset="UTF-8">
        {{ csrfInput() }}
        <input type="hidden" name="action" value="porter/tasks/create-task">
        <input type="hidden" name="redirect" value="tasks/pending">
        
        <div class="form-group">
            <label for="time-received">Time Received:</label>
            <input type="time" id="time-received" name="timeReceived" value="{{ now|date('H:i') }}" required>
        </div>
        
        <div class="form-group">
            <label for="job-category">Job Category:</label>
            <select id="job-category" name="jobCategoryId" required>
                <option value="">Select Job Category</option>
                {% for category in craft.categories.group('jobCategories').all() %}
                    <option value="{{ category.id }}">{{ category.title }}</option>
                {% endfor %}
            </select>
        </div>
        
        <div class="form-group">
            <label for="from-department">From Department:</label>
            <select id="from-department" name="fromDepartmentId" required>
                <option value="">Select Department</option>
                {% for department in craft.categories.group('departments').all() %}
                    <option value="{{ department.id }}">{{ department.title }}</option>
                {% endfor %}
            </select>
        </div>
        
        <div class="form-group">
            <label for="to-department">To Department:</label>
            <select id="to-department" name="toDepartmentId" required>
                <option value="">Select Department</option>
                {% for department in craft.categories.group('departments').all() %}
                    <option value="{{ department.id }}">{{ department.title }}</option>
                {% endfor %}
            </select>
        </div>
        
        <div class="form-group">
            <label for="item-type">Item Type:</label>
            <select id="item-type" name="itemTypeId" required>
                <option value="">Select Item Type</option>
                <!-- Job types will be populated by JavaScript -->
            </select>
        </div>
        
        <div class="form-group" id="transport-container" style="display: none;">
            <label for="transport-type">Transport Type:</label>
            <select id="transport-type" name="transportType">
                <option value="">Select Transport Type</option>
                <!-- Transport options will be populated by JavaScript -->
            </select>
        </div>
        
        <div class="form-actions">
            <button type="submit" name="status" value="pending" class="secondary-btn">Save as Pending</button>
            <button type="submit" name="status" value="completed" class="primary-btn">Mark as Complete</button>
        </div>
    </form>
</div>
{% endblock %}

{% block scripts %}
<script>
document.addEventListener('DOMContentLoaded', function() {
    const jobCategorySelect = document.getElementById('job-category');
    const itemTypeSelect = document.getElementById('item-type');
    const transportContainer = document.getElementById('transport-container');
    const transportTypeSelect = document.getElementById('transport-type');
    
    // Load allowed job types when job category changes
    if (jobCategorySelect) {
        jobCategorySelect.addEventListener('change', function() {
            const categoryId = this.value;
            if (!categoryId) return;
            
            fetch(`/actions/porter/tasks/get-job-types?categoryId=${categoryId}`)
                .then(response => response.json())
                .then(data => {
                    // Clear existing options
                    itemTypeSelect.innerHTML = '<option value="">Select Item Type</option>';
                    
                    // Add new options
                    data.jobTypes.forEach(jobType => {
                        const option = document.createElement('option');
                        option.value = jobType.id;
                        option.textContent = jobType.title;
                        option.dataset.hasTransport = jobType.hasTransportOptions ? 'true' : 'false';
                        itemTypeSelect.appendChild(option);
                    });
                });
        });
    }
    
    // Show/hide transport options based on job type
    if (itemTypeSelect) {
        itemTypeSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const hasTransport = selectedOption.dataset.hasTransport === 'true';
            
            if (hasTransport) {
                transportContainer.style.display = 'block';
                
                // Load transport options
                fetch(`/actions/porter/tasks/get-transport-options?jobTypeId=${this.value}`)
                    .then(response => response.json())
                    .then(data => {
                        // Clear existing options
                        transportTypeSelect.innerHTML = '<option value="">Select Transport Type</option>';
                        
                        // Add new options
                        data.transportOptions.forEach(option => {
                            const optionEl = document.createElement('option');
                            optionEl.value = option;
                            optionEl.textContent = option;
                            transportTypeSelect.appendChild(optionEl);
                        });
                    });
            } else {
                transportContainer.style.display = 'none';
            }
        });
    }
});
</script>
{% endblock %}
```

### Step 3: Create JavaScript for API Interaction

Replace your mock-data.js with a new craft-api.js that communicates with Craft's controller actions:

```javascript
// craft-api.js
class PorterApi {
    // Get pending tasks for a date and shift
    async getPendingTasks(date, shift) {
        const response = await fetch(`/actions/porter/tasks/get-pending-tasks?date=${date}&shift=${shift}`);
        return await response.json();
    }
    
    // Get completed tasks for a date and shift
    async getCompletedTasks(date, shift) {
        const response = await fetch(`/actions/porter/tasks/get-completed-tasks?date=${date}&shift=${shift}`);
        return await response.json();
    }
    
    // Create a new task
    async createTask(taskData) {
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        
        const response = await fetch('/actions/porter/tasks/create-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(taskData)
        });
        
        return await response.json();
    }
    
    // Update an existing task
    async updateTask(taskId, taskData) {
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        
        const response = await fetch(`/actions/porter/tasks/update-task?id=${taskId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(taskData)
        });
        
        return await response.json();
    }
    
    // Complete a task
    async completeTask(taskId, completionTime) {
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        
        const response = await fetch(`/actions/porter/tasks/complete-task`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({
                id: taskId,
                timeCompleted: completionTime
            })
        });
        
        return await response.json();
    }
    
    // Archive current shift
    async archiveShift(date, shift) {
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        
        const response = await fetch('/actions/porter/tasks/archive-shift', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({
                date,
                shift
            })
        });
        
        return await response.json();
    }
}

// Export a singleton instance
window.porterApi = new PorterApi();
```

## Phase 3: Implement Custom Module Components

### Step 1: Install Module

When the module structure is generated, ensure the module is bootstrapped in `config/app.php`:

```php
return [
    'modules' => [
        'porter' => \modules\porter\Porter::class,
    ],
    'bootstrap' => ['porter'],
];
```

### Step 2: Define Element Types

Example staff element implementation:

```php
<?php

namespace modules\porter\elements;

use Craft;
use craft\base\Element;
use craft\elements\db\ElementQueryInterface;
use modules\porter\elements\db\StaffQuery;
use modules\porter\records\StaffRecord;

class Staff extends Element
{
    public $name;
    public $email;
    public $active = true;

    public static function displayName(): string
    {
        return 'Staff';
    }

    public static function find(): ElementQueryInterface
    {
        return new StaffQuery(static::class);
    }

    public function afterSave(bool $isNew): void
    {
        if ($isNew) {
            \Craft::$app->db->createCommand()
                ->insert(StaffRecord::tableName(), [
                    'id' => $this->id,
                    'name' => $this->name,
                    'email' => $this->email,
                    'active' => $this->active,
                ])
                ->execute();
        } else {
            \Craft::$app->db->createCommand()
                ->update(StaffRecord::tableName(), [
                    'name' => $this->name,
                    'email' => $this->email,
                    'active' => $this->active,
                ], ['id' => $this->id])
                ->execute();
        }

        parent::afterSave($isNew);
    }

    // Other element methods...
}
```

### Step 3: Implement Controller Actions

Example tasks controller:

```php
<?php

namespace modules\porter\controllers;

use Craft;
use craft\web\Controller;
use modules\porter\elements\Task;
use yii\web\Response;

class TasksController extends Controller
{
    protected array|bool|int $allowAnonymous = self::ALLOW_ANONYMOUS_NEVER;

    public function actionGetPendingTasks(): Response
    {
        $this->requireAcceptsJson();
        
        $date = Craft::$app->request->getQueryParam('date');
        $shift = Craft::$app->request->getQueryParam('shift');
        
        $pendingTasks = Task::find()
            ->status('pending')
            ->date($date)
            ->shift($shift)
            ->all();
            
        $result = [];
        foreach ($pendingTasks as $task) {
            $result[] = [
                'id' => $task->id,
                'timeReceived' => $task->timeReceived,
                'fromDepartment' => $task->fromDepartment->title ?? null,
                'toDepartment' => $task->toDepartment->title ?? null,
                'jobCategory' => $task->jobCategory->title ?? null,
                'itemType' => $task->itemType->title ?? null,
                'transportType' => $task->transportType,
                'staffName' => $task->assignedStaff->name ?? null,
                'timeAllocated' => $task->timeAllocated,
            ];
        }
        
        return $this->asJson($result);
    }
    
    // Other controller actions...
}
```

## Phase 4: Data Migration and Testing

1. Create a migration to populate initial data from your mock data
2. Test each API endpoint
3. Test the UI with real Craft data
4. Implement validation and error handling

## Next Steps

Once this structure is implemented, you'll have a fully functional Craft CMS backend for your Porter Task Management application. The integration with frontend code will be seamless, while also providing you with a robust admin interface to manage all your data.

In future phases, you could consider:

1. Implementing user permissions
2. Adding dashboard widgets for staff and task statistics
3. Creating more advanced reporting features
4. Implementing mobile app integration with the same API
