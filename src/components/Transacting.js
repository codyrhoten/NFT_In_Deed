export default function Transacting() {
    return (
        <div className='flex justify-center mt-10'>
            <div className='flex flex-col pb-12'>
                <h2 className='py-2 text-center'>Tokenization/Listing Process</h2>
                <p className='p-4 my-4'>
                    <b>Step 1:</b> Tokenize the house NFT and store it on the blockchain. Confirm the transaction on your wallet.
                </p>
                <p className='p-4 my-4'>
                    <b>Step 2:</b> Wait for the transaction to be processed.
                </p>
                <p className='p-4'>
                    <b>Step 3:</b> Allow NFT-in-Deed to sell the house. This comes with a 3% commission fee. Confirm the transaction on your wallet.
                </p>
                <p className='pt-1 p-4 my-4'>
                    <b>Step 4:</b> Wait for the transaction to be processed.
                </p>
            </div>
        </div>
    );
}