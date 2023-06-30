import { Link as RouterLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
// @mui
import {
  Card,
  Table,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  TableContainer,
  TablePagination,
} from '@mui/material';
// hooks
import useSettings from '../../hooks/useSettings';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import Page from '../../components/Page';
import Iconify from '../../components/Iconify';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import { UserListHead, UserListToolbar, UserMoreMenu } from 'src/sections/@dashboard/user/list';
import Scrollbar from 'src/components/Scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import SearchNotFound from 'src/components/SearchNotFound';
import { getLeaves } from 'src/redux/slices/leaves';
import { deleteLeave } from 'src/redux/slices/leaves';
import LeaveMoreMenu from 'src/sections/@dashboard/blog/LeaveMoreMenu';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'reason', label: 'Reason', alignRight: false },
  { id: 'startDate', label: 'Start Date', alignRight: false },
  { id: 'endDate', label: 'End Date', alignRight: false },
  { id: 'type', label: 'Type', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: '' },
];


export default function BlogPosts() {
  const dispatch = useDispatch();
  const { themeStretch } = useSettings();
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [leaveList, setLeaveList] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  useEffect(() => {
    dispatch(getLeaves());
  }, [dispatch]);

  const { leaves } = useSelector((state) => state.leave);

  useEffect(() => {
    if (leaves.length > 0) {
      setLeaveList(leaves)
    }
  }, [leaves]);

  const handleFilterByName = (_id) => {
    setFilterName(_id);
    setPage(0);
  };

  const handleDeleteMultiUser = (selected) => {
    const deleteLeaves = leaveList.filter((leave) => !selected.includes(leave._id));
    setSelected([]);
    setLeaveList(deleteLeaves);
  };

  const handleSelectAllClick = (checked) => {
    if (checked) {
      const newSelecteds = leaveList.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleDeleteLeave = async (id) => {
    await dispatch(deleteLeave(id));
    setLeaveList(leaves)
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const filteredUsers = applySortFilter(leaveList, getComparator(order, orderBy), filterName);
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - leaveList.length) : 0;
  const isNotFound = !filteredUsers.length && Boolean(filterName);


  return (
    <Page title="Blog: Posts">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Blog"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Blog', href: PATH_DASHBOARD.blog.root },
            { name: 'Posts' },
          ]}
          action={
            <Button
              variant="contained"
              component={RouterLink}
              to={PATH_DASHBOARD.blog.newPost}
              startIcon={<Iconify icon={'eva:plus-fill'} />}
            >
              New Post
            </Button>
          }
        />

        <Card>
          <UserListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            onDeleteUsers={() => handleDeleteMultiUser(selected)}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 1000 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={leaveList.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {leaveList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { _id, reason, startDate, endDate, type, status, userId } = row;
                    const isItemSelected = selected.indexOf(userId ? userId.firstName : "") !== -1;

                    return (
                      <TableRow
                        hover
                        key={_id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={isItemSelected}
                        aria-checked={isItemSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={isItemSelected} onClick={() => handleClick(_id)} />
                        </TableCell>
                        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                          {/* <Avatar alt={firstname} src={avatarUrl} sx={{ mr: 2 }} /> */}
                          <TableCell variant="subtitle2" noWrap>
                            {userId.firstname + " " + userId.lastname}
                          </TableCell>
                        </TableCell>
                        <TableCell align="left">{reason}</TableCell>
                        <TableCell align="left">{startDate}</TableCell>
                        <TableCell align="left">{endDate}</TableCell>
                        <TableCell align="left">{type}</TableCell>
                        <TableCell align="left">{status}</TableCell>

                        <TableCell align="right">
                          <LeaveMoreMenu onDelete={() => handleDeleteLeave(_id)} id={_id} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={leaveList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, page) => setPage(page)}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </Page>
  );
}

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return array.filter((_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}
