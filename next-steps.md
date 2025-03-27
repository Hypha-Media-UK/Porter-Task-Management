# Porter Task Management - Next Steps

Here's a detailed, step-by-step guide for implementing the Craft CMS integration for your Porter Task Management app:

## Step 1: Create Category Groups

1. Log into the Craft CMS control panel
2. Navigate to Settings → Categories
3. Click "New Category Group"
4. Create the Buildings Category Group:
   - Name: Buildings
   - Handle: buildings
   - Max Levels: 1
   - Enable "Default placement" as "As a root category"
   - Site Settings: Enable for your site(s)
   - Field Layout: Add only the Title field for now
   - Save the category group

5. Click "New Category Group" again
6. Create the Departments Category Group:
   - Name: Departments
   - Handle: departments
   - Max Levels: 1
   - Site Settings: Enable for your site(s)
   - Field Layout:
     - Add the Title field
     - Create a new Categories field:
       - Click "+ New Field"
       - Field Name: Building
       - Field Handle: building
       - Field Type: Categories
       - Category Group: Buildings
       - Limit: 1 (each department belongs to one building)
       - Check "Required"
       - Save the field
   - Save the category group

7. Create the Job Types Category Group:
   - Name: Job Types
   - Handle: jobTypes
   - Max Levels: 1
   - Site Settings: Enable for your site(s)
   - Field Layout:
     - Add the Title field
     - Create a new Table field:
       - Click "+ New Field"
       - Field Name: Transport Options
       - Field Handle: transportOptions
       - Field Type: Table
       - Add one column: "Option" (text)
       - Save the field
   - Save the category group

8. Create the Job Categories Category Group:
   - Name: Job Categories
   - Handle: jobCategories
   - Max Levels: 1
   - Site Settings: Enable for your site(s)
   - Field Layout:
     - Add the Title field
     - Create a new Categories field:
       - Click "+ New Field"
       - Field Name: Allowed Types
       - Field Handle: allowedTypes
       - Field Type: Categories
       - Category Group: Job Types
       - Limit: No limit
       - Check "Required"
       - Save the field
   - Save the category group

## Step 2: Create Custom Module for Porter

1. Open your terminal/command line and navigate to your project root
2. Run the command to create a new module:
   ```bash
   ddev craft make module porter
   ```
3. This creates a baseline module structure in `modules/porter/`
4. Open `config/app.php` and verify the module is registered:
   ```php
   return [
       'modules' => [
           'porter' => \modules\porter\Porter::class,
       ],
       'bootstrap' => ['porter'],
   ];
   ```

## Step 3: Create Element Types

### Create the Staff Element Type:

1. In `modules/porter/`, create a folder called `elements`
2. Create a file `elements/Staff.php`:
   ```php
   <?php
   
   namespace modules\porter\elements;
   
   use Craft;
   use craft\base\Element;
   use craft\elements\db\ElementQueryInterface;
   use modules\porter\elements\db\StaffQuery;
   
   class Staff extends Element
   {
       // Properties
       public ?string $name = null;
       public ?string $email = null;
       public bool $active = true;
   
       // Static methods
       public static function displayName(): string
       {
           return 'Staff';
       }
       
       public static function hasTitles(): bool
       {
           return true;
       }
       
       public static function hasContent(): bool
       {
           return true;
       }
       
       public static function find(): ElementQueryInterface
       {
           return new StaffQuery(static::class);
       }
       
       public function getTitle(): string
       {
           return $this->name ?? '';
       }
       
       // Lifecycle methods to be implemented
   }
   ```

3. Create `elements/db/StaffQuery.php`:
   ```php
   <?php
   
   namespace modules\porter\elements\db;
   
   use craft\elements\db\ElementQuery;
   use modules\porter\elements\Staff;
   
   class StaffQuery extends ElementQuery
   {
       public function active($value = true)
       {
           $this->subQuery->andWhere(['staff.active' => $value]);
           return $this;
       }
       
       protected function beforePrepare(): bool
       {
           $this->joinElementTable('porter_staff');
           
           $this->query->select([
               'porter_staff.name',
               'porter_staff.email',
               'porter_staff.active',
           ]);
           
           return parent::beforePrepare();
       }
   }
   ```

4. Create a folder `modules/porter/records`
5. Create `records/StaffRecord.php`:
   ```php
   <?php
   
   namespace modules\porter\records;
   
   use craft\db\ActiveRecord;
   
   class StaffRecord extends ActiveRecord
   {
       public static function tableName(): string
       {
           return '{{%porter_staff}}';
       }
   }
   ```

### Create the Task Element Type:

