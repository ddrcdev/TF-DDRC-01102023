import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useWeb3Context as Web3Context } from "../../contexts/ContextWeb3";
import { RestaurantAddressBook } from '../Web3ConnectionMenu/Networks';
import Web3 from 'web3';
import "../../styles/Cart.css"

function PayButton() {
  const {
    isWalletConnected,
    accountAddress,
    accountMealBalance,
    AmountWithFiat,
    AmountWithEther,
    bonusGenerated,
    orderAdminInstance,
    useMealBalance,
    handlePayConfig,
    handleBonusGenerated,
    setActualPurchase
  } = Web3Context();

  const [isReadyToPay, setIsReadyToPay] = useState(false);
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState();

  const handlePayOrder = async () => {
    try {
      const restaurantAddress = RestaurantAddressBook[currentPath];
      let usedMealsForPurchase;
      if (useMealBalance && accountMealBalance >= 10) {
        usedMealsForPurchase = 10; // Establecer en 0 si useMealBalance es falso
      } else {
        usedMealsForPurchase = 0; // Establecer según balance de usuario
      };
      const _amountFiat = Web3.utils.toWei(AmountWithFiat, 'ether');
      const _amountEther = Web3.utils.toWei(AmountWithEther, 'ether');
      const _meals =  Web3.utils.toWei(usedMealsForPurchase, 'ether');
      const _mealBonus = Web3.utils.toWei(bonusGenerated, 'ether');

      //
      const receipt = await orderAdminInstance.methods.createPurchase(
        restaurantAddress,
        _amountFiat,
        _amountEther,
        _meals,
        _mealBonus,
      ).send({from: accountAddress});
  
      console.log('Pedido confirmada:', receipt);
      const order_id = await orderAdminInstance.methods.orderIds(restaurantAddress).call();

      console.log(order_id)

      const deposit = await orderAdminInstance.methods.deposit(
        restaurantAddress,
        order_id,
      ).send({from: accountAddress, value:_amountEther});

      const actual_purchase = [
        order_id,
        restaurantAddress, 
        accountAddress,
        AmountWithFiat,
        AmountWithEther,
        usedMealsForPurchase,
        bonusGenerated,
        "Waiting restaurant aproval"];

      console.log("Approve deposit", deposit, actual_purchase)

      setActualPurchase(actual_purchase);

      handleBonusGenerated(undefined);
      handlePayConfig(undefined,undefined);


    } catch (error) {
      console.error('Error:', error);
    }
  };

  //Efecto para habilitar botón de pago
  useEffect(() => {
    // Comprobar si ambos valores están presentes y no son nulos
    setIsReadyToPay(AmountWithEther !== null && AmountWithFiat !== null && isWalletConnected);
  }, [AmountWithEther, AmountWithFiat, isWalletConnected]);

  useEffect(() => {
    // Actualizar el estado currentPath con la ruta actual
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  return (
    <div>
      <button className={`pay-order-button ${!isReadyToPay ? 'ready' : ''}`} onClick={handlePayOrder} disabled={!isReadyToPay}>
        Confirm & Deposit
      </button>
    </div>

  );
}

export default PayButton;
