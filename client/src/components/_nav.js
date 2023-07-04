import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilDescription,
  cilNotes,
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
        to: '/user/list',
      },
      {
        component: CNavItem,
        name: 'Create User',
        to: '/user/create',
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
        to: '/leave/list',
      },
      {
        component: CNavItem,
        name: 'Create Leave',
        to: '/leave/create',
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
        to: '/department/list',
      },
      {
        component: CNavItem,
        name: 'Create Department',
        to: '/department/create',
      },
    ],
  },
]

export default _nav
