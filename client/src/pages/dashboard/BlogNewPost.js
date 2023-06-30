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
import { useLocation, useParams } from 'react-router-dom';
import { createLeave } from 'src/redux/slices/leaves';
import { getLeaves } from 'src/redux/slices/leaves';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

// ----------------------------------------------------------------------

export default function BlogNewPost() {
  const { themeStretch } = useSettings();
  const { pathname } = useLocation();
  const isEdit = pathname.includes('edit');
  const dispatch = useDispatch();
  const { id } = useParams();

  const { leaves } = useSelector((state) => state.leave)
  const currentLeaves = leaves.find((leave) => leave._id === id)
console.log("currentLeaves..........",currentLeaves)
  useEffect(() => {
    dispatch(getLeaves())
  }, [dispatch])

  const handleCreateLeave = (leaveRecord) => {
    dispatch(createLeave(leaveRecord));
  };
  return (
    <Page title="Leave: New Leave">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? "Create a new leave" : "Edit Leave"}
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Blog', href: PATH_DASHBOARD.blog.root },
            { name: !isEdit ? 'Create New Leave' : 'Edit Leave' },
          ]}
        />

        <BlogNewPostForm
          isEdit={isEdit}
          currentLeave={currentLeaves}
          createLeave={handleCreateLeave}
        />
      </Container>
    </Page>
  );
}
