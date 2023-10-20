import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilTask, cilCalendar, cilFolderOpen, cilPeople, cilHttps } from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavGroup,
    name: 'Leaves',
    to: '/leave',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
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
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Employee List',
        to: '/dashboard-user/employee/list',
      },
      {
        component: CNavItem,
        name: 'Birthday this Month',
        to: '/dashboard-user/employee/birthday/list',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Projects',
    to: '/project',
    icon: <CIcon icon={cilFolderOpen} customClassName="nav-icon" />,
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
    icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
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
  {
    component: CNavGroup,
    name: 'Credentials',
    to: '/credentials',
    icon: <CIcon icon={cilHttps} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Credentials List',
        to: '/dashboard-user/credential/list',
      },
      {
        component: CNavItem,
        name: 'Create Credentials',
        to: '/dashboard-user/credential/create',
      }
    ],
  },
]

export default _nav
