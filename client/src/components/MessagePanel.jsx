import { useState, useCallback } from 'react';

const MessagePanel = ({ user, onInput }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        if (input.trim()) {
            onInput(input);
            setInput('');
        }
    };

    const displaySender = useCallback(
        (message, index) => {
            return index === 0 || user.messages[index - 1].fromSelf !== user.messages[index].fromSelf;
        },
        [user.messages]
    );

    const isValid = input.length > 0;

    return (
        <div className="right-panel">
            <div className="header">{user.username}</div>

            <ul className="messages">
                {user.messages.map((message, index) => (
                    <li key={index} className="message">
                        {displaySender(message, index) && <div className="sender">{message.fromSelf ? '(yourself)' : user.username}</div>}
                        {message.content}
                    </li>
                ))}
            </ul>

            <form onSubmit={handleSubmit} className="form">
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Your message..." className="input" />
                <button type="submit" disabled={!isValid} className="send-button">
                    Send
                </button>
            </form>
        </div>
    );
};

export default MessagePanel;
