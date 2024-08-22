const User = ({ user, selected, onSelect }) => {
    const handleClick = () => {
        onSelect();
    };

    return (
        <div className={`user ${selected ? 'selected' : ''}`} onClick={handleClick}>
            <div className="description">
                <div className="name">
                    {user.username} {user.self ? ' (yourself)' : ''}
                </div>
            </div>
        </div>
    );
};

export default User;
