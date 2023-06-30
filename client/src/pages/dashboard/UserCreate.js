import { useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
// @mui
import { Container } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import UserNewForm from '../../sections/@dashboard/user/UserNewForm';

// Redux
import { addUser, getUsers } from 'src/redux/slices/user';
// ----------------------------------------------------------------------

export default function UserCreate() {
  const { themeStretch } = useSettings();
  const { pathname } = useLocation();
  const { name : id } = useParams();
  const dispatch = useDispatch();
  const isEdit = pathname.includes('edit');

  const { users } = useSelector((state) => state.user)
  const currentUsers = users.find((user) => user._id === id)

  useEffect(() => {
    dispatch(getUsers())
  }, [dispatch])


  const handleAddUser = (user) => {
    dispatch(addUser(user));
  };

return (
  <Page title="User: Create a new user">
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <HeaderBreadcrumbs
        heading={!isEdit ? 'Create a new user' : 'Edit user'}
        links={[
          { name: 'Dashboard', href: PATH_DASHBOARD.root },
          { name: 'User', href: PATH_DASHBOARD.user.list },
          { name: !isEdit ? 'New user' : 'Edit User' },
        ]}
      />

      <UserNewForm
        isEdit={isEdit}
        currentUser={currentUsers}
        addUser={handleAddUser}
      />
    </Container>
  </Page>
);
}
