export default function WalletStatus({ status }) {
    return (
        <>
            {status && (
                <div className='flex text-2x1 text-center items-center p-3'>
                    <span><i>{status}</i></span>
                </div>
            )}
        </>
    );
}