1. Create `elements/Task.php` with appropriate properties for task management
2. Create `elements/db/TaskQuery.php` to handle task-specific queries
3. Create `records/TaskRecord.php` for database interaction

## Step 4: Create Migration for Database Tables

1. Create a folder `modules/porter/migrations`
2. Create `migrations/Install.php`:
   ```php
   <?php
   
   namespace modules\porter\migrations;
   
   use Craft;
   use craft\db\Migration;
   
   class Install extends Migration
   {
       public function safeUp(): bool
       {
           if ($this->createTables()) {
               $this->createIndexes();
               return true;
           }
           
           return false;
       }
       
       protected function createTables(): bool
       {
           $this->createTable('{{%porter_staff}}', [
               'id' => $this->primaryKey(),
               'name' => $this->string()->notNull(),
               'email' => $this->string(),
               'active' => $this->boolean()->defaultValue(true),
               'dateCreated' => $this->dateTime()->notNull(),
               'dateUpdated' => $this->dateTime()->notNull(),
               'uid' => $this->uid(),
           ]);
           
           $this->createTable('{{%porter_tasks}}', [
               'id' => $this->primaryKey(),
               'status' => $this->string()->notNull()->defaultValue('pending'),
               'date' => $this->date()->notNull(),
               'shift' => $this->string()->notNull(),
               'timeReceived' => $this->time()->notNull(),
               'jobCategoryId' => $this->integer(),
               'fromDepartmentId' => $this->integer(),
               'toDepartmentId' => $this->integer(),
               'itemTypeId' => $this->integer(),
               'transportType' => $this->string(),
               'staffId' => $this->integer(),
               'timeAllocated' => $this->time(),
               'timeCompleted' => $this->time(),
               'dateCreated' => $this->dateTime()->notNull(),
               'dateUpdated' => $this->dateTime()->notNull(),
               'uid' => $this->uid(),
           ]);
           
           return true;
       }
       
       protected function createIndexes(): void
       {
           $this->createIndex(null, '{{%porter_tasks}}', ['status']);
           $this->createIndex(null, '{{%porter_tasks}}', ['date']);
           $this->createIndex(null, '{{%porter_tasks}}', ['shift']);
           $this->createIndex(null, '{{%porter_tasks}}', ['jobCategoryId']);
           $this->createIndex(null, '{{%porter_tasks}}', ['fromDepartmentId']);
           $this->createIndex(null, '{{%porter_tasks}}', ['toDepartmentId']);
           $this->createIndex(null, '{{%porter_tasks}}', ['itemTypeId']);
           $this->createIndex(null, '{{%porter_tasks}}', ['staffId']);
       }
       
       public function safeDown(): bool
       {
           $this->dropTableIfExists('{{%porter_tasks}}');
           $this->dropTableIfExists('{{%porter_staff}}');
           
           return true;
       }
   }
   ```

3. Add code to run the migration in your module's `Porter.php` file:
   ```php
   <?php
   
   namespace modules\porter;
   
   use Craft;
   use craft\events\RegisterUrlRulesEvent;
   use craft\web\UrlManager;
   use modules\porter\elements\Staff;
   use modules\porter\elements\Task;
   use yii\base\Event;
   use yii\base\Module;
   
   class Porter extends Module
   {
       public function init()
       {
           parent::init();
           
           // Register elements
           Craft::$app->elements->registerElementTypes([
               Staff::class,
               Task::class,
           ]);
           
           // Register controllers for API actions
           $this->controllerNamespace = 'modules\\porter\\controllers';
           
           // Register URL rules
           Event::on(
               UrlManager::class,
               UrlManager::EVENT_REGISTER_SITE_URL_RULES,
               function(RegisterUrlRulesEvent $event) {
                   $event->rules['tasks/new'] = 'porter/tasks/new';
                   $event->rules['tasks/pending'] = 'porter/tasks/pending';
                   $event->rules['tasks/completed'] = 'porter/tasks/completed';
                   $event->rules['tasks/report'] = 'porter/tasks/report';
               }
           );
       }
   }
   ```

4. Run the migration to create database tables:
   ```bash
   ddev craft migrate/up --interactive=0
   ```

## Step 5: Populate Initial Data

1. Create categories for Buildings:
   - Navigate to Categories → Buildings in the control panel
   - Add each building (Main Hospital, Outpatient Center, etc.)

2. Create categories for Departments:
   - Navigate to Categories → Departments
   - Add each department, selecting its associated building

3. Create categories for Job Types:
   - Navigate to Categories → Job Types
   - Add each job type
   - For "Patient Transfer", add transport options in the table field

