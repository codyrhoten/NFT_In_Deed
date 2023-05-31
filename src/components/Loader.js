import Image from 'next/image';
import loadingSpinner from '../../public/loading-spinner.gif';

export default function Loader({ width, height }) {
    return (
        <div className='flex text-center'>
            <Image src={loadingSpinner} alt='Loader' width={width} height={height} />
        </div>
    );

}