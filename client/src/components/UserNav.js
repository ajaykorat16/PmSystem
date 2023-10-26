import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilTask, cilCalendar, cilFolderOpen, cilPeople, cilHttps } from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

const _nav = [
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
    component: CNavItem,
    name: 'Leaves',
    to: '/dashboard-user/leave/list',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />
  },
  {
    component: CNavItem,
    name: 'Projects',
    to: '/dashboard-user/project/list',
    icon: <CIcon icon={cilFolderOpen} customClassName="nav-icon" />
  },
  {
    component: CNavItem,
    name: 'Work Log',
    to: '/dashboard-user/workLog/list',
    icon: <CIcon icon={cilTask} customClassName="nav-icon" />
  },
  {
    component: CNavItem,
    name: 'Credentials',
    to: '/dashboard-user/credential/list',
    icon: <CIcon icon={cilHttps} customClassName="nav-icon" />
  },
]

export default _nav