4. Create categories for Job Categories:
   - Navigate to Categories → Job Categories
   - Add each category (Routine, Urgent, Emergency, Staff Request)
   - Select allowed job types for each category

5. Programmatically create staff entries:
   ```php
   <?php
   // modules/porter/scripts/seedStaff.php
   
   use modules\porter\elements\Staff;
   
   $staffData = [
       ['name' => 'John Smith', 'email' => 'john.smith@example.com'],
       ['name' => 'Sarah Johnson', 'email' => 'sarah.johnson@example.com'],
       // Add more staff members from your mock data
   ];
   
   foreach ($staffData as $data) {
       $staff = new Staff();
       $staff->name = $data['name'];
       $staff->email = $data['email'] ?? null;
       $staff->active = true;
       
       if (!Craft::$app->elements->saveElement($staff)) {
           echo "Couldn't save staff: " . print_r($staff->getErrors(), true) . "\n";
       }
   }
   ```

6. Run the staff seeding script from your controller or create a console command

## Step 6: Create Controller Actions

1. Create a folder `modules/porter/controllers`
2. Create `controllers/TasksController.php`:
   ```php
   <?php
   
   namespace modules\porter\controllers;
   
   use Craft;
   use craft\web\Controller;
   use modules\porter\elements\Task;
   use yii\web\Response;
   
   class TasksController extends Controller
   {
       // Allow access to specific actions if needed
       protected array|bool|int $allowAnonymous = self::ALLOW_ANONYMOUS_NEVER;
       
       // Action to display the new task form
       public function actionNew(): Response
       {
           return $this->renderTemplate('porter/tasks/new');
       }
       
       // Action to display pending tasks
       public function actionPending(): Response
       {
           return $this->renderTemplate('porter/tasks/pending');
       }
       
       // Action to display completed tasks
       public function actionCompleted(): Response
       {
           return $this->renderTemplate('porter/tasks/completed');
       }
       
       // Action to display shift report
       public function actionReport(): Response
       {
           return $this->renderTemplate('porter/tasks/report');
       }
       
       // API action to get pending tasks
       public function actionGetPendingTasks(): Response
       {
           $this->requireAcceptsJson();
           
           $date = Craft::$app->request->getQueryParam('date');
           $shift = Craft::$app->request->getQueryParam('shift');
           
           // TODO: Implement query to get pending tasks
           
           return $this->asJson([
               'success' => true,
               'tasks' => []
           ]);
       }
       
       // API action to get completed tasks
       public function actionGetCompletedTasks(): Response
       {
           $this->requireAcceptsJson();
           
           $date = Craft::$app->request->getQueryParam('date');
           $shift = Craft::$app->request->getQueryParam('shift');
           
           // TODO: Implement query to get completed tasks
           
           return $this->asJson([
               'success' => true,
               'tasks' => []
           ]);
       }
       
       // API action to create a task
       public function actionCreateTask(): Response
       {
           $this->requirePostRequest();
           
           // TODO: Implement task creation
           
           if (Craft::$app->request->getAcceptsJson()) {
               return $this->asJson([
                   'success' => true,
                   'task' => []
               ]);
           }
           
           return $this->redirectToPostedUrl();
       }
       
       // Other actions for task management
   }
   ```

## Step 7: Create Templates

1. Create a folder `templates/porter/tasks`
2. Create `templates/porter/tasks/new.twig`:
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
           
           <!-- Add remaining form fields -->
           
           <div class="form-actions">
               <button type="submit" name="status" value="pending" class="secondary-btn">Save as Pending</button>
               <button type="submit" name="status" value="completed" class="primary-btn">Mark as Complete</button>
           </div>
       </form>
   </div>
   {% endblock %}
   
   {% block scripts %}
   <script>
   // Add JavaScript for form interactions
   </script>
   {% endblock %}
   ```

3. Create templates for other views (pending tasks, completed tasks, report)

## Step 8: Update JavaScript for API Interaction

1. Create `web/src/js/craft-api.js`:
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
       
       // Add other API methods
   }
   
   // Export a singleton instance
   window.porterApi = new PorterApi();
   ```

2. Update `templates/_layout.twig` to include the new API script:
   ```twig
   <script src="{{ alias('@web') }}/src/js/craft-api.js"></script>
   ```

## Step 9: Test and Debug

1. Test creating categories in the admin
2. Test staff element creation
3. Test task creation and management
4. Debug any issues with form submissions or API calls

This step-by-step guide should help you implement the Craft CMS integration for the Porter Task Management application. Each step builds on the previous one, gradually constructing the complete system.
