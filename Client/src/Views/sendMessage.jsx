import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { Form, Button, Container, Row, Col, ListGroup } from 'react-bootstrap';

const useSocketConnection = () => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');
        const newSocket = io('http://localhost:3000', {
            transportOptions: {
                polling: {
                    extraHeaders: {
                        'access_token': accessToken,
                    }
                }
            }
        });

        newSocket.on('connect', () => {
            console.log('Connected to server');
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return socket;
};

const Chat = () => {
    const [message, setMessage] = useState('');
    const [name, setName] = useState('');
    const [receivedMessages, setReceivedMessages] = useState([]);
    const socket = useSocketConnection();

    useEffect(() => {
        axios.get('http://localhost:3000/chat', { headers: { access_token: localStorage.getItem('access_token') } })
            .then(response => {
                setReceivedMessages(response.data)
            })
            .catch(err => console.log(err))
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('message', (data) => {
                setReceivedMessages((prevMessages) => [...prevMessages, data]);
            });
        }

        return () => {
            if (socket) {
                socket.off('message');
            }
        };
    }, [socket]);

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        socket.emit('message', { message, type: 'Personal', clientName: name });
        setMessage('');
        setName('');
    };

    return (
        <Container className="mt-5">
            <Row>
                <Col md={6}>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group>
                            <Form.Label>Name:</Form.Label>
                            <Form.Control type="text" value={name} onChange={handleNameChange} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Message:</Form.Label>
                            <Form.Control type="text" value={message} onChange={handleMessageChange} />
                        </Form.Group>
                        <br></br>
                        <Button variant="primary" type="submit">
                            Send
                        </Button>
                    </Form>
                </Col>
                <Col md={6}>
                    <div>
                        <h2>Received Messages</h2>
                        <ListGroup>
                            {receivedMessages.map((msg, index) => (
                                <ListGroup.Item key={index}>
                                    {msg.type} (Sender {msg.sender}): {msg.message}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Chat;