import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilNotes } from '@coreui/icons'
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
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
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
]

export default _nav
