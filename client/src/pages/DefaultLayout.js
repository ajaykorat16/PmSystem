import React, { useEffect, useState } from 'react';
import { cilCalendar, cilCalendarCheck, cilClock, cilFolderOpen, cilHistory, cilPeople } from '@coreui/icons';
import { CRow, CCol, CWidgetStatsA, CNavLink } from '@coreui/react';
import { CChartLine, CChartBar } from '@coreui/react-chartjs';
import { useAuth } from '../context/AuthContext';
import { useLeave } from '../context/LeaveContext';
import { useProject } from '../context/ProjectContext';
import { useWorklog } from '../context/WorklogContext';
import { useUser } from '../context/UserContext';
import { NavLink } from 'react-router-dom';
import CIcon from '@coreui/icons-react';
import Layout from './Layout';
import PendingLeaves from './PendingLeaves';

const DefaultLayout = () => {
  const { auth, toast } = useAuth()
  const { getUserLeave } = useLeave()
  const { getAdminWorklog, getWorklog } = useWorklog()
  const { userProject, getProject } = useProject()
  const { getAllUsersByBirthMonth, getAllEmployee } = useUser()
  const [leaveCount, setLeaveCount] = useState(0)
  const [projectcount, setProjectCount] = useState(0)
  const [allProjectsCount, setAllProjectsCount] = useState(0)
  const [birthdayUsercount, setBirthdayUsercount] = useState(0)
  const [employeeCount, setEmployeeCount] = useState(0)
  const [adminWorklogCount, setAdminWorklogCount] = useState(0)
  const [userWorklogCount, setUserWorklogCount] = useState(0)

  const fetchLeave = async () => {
    const data = await getUserLeave()
    setLeaveCount(data?.approvedLeave)
  }

  const fetchProjects = async () => {
    const { totalProjects } = await userProject()
    setProjectCount(totalProjects)
  }

  const fetchAllProjects = async () => {
    const { totalProjects } = await getProject()
    setAllProjectsCount(totalProjects)
  }

  const fetchBirthdayUser = async () => {
    const { totalUsers } = await getAllUsersByBirthMonth()
    setBirthdayUsercount(totalUsers)
  }

  const fetchEmployee = async () => {
    const { totalEmployee } = await getAllEmployee()
    setEmployeeCount(totalEmployee)
  }

  const fetchAdminWorklog = async () => {
    const { worklogUserCount } = await getAdminWorklog()
    setAdminWorklogCount(worklogUserCount)
  }

  const fetchUserWorklog = async () => {
    const { totalWeekTime } = await getWorklog()
    setUserWorklogCount(totalWeekTime)
  }

  const fetchData = async () => {
    if (auth && auth.user) {
      if (auth?.user.role === "user") {
        fetchLeave();
        fetchProjects();
        fetchBirthdayUser();
        fetchUserWorklog();
      } else if (auth?.user.role === "admin") {
        fetchBirthdayUser();
        fetchAllProjects();
        fetchEmployee();
        fetchAdminWorklog();
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [auth]);

  const userRole = auth?.user?.role;

  const chart1 = () => {
    return (
      <CChartLine
        className="mt-3 mx-3"
        style={{ height: '70px' }}
        data={{
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
          datasets: [
            {
              label: 'My First dataset',
              backgroundColor: 'transparent',
              borderColor: 'rgba(255,255,255,.55)',
              pointBackgroundColor: '#321fdb',
              data: [65, 59, 84, 84, 51, 55, 40],
            },
          ],
        }}
        options={{
          events: [],
          plugins: {
            legend: {
              display: false,
            },
          },
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: {
                display: false,
                drawBorder: false,
              },
              ticks: {
                display: false,
              },
            },
            y: {
              min: 30,
              max: 89,
              display: false,
              grid: {
                display: false,
              },
              ticks: {
                display: false,
              },
            },
          },
          elements: {
            line: {
              borderWidth: 1,
              tension: 0.4,
            },
            point: {
              radius: 4,
              hitRadius: 10,
              hoverRadius: 4,
            },
          },
        }}
      />
    )
  }

  const chart2 = () => {
    return (
      <CChartLine
        className="mt-3 mx-3"
        style={{ height: '70px' }}
        data={{
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
          datasets: [
            {
              label: 'My First dataset',
              backgroundColor: 'transparent',
              borderColor: 'rgba(255,255,255,.55)',
              pointBackgroundColor: '#39f',
              data: [1, 18, 9, 17, 34, 22, 11],
            },
          ],
        }}
        options={{
          events: [],
          plugins: {
            legend: {
              display: false,
            },
          },
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: {
                display: false,
                drawBorder: false,
              },
              ticks: {
                display: false,
              },
            },
            y: {
              min: -9,
              max: 39,
              display: false,
              grid: {
                display: false,
              },
              ticks: {
                display: false,
              },
            },
          },
          elements: {
            line: {
              borderWidth: 1,
            },
            point: {
              radius: 4,
              hitRadius: 10,
              hoverRadius: 4,
            },
          },
        }}
      />
    )
  }

  const chart3 = () => {
    return (
      <CChartLine
        className="mt-3"
        style={{ height: '70px' }}
        data={{
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
          datasets: [
            {
              label: 'My First dataset',
              backgroundColor: 'rgba(255,255,255,.2)',
              borderColor: 'rgba(255,255,255,.55)',
              data: [78, 81, 80, 45, 34, 12, 40],
              fill: true,
            },
          ],
        }}
        options={{
          events: [],
          plugins: {
            legend: {
              display: false,
            },
          },
          maintainAspectRatio: false,
          scales: {
            x: {
              display: false,
            },
            y: {
              display: false,
            },
          },
          elements: {
            line: {
              borderWidth: 2,
              tension: 0.4,
            },
            point: {
              radius: 0,
              hitRadius: 10,
              hoverRadius: 4,
            },
          },
        }}
      />
    )
  }

  const chart4 = () => {
    return (
      <CChartBar
        className="mt-3 mx-3"
        style={{ height: '70px' }}
        data={{
          labels: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
            'January',
            'February',
            'March',
            'April',
          ],
          datasets: [
            {
              label: 'My First dataset',
              backgroundColor: 'rgba(255,255,255,.2)',
              borderColor: 'rgba(255,255,255,.55)',
              data: [78, 81, 80, 45, 34, 12, 40, 85, 65, 23, 12, 98, 34, 84, 67, 82],
              barPercentage: 0.6,
            },
          ],
        }}
        options={{
          events: [],
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
                drawTicks: false,
              },
              ticks: {
                display: false,
              },
            },
            y: {
              grid: {
                display: false,
                drawBorder: false,
                drawTicks: false,
              },
              ticks: {
                display: false,
              },
            },
          },
        }}
      />
    )
  }

  if (userRole === null || userRole === undefined) {
    return (
      <Layout toast={toast}>
        <CRow>
          <CCol sm={3}>
            <CWidgetStatsA
              className="mb-4"
              color="primary"
              value={
                <>
                  {leaveCount}
                </>
              }
              title="Leave Of This Year"
              chart={chart1()}
            />
          </CCol>
          <CCol sm={3}>
            <CWidgetStatsA
              className="mb-4"
              color="info"
              value={
                <>
                  {employeeCount}
                </>
              }
              title="Employee"
              chart={chart2()}
            />
          </CCol>
          <CCol sm={3}>
            <CWidgetStatsA
              className="mb-4"
              color="warning"
              value={
                <>
                  {projectcount}
                </>
              }
              title="My Projects"
              chart={chart3()}
            />
          </CCol>
          <CCol sm={3}>
            <CWidgetStatsA
              className="mb-4"
              color="danger"
              value={
                <>
                  {userWorklogCount} h
                </>
              }
              title="Worklog"
              chart={chart4()}
            />
          </CCol>
        </CRow>
      </Layout>
    )
  }

  return (
    <Layout toast={toast}>
      <CRow>
        <CCol sm={3}>
          {userRole === "user" ? (
            <CNavLink component={NavLink} to="/dashboard-user/leave/list">
              <CWidgetStatsA
                className="mb-4"
                color="primary"
                value={
                  <>
                    {leaveCount}
                  </>
                }
                title="Leaves Of This Year"
                chart={chart1()}
                action={
                  <CIcon icon={cilCalendarCheck} height={45} width={45} />
                }
              />
            </CNavLink>
          ) : (
            <CNavLink component={NavLink} to="/dashboard/user/list">
              <CWidgetStatsA
                className="mb-4"
                color="primary"
                value={
                  <>
                    {employeeCount}
                  </>
                }
                title="Employee"
                chart={chart1()}
                action={
                  <CIcon icon={cilPeople} height={45} width={45} />
                }
              />
            </CNavLink>
          )}
        </CCol>
        <CCol sm={3}>
          {userRole === "user" ? (
            <CNavLink component={NavLink} to="/dashboard-user/project/list">
              <CWidgetStatsA
                className="mb-4"
                color="info"
                value={
                  <>
                    {projectcount}
                  </>
                }
                title="My Projects"
                chart={chart2()}
                action={
                  <CIcon icon={cilFolderOpen} height={45} width={45} />
                }
              />
            </CNavLink>) : (
            <CNavLink component={NavLink} to="/dashboard/project/list">
              <CWidgetStatsA
                className="mb-4"
                color="info"
                value={
                  <>
                    {allProjectsCount}
                  </>
                }
                title="Projects"
                chart={chart2()}
                action={
                  <CIcon icon={cilFolderOpen} height={45} width={45} />
                }
              />
            </CNavLink>
          )}
        </CCol>
        <CCol sm={3}>
          <CNavLink component={NavLink} to={userRole === "user" ? "/dashboard-user/employee/birthday/list" : "/dashboard/user/birthday/list"}>
            <CWidgetStatsA
              className="mb-4"
              // icon={}
              color="warning"
              value={
                <>
                  {birthdayUsercount}
                </>
              }
              title="Birthday on this month"
              chart={chart3()}
              action={
                <CIcon icon={cilCalendar} height={50} width={50} />
              }
            >
            </CWidgetStatsA>
          </CNavLink>
        </CCol>
        <CCol sm={3}>
          {userRole === "user" ? (
            <CNavLink component={NavLink} to="/dashboard-user/workLog/list">
              <CWidgetStatsA
                className="mb-4"
                color="danger"
                value={
                  <>
                    {userWorklogCount} h
                  </>
                }
                title="Worklog"
                chart={chart4()}
                action={
                  <CIcon icon={cilClock} height={45} width={45} />
                }
              />
            </CNavLink>) : (
            <CNavLink component={NavLink} to="/dashboard/workLog/list">
              <CWidgetStatsA
                className="mb-4"
                color="danger"
                value={
                  <>
                    {adminWorklogCount}
                  </>
                }
                title="Worklog"
                chart={chart4()}
                action={
                  <CIcon icon={cilHistory} height={45} width={45} />
                }
              />
            </CNavLink>
          )
          }
        </CCol>
      </CRow>
      {userRole === "admin" && ( <PendingLeaves/>)}
    </Layout>
  )
}

export default DefaultLayout
