# Porter Task Management System

A task management system for porters in a healthcare environment, allowing scheduling and tracking of porter tasks.

## Project Structure

### Frontend
- Built with HTML, SCSS, and JavaScript
- Uses Twig templates with Craft CMS
- Styles organized with a modular SCSS architecture

### Main Components
- **Home Screen**: View current date/shift and create new tasks
- **New Task Screen**: Add task details and assign to staff
- **Pending Tasks**: View and manage incomplete tasks
- **Completed Tasks**: View and edit completed tasks
- **Shift Report**: Generate reports for completed shifts

## Development Setup

### Frontend Development
- SCSS files in `/src/css/` are compiled to `/web/src/css/`
- JavaScript files in `/src/js/` are compiled to `/web/src/js/`

### Mock Data
The application currently uses mock data for the prototype phase. This is implemented in `mock-data.js` which:
1. Injects sample data for staff, buildings, departments, etc.
2. Overrides the data loading mechanism to use static data
3. Uses localStorage for persistence during the prototype phase

### Craft CMS Integration
- The frontend is served through Craft CMS templates
- Templates are in the `/templates/` directory
- Static assets are accessed through the web directory

## Future Development

### Backend Implementation
- Replace mock data with Craft CMS elements
- Create element types for:
  - Staff
  - Buildings
  - Departments
  - Job Types
  - Job Categories
  - Tasks
- Implement proper data relationships

### Features to Add
- Admin panel for data management
- User authentication
- Advanced reporting
- Notifications

## Maintenance Notes

- When updating SCSS, edit files in `/src/css/` - CodeKit will compile them
- When updating JS, edit files in `/src/js/` - CodeKit will compile them 
- For template changes, edit the Twig files in `/templates/`
