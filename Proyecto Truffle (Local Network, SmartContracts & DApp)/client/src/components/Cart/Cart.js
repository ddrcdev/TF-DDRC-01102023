import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { Context } from "../../contexts/Context";
import { useWeb3Context as Web3Context } from "../../contexts/ContextWeb3";
import "../../styles/Cart.css";
import { useLocation } from 'react-router-dom';
import Total from "./Total"; 
import PayButton from "./PayButton";
import OrderTracking from "./OrderTracking";

export default function Cart() {

  //Contextos
  const [shop_cart, ,cart_prices, orderActive, handleActiveOrder,setItems,setItemPrices] = useContext(Context);
  const { accountAddress, actualUserPurchase, _restaurantPath,setRestaurantPath} = Web3Context();

  // States y variables
  const isCartEmpty = Object.keys(shop_cart).length === 0;

  const location = useLocation();

  useEffect(() => {      
    if (location.pathname !== _restaurantPath) {
      setItems({});
      setItemPrices({});
    } 
    setRestaurantPath(location.pathname);

  },[location.pathname, setRestaurantPath,_restaurantPath,setItems,setItemPrices]);

  useEffect(() => {
    if (actualUserPurchase.length !==0 && actualUserPurchase[7] !== "Purchase ready to close" &&  actualUserPurchase[7] !== "Closed") {
      handleActiveOrder(true);
    } else {
      handleActiveOrder(false);
    }
  },[actualUserPurchase, accountAddress,handleActiveOrder]);

  return (
    <div className={`cart-container`}>
      {orderActive ? (
        // Mostrar OrderTracking si activeOrder es verdadero
        <OrderTracking />        
      ) : (
        // Mostrar el contenido actual si activeOrder es falso
        <div>
          <h2>Carrito de Compras</h2>
          <div>
            {isCartEmpty ? (
              <div>
                El carrito está vacío. <Link to="/">Ir de compras</Link>
              </div>
            ) : (
              <div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Items</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(shop_cart).map((itemName, name) => (
                      <tr key={name}>
                        <td>{itemName}</td>
                        <td className="centered">{shop_cart[itemName]}</td>
                        <td className="right-aligned">
                          <span className="currency">
                            {parseFloat(Object.values(cart_prices)[name]).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Total />
                <PayButton />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};