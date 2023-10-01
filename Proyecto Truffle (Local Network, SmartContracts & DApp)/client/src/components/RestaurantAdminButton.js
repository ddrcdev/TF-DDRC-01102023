import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/RestaurantAdmin.css';
import { useWeb3Context as Web3Context } from "../contexts/ContextWeb3";

const RestaurantButton = () => {
  const { accountAddress, isRestaurant } = Web3Context();
  const [showUnauthorizedPopup, setShowUnauthorizedPopup] = useState(false);

  const handleClick = async () => {
    console.log("Is rest? :", isRestaurant)
    
    if (isRestaurant === true) {
      // Hacer algo si el usuario es un restaurante autorizado
    } else {
      setShowUnauthorizedPopup(true); // Mostrar el pop-up de acceso no autorizado
    }
  };

  return (
    <div>
      {accountAddress !== undefined ? (
        <Link to={isRestaurant ? "/admin_restaurant" : "#"}>
          <button onClick={handleClick} className={isRestaurant ? "rest-button pulse-button" : "rest-button"}>
            {isRestaurant ? 'Go to Restaurant Admin' : 'Are you a Restaurant?'}
          </button>
        </Link>
      ) : (
        <div className='dropdown'>
          <p>No account detected. Please connect your wallet.</p>
        </div>
      )}
      {showUnauthorizedPopup && (
        <div className='popup'>
          <div className='popup-content'>
            <h2>Unauthorized Access</h2>
            <p>{accountAddress ? "Your account is not authorized as a restaurant." : "Connect your wallet first"}</p>
            <button onClick={() => setShowUnauthorizedPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantButton;
