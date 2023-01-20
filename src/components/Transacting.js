// import Image from 'next/image';

export default function Transacting(/* { isLoading } */) {
    return (
        <div className='flex justify-center mt-10'>
            <div className='flex flex-col pb-12'>
                <h2 className='py-2 text-center'>Tokenization/Listing Process</h2>
                <p className='p-4 my-3'>
                    <b>Step 1:</b> Tokenize the house NFT and store it on the blockchain. Confirm the transaction in your wallet.
                </p>
                <p className='p-4 my-3'>
                    <b>Step 2:</b> Wait for a few seconds for the transaction to be processed.
                </p>
                <p className='p-4 my-3'>
                    <b>Step 3:</b> Now for the listing transaction: this comes with a 3% listing fee. Confirm the transaction in your wallet.
                </p>
                <p className='pt-1 p-4 my-3'>
                    <b>Step 4:</b> Wait another few seconds for the transaction to be processed. Then your house will be on the NFT-in-Deed Market for sale!
                </p>
                {/* {isLoading && (
                    <div className='flex justify-center'>
                        <Image
                            src={'/loading-spinner.gif'}
                            alt='loading spinner'
                            width='175'
                            height='175'
                        />
                    </div>
                )} */}
            </div>
        </div>
    );
}