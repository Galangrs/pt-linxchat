import { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import axios from 'axios';

const Carts = () => {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3000/cart', {
            headers: {
                access_token: localStorage.getItem('access_token'),
            },
        })
            .then((response) => {
                const data = response.data;
                setCart(data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [])

    return (
        <div className="container mt-5">
            <h2>Cart Table</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Total Item</th>
                        <th>Total Price</th>
                        <th>Image</th>
                        <th>Checkout</th>
                    </tr>
                </thead>
                <tbody>
                    {cart.map((cart) => (
                        <tr key={cart.id}>
                            <td>{cart.id}</td>
                            <td>{cart.product}</td>
                            <td>{cart.totalItem}</td>
                            <td>${cart.totalPrice.toFixed(2)}</td>
                            <td>
                                <img src={cart.img_url} alt={cart.product} style={{ width: '200px', height: '200px' }} />
                            </td>
                            <td>{cart.checkout}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default Carts;
