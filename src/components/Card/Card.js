import { Card } from 'react-bootstrap';
import StyledButton from '../StyledButton';
import styles from './Card.module.css';
import { useEffect, useState } from 'react';

export default function DataCard({ houseData, isConnected, clickHandler, page }) {
    return (
        <Card
            className={`rounded shadow overflow-hidden m-3 border-0 ${styles.card}`}
            lg="true"
        >
            <img
                src={houseData.imageURL}
                className={`card-img-top ${styles.cardImg}`}
            />
            <Card.Body className='d-flex flex-column'>
                <Card.Title className='mt-2 text-center h-100'>
                    {houseData.address}
                </Card.Title>
                <p className='text-center mt-3'>{houseData.price} ETH</p>
                <p className='mt-3'>
                    {`${houseData.bedrooms} bed, ${houseData.bathrooms} bath, ${houseData.houseSqFt} sq ft home, ${houseData.lotSqFt} sq ft lot, built ${houseData.yearBuilt}`}
                </p>
                {
                    page === 'index' || 'purchased' ? (
                        <div className='mt-auto'>
                            <StyledButton
                                isConnected={isConnected}
                                page={page}
                                clickHandler={clickHandler}
                                text={page === 'index' ? 'Buy' : 'List'}
                                parameter={houseData}
                            />
                        </div>
                    ) : null
                }
            </Card.Body>
        </Card>
    );
}