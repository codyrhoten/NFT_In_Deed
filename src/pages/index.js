import { Container } from 'react-bootstrap';
import axios from 'axios';
import { ethers } from 'ethers';
import { houseNftAddress, marketAddress } from '../../config';
const Marketplace = require('../../artifacts/contracts/Market.sol/Market.json');
const HouseNFT = require('../../artifacts/contracts/HouseNFT.sol/HouseNFT.json');

function HomePage() {
    const [houses, setHouses] = useState([]);
    const [loadingState, setLoadingState] = useState('not-loaded');

    useEffect(async () => {
        const provider = new ethers.providers.JsonRpcProvider();
        const houseNFTContract = new ethers.Contract(houseNftAddress, HouseNFT.abi, provider);
        const marketContract = new ethers.Contract(marketAddress, Marketplace.abi, provider);
        const listings = await marketContract.getListedHouses();

        const houses = await Promise.all(listings.map(async i => {
            try {
                const houseURI = await houseNFTContract.methods.tokenURI(i.tokenId).call();
                const meta = await axios.get(houseURI);
                return {
                    price: i.price,
                    houseId: i.houseId,
                    seller: i.seller,
                    owner: i.buyer,
                    lotSqFt: meta.data.lotSqFt,
                    houseSqFt: meta.data.houseSqFt,
                    bedrooms: meta.data.bedrooms,
                    bathrooms: meta.data.bathrooms,
                    houseType: meta.data.houseType,
                    yearBuilt: meta.data.yearBuilt,
                    location: meta.data.location,
                    imageURL: meta.data.imageURL,
                    condition: meta.data.condition,
                }
            } catch (err) {
                console.log(err)
                return null;
            }
        }));

        setHouses(houses.filter(house => house !== null))
        setLoadingState('loaded');
    }, []);

    if (loadingState === 'loaded' && !houses.length) {
        return (<h1>There are no houses on the market at this time</h1>);
    } else {
        return (
            <div className='flex justify-center'>
                <div className='px-4'>
                    <Container className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
                        
                    </Container>
                </div>
            </div>
        );
    }
}

export default HomePage;