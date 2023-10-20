import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilSitemap, cilCalendar, cilPeople, cilTask, cilHttps, cilFolderOpen } from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

const _nav = [

  {
    component: CNavGroup,
    name: 'Users',
    to: '/user',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'User List',
        to: '/dashboard/user/list',
      },
      {
        component: CNavItem,
        name: 'Birthday this Month',
        to: '/dashboard/user/birthday/list',
      },
      {
        component: CNavItem,
        name: 'Create User',
        to: '/dashboard/user/create',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Leaves',
    to: '/leave',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Leaves List',
        to: '/dashboard/leave/list',
      },
      {
        component: CNavItem,
        name: 'Create Leave',
        to: '/dashboard/leave/create',
      },
      {
        component: CNavItem,
        name: 'Manage Leave',
        to: '/dashboard/leaveManagement/list',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Department',
    to: '/user',
    icon: <CIcon icon={cilSitemap} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Department List',
        to: '/dashboard/department/list',
      },
      {
        component: CNavItem,
        name: 'Create Department',
        to: '/dashboard/department/create',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Project',
    to: '/user',
    icon: <CIcon icon={cilFolderOpen} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Project List',
        to: '/dashboard/project/list',
      },
      {
        component: CNavItem,
        name: 'Create Project',
        to: '/dashboard/project/create',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Work Log',
    to: '/workLog',
    icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Work Log List',
        to: '/dashboard/workLog/list',
      }
    ],
  },
  {
    component: CNavGroup,
    name: 'Credentials',
    to: '/credentials',
    icon: <CIcon icon={cilHttps} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Credentials List',
        to: '/dashboard/credential/list',
      },
      {
        component: CNavItem,
        name: 'Create Credentials',
        to: '/dashboard/credential/create',
      }
    ],
  },
]

export default _nav
