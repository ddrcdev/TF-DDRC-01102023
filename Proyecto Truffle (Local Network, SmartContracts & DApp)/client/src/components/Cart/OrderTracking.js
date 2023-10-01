import React, { useState,useEffect, useContext } from "react";
import Web3 from "web3";
import "../../styles/Cart.css"
import cooking_gif from "./logos-tracker/cooking.gif";
import waiting_rest_gif from "./logos-tracker/recipe-book.gif";
import checkout from "./logos-tracker/checkout.gif"
import { useWeb3Context as Web3Context } from "../../contexts/ContextWeb3";
import { Context } from "../../contexts/Context"

const OrderTracking = () => {
  const { accountAddress, actualUserPurchase, truncateAddress, nativeTokenSymbol, orderAdminInstance, setActualPurchase} = Web3Context();
  const [status, setStatus] = useState();
  const [truncatedAddress,setRestTruncAddress] = useState();
  const [, , , , handleActiveOrder ] = useContext(Context);

  const handleApprovePurchase = async () => {
    try {
      console.log(actualUserPurchase)
      await orderAdminInstance.methods.approvePurchase(actualUserPurchase[1], actualUserPurchase[0].toString()).send({from: accountAddress, value: 0});
      setActualPurchase([]);
      setStatus();
      handleActiveOrder(false);
    } catch (error) {
      console.error('Error:', error);

    }
  };

  useEffect(() => {
    // Define la función handleOrderStatus
    const handleOrderStatus = () => {
      if (actualUserPurchase.length !== 0) {
        setStatus(actualUserPurchase[7])
        const trunc_address = truncateAddress(actualUserPurchase[1]);
        setRestTruncAddress(trunc_address);
         
      }
    };
    // Llama a la función handleOrderStatus
    handleOrderStatus();
  }, [actualUserPurchase, status, truncateAddress]);
  
  return (
    <div className="order-tracking">
      <h2>Order Tracking</h2>
      <hr></hr>
      <h3>Restaurant Address: {actualUserPurchase.length !== 0 ? truncatedAddress:''} </h3>
      <h3>Your Order_id : {actualUserPurchase.length !== 0? parseFloat(Web3.utils.fromWei(actualUserPurchase[0],'wei')):''}</h3>
      <h3>Pay Configuration:</h3>
      <table className="tracking-table">
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Cantidad</th>
          </tr>        
        </thead>
        <tbody>
            <tr>
              <td>Total FIAT:</td>
              <td>{actualUserPurchase.length !== 0 ? actualUserPurchase[3]:''} $</td>
            </tr>
            <tr>
              <td>Total {nativeTokenSymbol}:</td>
              <td>{actualUserPurchase.length !== 0 ? actualUserPurchase[4]:''}</td>
            </tr>
            <tr>
              <td>MEALS utilizados:</td>
              <td>{actualUserPurchase.length !== 0 ? -actualUserPurchase[5]:''} MEALS</td>
            </tr>
            <tr>
              <td>MEALS generados:</td>
              <td>+{actualUserPurchase.length !== 0 ? actualUserPurchase[6]:''} MEALS</td>
            </tr>
          </tbody>
      </table>
      <div className="order-status-container">
        <h3>Order Status:</h3>
        <div className={`gif-container ${status === "Waiting restaurant aproval" ? "" : "frozen"}`}>
          <p>Esperando confirmación del restaurante</p>
          <img
            src={waiting_rest_gif}
            alt="GIF animado"
            className={`gif`}
          />
        </div>
        <div className={`gif-container ${status === "Waiting customer aproval" ? "" : "frozen"}`}>
          <p>Cocinando tu pedido, buen provecho!</p>
          <img
            src={cooking_gif}
            alt="GIF animado"
            className={`gif`}
          />
        </div>

        <div className="spaced">
          <div className={`gif-container ${status === "Waiting customer aproval" ? "" : "frozen"}`}>
            <p>Confirma tu pedido cuando estés satisfecho</p>
            <img
              src={checkout}
              alt="GIF animado"
              className={`gif`}
            />
          </div>
          <button className={`pay-order-button ${status === "Waiting customer aproval" ? "" : "frozen"}`} onClick={handleApprovePurchase}>
            Approve Purchase!
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;