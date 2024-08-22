import { useState, useEffect, useCallback } from 'react';
import User from './User';
import MessagePanel from './MessagePanel';
import socket from '../socket';

const Chat = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);

    const initReactiveProperties = (user) => {
        const transformedMessages = user.messages.map((message) => ({
            content: message.content,
            fromSelf: message.from !== user.userID,
        }));

        return {
            ...user,
            messages: transformedMessages || [],
        };
    };

    const sortUsers = (usersList) => {
        return usersList.sort((a, b) => {
            if (a.self) return -1;
            if (b.self) return 1;
            return a.username.localeCompare(b.username);
        });
    };

    useEffect(() => {
        const handleUsers = (incomingUsers) =>
            setUsers((prevUsers) => {
                const updatedUsers = incomingUsers.map((user) => {
                    const existingUser = prevUsers.find((u) => u.userID === user.userID);
                    if (existingUser) {
                        return {
                            ...existingUser,
                            // connected: user.connected,
                            messages: existingUser.messages || user.messages,
                        };
                    } else {
                        user.self = user.userID === socket.userID;
                        return initReactiveProperties(user);
                    }
                });

                return sortUsers(updatedUsers);
            });

        const handleUserConnected = (user) => {
            setUsers((prevUsers) => {
                const userExists = prevUsers.some((u) => u.userID === user.userID);
                return userExists ? prevUsers.map((u) => u) : [...prevUsers, initReactiveProperties(user)];
            });
        };

        const handlePrivateMessage = ({ content, from }) => {
            setUsers((prevUsers) => {
                const fromSelf = socket.userID === from;

                const updatedUsers = prevUsers.map((user) => {
                    if (user.userID === from || user.userID === selectedUser?.userID) {
                        return {
                            ...user,
                            messages: [...user.messages, { content, fromSelf }],
                        };
                    }
                    return user;
                });

                if (selectedUser?.userID === from) {
                    setSelectedUser((prevSelectedUser) => ({
                        ...prevSelectedUser,
                        messages: [...prevSelectedUser.messages, { content, fromSelf }],
                    }));
                }

                return sortUsers(updatedUsers);
            });
        };

        socket.on('users', handleUsers);
        socket.on('user connected', handleUserConnected);
        socket.on('private message', handlePrivateMessage);

        return () => {
            socket.off('users', handleUsers);
            socket.off('user connected', handleUserConnected);
            socket.off('private message', handlePrivateMessage);
        };
    }, [selectedUser]);

    const onSelectUser = (user) => {
        setSelectedUser(user);
        setUsers((prevUsers) => prevUsers.map((u) => (u.userID === user.userID ? { ...u } : u)));
    };

    const onMessage = useCallback(
        (content) => {
            if (selectedUser) {
                socket.emit('private message', {
                    content,
                    to: selectedUser.userID,
                });

                setSelectedUser((prevSelectedUser) => ({
                    ...prevSelectedUser,
                    messages: [...prevSelectedUser.messages, { content, fromSelf: true }],
                }));

                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user.userID === selectedUser.userID
                            ? {
                                  ...user,
                                  messages: [...user.messages, { content, fromSelf: true }],
                              }
                            : user
                    )
                );
            }
        },
        [selectedUser]
    );

    return (
        <div>
            <div className="left-panel">
                {users.map((user) => (
                    <User key={user.userID} user={user} selected={selectedUser?.userID === user.userID} onSelect={() => onSelectUser(user)} />
                ))}
            </div>
            {selectedUser && <MessagePanel user={selectedUser} onInput={onMessage} />}
        </div>
    );
};

export default Chat;
