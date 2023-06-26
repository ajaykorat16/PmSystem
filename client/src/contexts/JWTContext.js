import { createContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
// utils
import axios from '../utils/axios';
import { isValidToken, setSession } from '../utils/jwt';

// ----------------------------------------------------------------------

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

const handlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, user } = action.payload;
    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
    };
  },
  DEPARTMENT: (state, action) => {
    const { isAuthenticated, getAllDepartments } = action.payload;
    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      getAllDepartments,
    };
  },
  LOGIN: (state, action) => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
  }),
  ADDUSER: (state, action) => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
};

const reducer = (state, action) => (handlers[action.type] ? handlers[action.type](state, action) : state);

const AuthContext = createContext({
  ...initialState,
  method: 'jwt',
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  adduser: () => Promise.resolve(),
});

// ----------------------------------------------------------------------

AuthProvider.propTypes = {
  children: PropTypes.node,
};

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const initialize = async () => {
      try {
        const accessToken = window.localStorage.getItem('accessToken');
        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken);

          const response = await axios.get('/user/profile');
          const { getProfile: user } = response.data;

          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: true,
              user,
            },
          });
        } else {
          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    const department = async () => {
      try {
        const accessToken = window.localStorage.getItem('accessToken');
        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken);

          const { data } = await axios.get('/department');
          const { getAllDepartments } = data;

          dispatch({
            type: 'DEPARTMENT',
            payload: {
              isAuthenticated: true,
              getAllDepartments,
            },
          });
        } else {
          dispatch({
            type: 'DEPARTMENT',
            payload: {
              isAuthenticated: false,
              getAllDepartments: null,
            },
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: 'DEPARTMENT',
          payload: {
            isAuthenticated: false,
            getAllDepartments: null,
          },
        });
      }
    };

    department();
  }, []);

  const login = async (email, password) => {
    const response = await axios.post('/user/login', {
      email,
      password,
    });
    const { token: accessToken, user } = response.data;
    console.log(accessToken)

    setSession(accessToken);
    dispatch({
      type: 'LOGIN',
      payload: {
        user,
      },
    });
  };

  const adduser = async (email, password, firstName, lastName, phone, address, dateOfBirth, department, dateOfJoining) => {
    const accessToken = window.localStorage.getItem('accessToken');
    if (accessToken && isValidToken(accessToken)) {
      setSession(accessToken);
      const response = await axios.post('/addUser', {
        email,
        password,
        firstName,
        lastName,
        phone,
        address,
        dateOfBirth,
        department,
        dateOfJoining
      });
      const { accessToken, user } = response.data;
      console.log("adduser--------", user)
      dispatch({
        type: 'ADDUSER',
        payload: {
          user,
        },
      });
    };

    const logout = async () => {
      setSession(null);
      dispatch({ type: 'LOGOUT' });
    };

    return (
      <AuthContext.Provider
        value={{
          ...state,
          method: 'jwt',
          login,
          logout,
          adduser,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
}

  export { AuthContext, AuthProvider }
