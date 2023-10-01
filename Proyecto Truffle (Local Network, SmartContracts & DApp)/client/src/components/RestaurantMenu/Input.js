import React, { useContext } from "react";
import { Context } from "../../contexts/Context";

export default function Input({name,price}) {

  const [shop_cart, updateCart] = useContext(Context);
  const itemPrice = price
  const count = shop_cart[name]


  const handleIncrement = () => {
    const newCount = count + 1;
    if (!shop_cart.hasOwnProperty(name)) {
      updateCart(name, 1, itemPrice); // Asegúrate de pasar itemPrice como tercer argumento
    } else {
      updateCart(name, newCount, itemPrice); // Asegúrate de pasar itemPrice como tercer argumento
    }
  };
  
  const handleDecrement = () => {
    const newCount = count - 1;
    if (newCount < 0) {
      updateCart(name, 0, itemPrice); // Asegúrate de pasar itemPrice como tercer argumento
    } else {
      updateCart(name, newCount, itemPrice); // Asegúrate de pasar itemPrice como tercer argumento
    }
  };



  return (
    <div className="input-container">
      <button className="decrement-button" onClick={handleDecrement}>
        -
      </button>
      <button className="increment-button" onClick={handleIncrement}>
        +
      </button>

    </div>
  );
}
