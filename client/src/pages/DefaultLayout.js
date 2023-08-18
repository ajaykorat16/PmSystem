import React, { useEffect, useState } from 'react';
import CIcon from '@coreui/icons-react'
import { CRow, CCol, CWidgetStatsA } from '@coreui/react';
import { CChartLine, CChartBar } from '@coreui/react-chartjs';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import { cilArrowTop } from '@coreui/icons';
import { useLeave } from '../context/LeaveContext';
import { useProject } from '../context/ProjectContext';
import { useWorklog } from '../context/WorklogContext';
import { useUser } from '../context/UserContext';

const DefaultLayout = () => {
  const { auth } = useAuth()
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
    const { approvedLeave } = await getUserLeave()
    setLeaveCount(approvedLeave)
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
    const { totalUsers } = await getAllEmployee()
    setEmployeeCount(totalUsers)
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

  if (userRole === null || userRole === undefined) {
    return (
      <Layout>
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
              title="Leave This Month"
              chart={
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
                    events:[],
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
              }
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
              chart={
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
              }
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
              chart={
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
              }
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
              chart={
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
              }
            />
          </CCol>
        </CRow>
      </Layout>
    )
  }

  return (
    <Layout>
      <CRow>
        <CCol sm={3}>
          {userRole === "user" ? (
            <CWidgetStatsA
              className="mb-4"
              color="primary"
              value={
                <>
                  {leaveCount}
                </>
              }
              title="Leave This Month"
              chart={
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
              }
            />
          ) : (
            <CWidgetStatsA
              className="mb-4"
              color="primary"
              value={
                <>
                  {employeeCount}
                </>
              }
              title="Employee"
              chart={
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
              }
            />
          )}
        </CCol>
        <CCol sm={3}>
          {userRole === "user" ? (
            <CWidgetStatsA
              className="mb-4"
              color="info"
              value={
                <>
                  {projectcount}
                </>
              }
              title="My Projects"
              chart={
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
              }
            />) : (
            <CWidgetStatsA
              className="mb-4"
              color="info"
              value={
                <>
                  {allProjectsCount}
                </>
              }
              title="Projects"
              chart={
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
              }
            />
          )}
        </CCol>
        <CCol sm={3}>
          <CWidgetStatsA
            className="mb-4"
            color="warning"
            value={
              <>
                {birthdayUsercount}
              </>
            }
            title="Birthday on this month"
            chart={
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
            }
          />
        </CCol>
        <CCol sm={3}>
          {userRole === "user" ?
            (<CWidgetStatsA
              className="mb-4"
              color="danger"
              value={
                <>
                  {userWorklogCount} h
                </>
              }
              title="Worklog"
              chart={
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
              }
            />) :
            (<CWidgetStatsA
              className="mb-4"
              color="danger"
              value={
                <>
                  {adminWorklogCount}
                </>
              }
              title="Worklog"
              chart={
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
              }
            />)
          }
        </CCol>
      </CRow>
    </Layout>
  )
}

export default DefaultLayout
