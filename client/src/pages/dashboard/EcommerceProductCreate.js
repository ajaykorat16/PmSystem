import { useEffect } from 'react';
import { paramCase } from 'change-case';
import { useParams, useLocation } from 'react-router-dom';
// @mui
import { Container } from '@mui/material';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getProducts } from '../../redux/slices/product';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import ProductNewForm from '../../sections/@dashboard/e-commerce/ProductNewForm';
import { getDepartments } from '../../redux/slices/department';

// ----------------------------------------------------------------------

export default function EcommerceProductCreate() {
  const { themeStretch } = useSettings();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { name:id } = useParams();
  const { departments } = useSelector((state) => state.department);
  const isEdit = pathname.includes('edit');
  const currentDepartment = departments.find((department) => department._id === id);

  useEffect(() => {
    dispatch(getDepartments());
  }, [dispatch]);

  return (
    <Page title="Ecommerce: Create a new Department">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Create a new department' : 'Edit department'}
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            {
              name: 'E-Commerce',
              href: PATH_DASHBOARD.eCommerce.root,
            },
            { name: !isEdit ? 'New product' : 'Edit product' },
          ]}
        />

        <ProductNewForm isEdit={isEdit} currentDepartment={currentDepartment} />
      </Container>
    </Page>
  );
}
