export default function StyledButton({ text, clickHandler, parameter, isConnected, page }) {
    let display = 'none';

    if (isConnected && page === 'index') {
        display = 'block';
    } else if (page === 'purchased' || 'form') {
        display = 'block';
    }

    return (
        <button
            className='rounded my-3 px-4 py-2 shadow w-100'
            onClick={() => clickHandler(parameter)}
            style={{
                textDecoration: 'none',
                color: 'white',
                backgroundColor: '#1e1e1e',
                border: '0px',
                display,
            }}>
            {text}
        </button>
    );
}