import { useState } from 'react';

const SignUp = ({ onInput }) => {
    const [username, setUsername] = useState('');

    // Handler for form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        if (username.length > 2) {
            onInput(username);
        }
    };

    // Computed property to determine if the username is valid
    const isValid = username.length > 2;

    return (
        <div className="select-username">
            <form onSubmit={handleSubmit}>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your username..." />
                <button type="submit" disabled={!isValid}>
                    Send
                </button>
            </form>
        </div>
    );
};

export default SignUp;
