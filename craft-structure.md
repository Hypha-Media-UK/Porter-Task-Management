# Craft CMS 5.x Structure for Porter Task Management

## Overview

Craft CMS 5.x introduces new approaches to content modeling. In this document, I'll outline how to structure the Porter Task Management application using Craft's latest features.

## Element Types

For this application, we'll use a mix of Craft's built-in element types and custom element types to better model the domain.

### 1. Custom Element Types

We'll create custom element types for domain-specific entities:

#### A. Staff Element Type
- **Class**: `app\elements\Staff`
- **Table**: `porter_staff`
- **Fields**:
  - Name (text)
  - Email (email)
  - Active Status (lightswitch)
  - Custom Properties:
    - staffId (UUID)

#### B. Task Element Type
- **Class**: `app\elements\Task`
- **Table**: `porter_tasks`
- **Fields**:
  - Title (derived from task details)
  - Status (custom status - pending, completed, archived)
  - Custom Properties:
    - timeReceived (datetime)
    - timeAllocated (datetime)
    - timeCompleted (datetime)
    - transportType (string)
    - Relations:
      - jobCategory (relation to Category element)
      - fromDepartment (relation to Department element)
      - toDepartment (relation to Department element)
      - itemType (relation to JobType element)
      - assignedStaff (relation to Staff element)

### 2. Craft's Built-in Element Types

#### A. Categories
We'll use Craft's built-in Categories element type for:

1. **Buildings Category Group**
   - Handle: `buildings`
   - Fields:
     - Name (built-in)

2. **Departments Category Group**
   - Handle: `departments`
   - Fields:
     - Name (built-in)
     - Building (categories field, related to Buildings)

3. **Job Types Category Group**
   - Handle: `jobTypes`
   - Fields:
     - Name (built-in)
     - Transport Options (table field with options)

4. **Job Categories Category Group**
   - Handle: `jobCategories`
   - Fields:
     - Name (built-in)
     - Allowed Types (categories field, related to Job Types)

## Database Schema

The following database schema represents the relationships between these elements:

```
Staff (Custom Element)
└── staffId, name, email, active

Task (Custom Element)
├── id, title, status
├── timeReceived, timeAllocated, timeCompleted, transportType
└── Relations:
    ├── jobCategory
    ├── fromDepartment
    ├── toDepartment
    ├── itemType
    └── assignedStaff

Buildings (Category)
└── id, name

Departments (Category)
├── id, name
└── buildingId (relation)

Job Types (Category)
├── id, name
└── transportOptions (JSON field)

Job Categories (Category)
├── id, name
└── allowedTypes (relations)
```

## GraphQL Schema

Craft 5.x has robust GraphQL support built-in. We'll expose the following GraphQL schema:

```graphql
type Staff {
  id: ID!
  name: String!
  email: String
  active: Boolean!
}

type Building {
  id: ID!
  title: String!
  departments: [Department!]
}

type Department {
  id: ID!
  title: String!
  building: Building!
}

type JobType {
  id: ID!
  title: String!
  transportOptions: [String!]
}

type JobCategory {
  id: ID!
  title: String!
  allowedTypes: [JobType!]!
}

type Task {
  id: ID!
  title: String!
  status: String!
  timeReceived: DateTime!
  timeAllocated: DateTime
  timeCompleted: DateTime
  transportType: String
  jobCategory: JobCategory!
  fromDepartment: Department!
  toDepartment: Department!
  itemType: JobType!
  assignedStaff: Staff
}

type Query {
  buildings: [Building!]!
  departments(buildingId: ID): [Department!]!
  jobTypes: [JobType!]!
  jobCategories: [JobCategory!]!
  staff(active: Boolean = true): [Staff!]!
  
  pendingTasks(date: Date, shift: String): [Task!]!
  completedTasks(date: Date, shift: String): [Task!]!
  task(id: ID!): Task
}

type Mutation {
  createTask(input: TaskInput!): Task!
  updateTask(id: ID!, input: TaskInput!): Task!
  assignTask(id: ID!, staffId: ID!): Task!
  completeTask(id: ID!, completionTime: DateTime): Task!
  archiveTasks(date: Date!, shift: String!): Boolean!
}

input TaskInput {
  timeReceived: DateTime!
  jobCategoryId: ID!
  fromDepartmentId: ID!
  toDepartmentId: ID!
  itemTypeId: ID!
  transportType: String
  staffId: ID
  status: String
  timeAllocated: DateTime
  timeCompleted: DateTime
}
```

## Project Setup

### 1. Custom Module Setup

Create a `porter` module:

```
modules/
└── porter/
    ├── Porter.php
    ├── elements/
    │   ├── Staff.php
    │   └── Task.php
    ├── migrations/
    │   └── Install.php
    ├── records/
    │   ├── StaffRecord.php
    │   └── TaskRecord.php
    └── controllers/
        ├── TasksController.php
        └── ApiController.php
```

### 2. GraphQL Setup

1. Enable GraphQL in Craft settings
2. Create a schema for the Porter application
3. Define types based on our element types
4. Set up queries and mutations

### 3. Frontend Integration

We'll use Vue.js with the Apollo GraphQL client:

```javascript
// Example of querying departments for a building
const getDepartments = gql`
  query GetDepartments($buildingId: ID!) {
    departments(buildingId: $buildingId) {
      id
      title
    }
  }
`;

// Then in a Vue component:
apollo: {
  departments: {
    query: getDepartments,
    variables() {
      return {
        buildingId: this.selectedBuildingId
      }
    }
  }
}
```

## Next Steps

1. Create the custom element types in Craft
2. Set up the category groups
3. Define the GraphQL schema
4. Update the frontend to query the GraphQL API
