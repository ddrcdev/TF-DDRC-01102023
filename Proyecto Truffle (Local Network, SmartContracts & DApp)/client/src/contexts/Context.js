import React, { useState } from "react";

export const Context = React.createContext();

export const Provider = (props) => {
  const [shop_cart, setItems] = useState({});
  const [cart_prices, setItemPrices] = useState({});
  const [orderActive,setOrderActive] = useState(false);

  const handleActiveOrder = (status) => {
    setOrderActive(status)
  };

  const updateCart = (name, count, price) => {
    const itemPrice = price;
    const key = name;
    // Update the items object with the new values
    const amount = Number.isNaN(Number(count)) ? 0 : Number(count);

    // Filter out items with quantity 0 before updating the state
    const updatedCart = { ...shop_cart };
    const updatedPrices = { ...cart_prices };

    if (amount > 0) {
      updatedCart[key] = amount;
      updatedPrices[key] = itemPrice * amount;
    } else {
      delete updatedCart[key];
      delete updatedPrices[key];
    }

    setItems(updatedCart);
    setItemPrices(updatedPrices);
  };

  return (
    <Context.Provider value={[shop_cart, updateCart, cart_prices, orderActive, handleActiveOrder,setItems,setItemPrices ]}>
      {props.children}
    </Context.Provider>
  );
};
