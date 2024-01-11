import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

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

const SendMessage = () => {
    const [message, setMessage] = useState('');
    const [name, setName] = useState('');
    const [isGlobal, setIsGlobal] = useState(false);
    const [receivedMessages, setReceivedMessages] = useState([]);

    const socket = useSocketConnection();

    useEffect(() => {
        axios.get('http://localhost:3000/getchat', { headers: { access_token: localStorage.getItem('access_token') } })
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

    const handleOptionChange = (e) => {
        setIsGlobal(e.target.value === 'global');
    };

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isGlobal) {
            console.log(`Sending global message: ${message}`);
            socket.emit('message', { message, type: 'Global' });
        } else {
            console.log(`Sending personal message to ${name}: ${message}`);
            socket.emit('message', { message, type: 'Personal', clientName: name });
        }
        setMessage('');
        setName('');
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        <input
                            type="radio"
                            value="personal"
                            checked={!isGlobal}
                            onChange={handleOptionChange}
                        />
                        Personal
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="global"
                            checked={isGlobal}
                            onChange={handleOptionChange}
                        />
                        Global
                    </label>
                </div>
                {!isGlobal && (
                    <div>
                        <label>
                            Name:
                            <input type="text" value={name} onChange={handleNameChange} />
                        </label>
                    </div>
                )}
                <div>
                    <label>
                        Message:
                        <input type="text" value={message} onChange={handleMessageChange} />
                    </label>
                </div>
                <button type="submit">Send</button>
            </form>
            <div>
                <h2>Received Messages</h2>
                <ul>
                    {receivedMessages.map((msg, index) => (
                        <li key={index}>{msg.type === 'Global' ? `Global: (Sender ${msg.sender}): ` : `Personal (Sender ${msg.sender}): `}{msg.message}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SendMessage;
