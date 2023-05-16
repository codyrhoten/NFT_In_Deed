export default function StyledButton({ text, clickHandler, parameter }) {
    return (
        <button
            className='rounded my-3 px-4 py-3 shadow w-100'
            onClick={() => clickHandler(parameter)}
            style={{
                textDecoration: 'none',
                color: 'white',
                backgroundColor: '#1e1e1e',
                border: '0px'
        }}>
            {text}
        </button>
    );
}