import { useEffect } from 'react';
import { createBrowserRouter, useNavigate } from 'react-router-dom';
import SendMessage from '../Views/sendMessage.jsx';
import Login from '../Views/login.jsx';
import PropTypes from 'prop-types';
import App from "../App.jsx";
import Register from '../Views/register.jsx';
import Products from '../Views/Products.jsx';
import Cart from '../Views/Cart.jsx';
import AddProduct from '../Views/addProduct.jsx';

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

    return hasAccessToken() ? <Element /> : <Login />;
};

ProtectedRoute.propTypes = {
    element: PropTypes.elementType.isRequired,
    path: PropTypes.string.isRequired,
};

const ProtectedRouteHaveAccessToken = ({ element: Element, path }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (hasAccessToken() && path !== '/chat') {
            navigate('/chat');
        }
    }, [path, navigate]);

    return hasAccessToken() ? <Element /> : (path === '/login' ? <Login /> : <Register />);
};

ProtectedRouteHaveAccessToken.propTypes = {
    element: PropTypes.elementType.isRequired,
    path: PropTypes.string.isRequired,
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { path: '/chat', element: <ProtectedRoute element={SendMessage} path="/chat" /> },
            { path: '/login', element: <ProtectedRouteHaveAccessToken element={Login} path="/login" /> },
            { path: '/register', element: <ProtectedRouteHaveAccessToken element={Register} path="/register" /> },
            { path: '/products', element: <Products /> },
            { path: '/cart', element: <ProtectedRoute element={Cart} path="/cart" /> },
            { path: '/addproducts', element: <ProtectedRoute element={AddProduct} path="/addproducts" /> },
        ],
    },
]);

export default router;
