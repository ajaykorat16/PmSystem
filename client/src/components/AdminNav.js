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
        name: 'Manage Monthly Leave',
        to: '/dashboard/manageMonthlyLeave/list',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Department',
    to: '/dashboard/department/list',
    icon: <CIcon icon={cilSitemap} customClassName="nav-icon" />
  },
  {
    component: CNavItem,
    name: 'Project',
    to: '/dashboard/project/list',
    icon: <CIcon icon={cilFolderOpen} customClassName="nav-icon" />
  },
  {
    component: CNavItem,
    name: 'Work Log',
    to: '/dashboard/workLog/list',
    icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Credentials',
    to: '/dashboard/credential/list',
    icon: <CIcon icon={cilHttps} customClassName="nav-icon" />,
  },
]

export default _nav
