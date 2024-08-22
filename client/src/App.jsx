import { useState, useEffect } from 'react';
import SignUp from './components/SignUp';
import Chat from './components/Chat';
import socket from './socket';

const App = () => {
    const [usernameAlreadySelected, setUsernameAlreadySelected] = useState(false);

    useEffect(() => {
        const sessionID = localStorage.getItem('sessionID');
        if (sessionID) {
            setUsernameAlreadySelected(true);
            socket.auth = { sessionID };
            socket.connect();
        }

        socket.on('session', ({ sessionID, userID }) => {
            socket.auth = { sessionID };
            localStorage.setItem('sessionID', sessionID);
            socket.userID = userID;
        });

        const handleConnectError = (err) => {
            if (err.message === 'invalid username') {
                setUsernameAlreadySelected(false);
            }
        };

        socket.on('connect_error', handleConnectError);

        return () => {
            socket.off('session');
            socket.off('connect_error', handleConnectError);
        };
    }, []);

    const onUsernameSelection = (username) => {
        setUsernameAlreadySelected(true);
        socket.auth = { username };
        socket.connect();
    };

    return <div id="app">{!usernameAlreadySelected ? <SignUp onInput={onUsernameSelection} /> : <Chat />}</div>;
};

export default App;
