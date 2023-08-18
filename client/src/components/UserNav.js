import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilCalendarCheck, cilNotes, cilSpreadsheet, cilUser } from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavGroup,
    name: 'Leaves',
    to: '/leave',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Leaves List',
        to: '/dashboard-user/leave/list',
      },
      {
        component: CNavItem,
        name: 'Create Leave',
        to: '/dashboard-user/leave/create',
      }
    ],
  },
  {
    component: CNavGroup,
    name: 'Employee',
    to: '/employee',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Employee List',
        to: '/dashboard-user/employee/list',
      },
      {
        component: CNavItem,
        name: 'Birthday on this Month',
        to: '/dashboard-user/employee/birtday/list',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Projects',
    to: '/project',
    icon: <CIcon icon={cilSpreadsheet} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Project List',
        to: '/dashboard-user/project/list',
      }
    ],
  },
  {
    component: CNavGroup,
    name: 'Work Log',
    to: '/workLog',
    icon: <CIcon icon={cilCalendarCheck} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Work Log',
        to: '/dashboard-user/workLog/list',
      },
      {
        component: CNavItem,
        name: 'Create Work Log',
        to: '/dashboard-user/workLog/create',
      }
    ],
  },
]

export default _nav
