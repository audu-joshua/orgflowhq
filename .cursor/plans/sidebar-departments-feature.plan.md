# Sidebar Update and Departments Feature Plan

## Overview
Update the Sidebar component to show logo + title instead of company name, add Departments page, and ensure all colors are theme-aware.

## Current Issues
1. Sidebar shows company name instead of logo
2. Need to add Departments functionality
3. Need to create database schema for departments
4. Need to create staff/employees system
5. Need theme-aware navigation

## Database Schema Changes

### New Tables

#### departments
```sql
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### employees
```sql
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE, -- HR employee ID
  position TEXT,
  phone TEXT,
  hire_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### RLS Policies
- Departments: Users can view/manage departments in their organization
- Employees: Users can view employees in their organization

## Implementation Steps

### Step 1: Update Sidebar Component
**File:** `src/components/layout/Sidebar.tsx`

Changes:
1. Replace organization name with HR logo (same as TopBar)
2. Add "Departments" to navItems with Building icon from lucide-react
3. Show organization name below logo (smaller text)
4. Update active state styling
5. Ensure all colors use theme tokens

### Step 2: Create Departments Feature Structure

**New Files to Create:**
1. `src/features/departments/types.ts` - TypeScript interfaces
2. `src/features/departments/services/departmentService.ts` - Supabase queries
3. `src/features/departments/components/DepartmentsContent.tsx` - Main departments page
4. `src/features/departments/components/DepartmentList.tsx` - List view
5. `src/features/departments/components/CreateDepartmentForm.tsx` - Form to create departments
6. `app/dashboard/departments/page.tsx` - Page route

### Step 3: Department Components

**DepartmentsContent.tsx:**
- Show list of all departments
- Add new department button
- Display department name, description, manager
- Show employee count per department
- Click department to see all employees in that department

**Features:**
- Create new department
- View department details
- See all staff in a department
- Edit department
- Delete department

### Step 4: Employee Management

**Employee Components:**
- List employees by department
- Add new employee form
- Employee card with details (name, email, position, etc.)
- Filter by department

### Step 5: Update Database Schema

**File:** `scripts/01-init-schema.sql`

Add:
- departments table
- employees table  
- RLS policies for both tables

## Files to Create

1. `app/dashboard/departments/page.tsx`
2. `src/features/departments/types.ts`
3. `src/features/departments/services/departmentService.ts`
4. `src/features/departments/components/DepartmentsContent.tsx`
5. `src/features/departments/components/DepartmentList.tsx`
6. `src/features/departments/components/DepartmentCard.tsx`
7. `src/features/departments/components/CreateDepartmentForm.tsx`

## Files to Modify

1. `src/components/layout/Sidebar.tsx` - Add logo, add departments nav item
2. `scripts/01-init-schema.sql` - Add departments and employees tables
3. `src/store/useAppStore.ts` - Add departments to state (optional)

## Theme Considerations

**All colors must be theme-aware:**
- Use `bg-card`, `bg-sidebar`, `bg-primary`
- Use `text-foreground`, `text-muted-foreground`
- Use `text-sidebar-foreground`, `text-sidebar-primary`
- Use `border-border`, `border-sidebar-border`
- NO hardcoded colors like `bg-blue-600`, `text-gray-900`, etc.

## Expected Outcome

1. Sidebar shows HR logo + organization name
2. Departments page accessible from sidebar
3. Can create and manage departments
4. Can view staff by department
5. Can add employees to departments
6. All styling respects light/dark theme

