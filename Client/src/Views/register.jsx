import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../Componets/AuthContext';

const Register = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prevCredentials) => ({
            ...prevCredentials,
            [name]: value,
        }));
    };

    const handleSubmit = () => {
        axios
            .post('http://localhost:3000/register', credentials)
            .then((response) => {
                login()
                const data = response.data;
                localStorage.setItem('access_token', data.access_token);
                navigate('/chat');
                Swal.fire({
                    title: 'Success!',
                    text: 'Sucess Register',
                    icon: 'success',
                })
            })
            .catch((error) => {
                Swal.fire({
                    title: 'Cancelled',
                    text: error.response.data.message,
                    icon: 'info',
                })
            });
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="card-title">Register</h2>
                            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="username"
                                        name="username"
                                        value={credentials.username}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        name="password"
                                        value={credentials.password}
                                        onChange={handleChange}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Register
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
