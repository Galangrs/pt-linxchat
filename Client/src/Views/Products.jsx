import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Swal from 'sweetalert2';
import axios from 'axios'

const Products = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3000/products')
            .then((response) => {
                const data = response.data;
                setProducts(data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [])

    const addToCart = (productId, productName) => {
        if (localStorage.getItem('access_token') != null) {
            Swal.fire({
                title: `Add ${productName} to Cart`,
                input: 'number',
                inputAttributes: {
                    min: 1,
                    step: 1,
                },
                showCancelButton: true,
                confirmButtonText: 'Add to Cart',
                showLoaderOnConfirm: true,
                preConfirm: (totalItem) => {
                    axios
                        .post(
                            'http://localhost:3000/cart',
                            {
                                productId,
                                totalItem,
                            },
                            {
                                headers: {
                                    access_token: localStorage.getItem('access_token'),
                                },
                            }
                        )
                        .then(() => {
                            Swal.fire({
                                title: 'Success!',
                                text: 'Product has been added to the cart',
                                icon: 'success',
                            });
                            axios.get('http://localhost:3000/products')
                                .then((response) => {
                                    const data = response.data;
                                    setProducts(data);
                                })
                                .catch((error) => {
                                    console.log(error);
                                });
                        })
                        .catch((error) => {
                            Swal.fire({
                                title: 'Error',
                                text: error.response ? error.response.data.message : 'An error occurred',
                                icon: 'error',
                            });
                        });
                },
            });
        } else {
            Swal.fire({
                title: 'Cancelled',
                text: 'Please Login First',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Go to Login',
                cancelButtonText: 'Stay Here',
            }).then((loginResult) => {
                if (loginResult.isConfirmed) {
                    navigate('/login')
                }
            });
        }
    };

    return (
        <div className="container mt-5">
            <h2>Product Table</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Seller</th>
                        <th>Stock</th>
                        <th>Price</th>
                        <th>Image</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>{product.product}</td>
                            <td>{product.seller}</td>
                            <td>{product.stock}</td>
                            <td>${product.price.toFixed(2)}</td>
                            <td>
                                <img src={product.img_url} alt={product.product} style={{ width: '200px', height: '200px' }} />
                            </td>
                            <td>
                                <Button variant="primary" onClick={() => addToCart(product.id, product.product)}>
                                    Add to Cart
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default Products;
