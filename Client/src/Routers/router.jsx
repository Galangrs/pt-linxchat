import { useEffect } from 'react';
import { createBrowserRouter, useNavigate } from 'react-router-dom';
import SendMessage from '../Views/sendMessage.jsx';
import Login from '../Views/login.jsx';
import PropTypes from 'prop-types';

const hasAccessToken = () => {
    return localStorage.getItem('access_token') !== null;
};

const ProtectedRoute = ({ element: Element, path }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!hasAccessToken() && path !== '/login') {
            navigate('/login');
        }
    }, [path, navigate]);

    return hasAccessToken() ? <Element /> : null;
};

ProtectedRoute.propTypes = {
    element: PropTypes.elementType.isRequired,
    path: PropTypes.string.isRequired,
};


const router = createBrowserRouter([
    {
        path: '/',
        element: <ProtectedRoute element={SendMessage} path="/" />,
    },
    {
        path: '/login',
        element: <Login />,
    },
]);

export default router;
