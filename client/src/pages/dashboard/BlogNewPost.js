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
import { BlogNewPostForm } from '../../sections/@dashboard/blog';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { createLeave } from 'src/redux/slices/leaves';

// ----------------------------------------------------------------------

export default function BlogNewPost() {
  const { themeStretch } = useSettings();
  const { pathname } = useLocation();
  const isEdit = pathname.includes('edit'); 
  const dispatch = useDispatch();

  const handleCreateLeave = (leaveRecord) => {
    dispatch(createLeave(leaveRecord));
  };
  return (
    <Page title="Leave: New Leave">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Create a new leave"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Blog', href: PATH_DASHBOARD.blog.root },
            { name: !isEdit ? 'Create New Leave' : 'Edit Leave' },
          ]}
        />

        <BlogNewPostForm 
        isEdit={isEdit}
        currentUser={null} 
        createLeave = {handleCreateLeave}
        />
      </Container>
    </Page>
  );
}
