import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import { LoadingButton } from '@mui/lab';
import { styled } from '@mui/material/styles';
import { Grid, Card, Stack, Button, Typography } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
import { useDispatch, useSelector } from 'react-redux';
// components
import { RHFEditor, FormProvider, RHFTextField, RHFSelect } from '../../../components/hook-form';
//
import BlogNewPostPreview from './BlogNewPostPreview';
import { getUsers } from 'src/redux/slices/user';
import { createLeave } from 'src/redux/slices/leaves';
// ----------------------------------------------------------------------

const LabelStyle = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));

// ----------------------------------------------------------------------

export default function BlogNewPostForm(isEdit, currentLeave) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const handleOpenPreview = () => {
    setOpen(true);
  };

  const handleClosePreview = () => {
    setOpen(false);
  };
  const { users } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const leaveStatus = ["Pending", "Approved", "Rejected"]
  const leaveType = ["Paid", "LWP"]

  const NewLeaveSchema = Yup.object().shape({
    userId: Yup.string().required('User is required'),
    reason: Yup.string().required('Reasone is required'),
    startDate: Yup.string().required('Start Data is required'),
    endDate: Yup.string().required('End Data is required'),
    status: Yup.string().required('Status is required'),
    type: Yup.string().required('Type is required'),
  });

  const defaultValues = {
    userId: currentLeave.userId || '',
    reason: currentLeave.reason || '',
    startDate: currentLeave.startDate || '',
    endDate: currentLeave.endDate || '',
    status: currentLeave.status || 'Pending',
    type: currentLeave.type || 'LWP',
  };

  const methods = useForm({
    resolver: yupResolver(NewLeaveSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isEdit && currentLeave) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, currentLeave, defaultValues]);

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  const values = watch();

  const onSubmit = async (data) => {
    try {
      console.log("leavedata-------->", data)
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      handleClosePreview();
      enqueueSnackbar('Post success!');
      navigate(PATH_DASHBOARD.blog.posts);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <RHFSelect name="name" label="User Name" placeholder="User Name">
                  <option value="" />
                  {users.map((option) => (
                    <option key={option._id} value={option._id}>
                      {option.firstname} {option.lastname}
                    </option>
                  ))}
                </RHFSelect>
                <div>
                  <LabelStyle>Reason for leave</LabelStyle>
                  <RHFEditor name="reason" />
                </div>

              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>

                <RHFSelect name="status" label="Status" placeholder="Status">
                  <option value="" />
                  {leaveStatus.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </RHFSelect>

                <RHFSelect name="type" label="Type" placeholder="Status">
                  <option value="" />
                  {leaveType.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </RHFSelect>

                <RHFTextField name="startDate" label="Leave Start Date" />
                <RHFTextField name="endDate" label="Leave End Date" />
              </Stack>
            </Card>

            <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
              <Button fullWidth color="inherit" variant="outlined" size="large" onClick={handleOpenPreview}>
                Preview
              </Button>
              <LoadingButton fullWidth type="submit" variant="contained" size="large" loading={isSubmitting}>
                Post
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </FormProvider>

      <BlogNewPostPreview
        values={values}
        isOpen={open}
        isValid={isValid}
        isSubmitting={isSubmitting}
        onClose={handleClosePreview}
        onSubmit={handleSubmit(onSubmit)}
      />
    </>
  );
}
