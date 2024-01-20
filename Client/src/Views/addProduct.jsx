import { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2';
import axios from 'axios';

const AddProduct = () => {
    const [product, setProduct] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [imgUrl, setImgUrl] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3000/products', {
            product,
            price,
            stock,
            img_url: imgUrl,
        }, {
            headers: {
                access_token: localStorage.getItem('access_token'),
            },
        })
            .then(() => {
                Swal.fire({
                    title: 'Product Added!',
                    text: 'The product has been successfully added.',
                    icon: 'success',
                });
                setProduct('');
                setPrice('');
                setStock('');
                setImgUrl('');
            })
            .catch(error => {
                Swal.fire({
                    title: 'Cancelled',
                    text: error.response.data.message,
                    icon: 'info',
                });
            })
    };

    return (
        <Container className="mt-5">
            <Row>
                <Col md={6}>
                    <h2>Add Product</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="productName">
                            <Form.Label>Product Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter product name"
                                value={product}
                                onChange={(e) => setProduct(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="productPrice">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter price"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="productStock">
                            <Form.Label>Stock</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter stock"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="productImgUrl">
                            <Form.Label>Image URL</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter image URL"
                                value={imgUrl}
                                onChange={(e) => setImgUrl(e.target.value)}
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Add Product
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default AddProduct;
