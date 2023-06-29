import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { styled } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import { Card, Grid, Stack, Typography } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import {
  FormProvider,
  RHFTextField
} from '../../../components/hook-form';
import { addDepartment, updateDepartment } from 'src/redux/slices/department';
import { useDispatch } from 'react-redux';

// ----------------------------------------------------------------------

const LabelStyle = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));

// ----------------------------------------------------------------------

ProductNewForm.propTypes = {
  isEdit: PropTypes.bool,
  currentDepartment: PropTypes.object,
};

export default function ProductNewForm({ isEdit, currentDepartment }) {
  const { name: id } = useParams()
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const NewDepartmentSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentDepartment?.name || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentDepartment]
  );

  const methods = useForm({
    resolver: yupResolver(NewDepartmentSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (isEdit && currentDepartment) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, currentDepartment, reset, defaultValues]);


  const values = watch();

  useEffect(() => {
    if (isEdit && currentDepartment) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentDepartment]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        dispatch(updateDepartment(data.name, id))
        navigate(PATH_DASHBOARD.eCommerce.list);
      } else {
        dispatch(addDepartment(data.name))
        navigate(PATH_DASHBOARD.eCommerce.list);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <RHFTextField name="name" label="Department Name" />
              <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
                Save Changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
