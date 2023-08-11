import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilDescription,
  cilNotes,
  cilSpreadsheet,
  cilUser,
} from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

const _nav = [

  {
    component: CNavGroup,
    name: 'User',
    to: '/user',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'User List',
        to: '/dashboard/user/list',
      },
      {
        component: CNavItem,
        name: 'Birthday on this Month',
        to: '/dashboard/user/birtday/list',
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
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
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
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
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
    icon: <CIcon icon={cilSpreadsheet} customClassName="nav-icon" />,
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
]

export default _nav
