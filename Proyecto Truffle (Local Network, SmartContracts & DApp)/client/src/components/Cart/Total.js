import React, { useContext , useState, useEffect} from "react";
import { Context } from "../../contexts/Context";
import { useWeb3Context as Web3Context } from "../../contexts/ContextWeb3";
import "../../styles/Cart.css";

export default function Total() {
  const [, , cart_prices] = useContext(Context);
  const {
    isWalletConnected,
    accountMealBalance,
    AmountWithFiat,
    AmountWithEther,
    bonusGenerated,
    nativeTokenName,
    nativeTokenSymbol,
    conversionRate,
    useMealBalance,
    handlePayConfig,
    setUseMealBalance,
    handleBonusGenerated
  } = Web3Context();

  const [selectedFIATValue, setselectedFIATPer] = useState(null);
  const subtotal = Object.values(cart_prices).reduce((acc, price) => acc + price, 0);

  function handlePayFIAT(event) {
    const value = parseFloat(event.target.value); // Convertir el valor del botón a un número decimal

    // Subtotal con/sin descuento
    let subtotal_final = subtotal;

    if (useMealBalance === true && accountMealBalance >= 10) {
      subtotal_final -= 10;
    }
    // Cantidad FIAT 
    let FIAT_Value = subtotal_final * value/100;
    if (FIAT_Value <= 0) {
      subtotal_final -= FIAT_Value;
      FIAT_Value = 0;
    }
    const Ether_Value = (subtotal_final/conversionRate) * (100-value)/100;
    
    handlePayConfig(FIAT_Value, Ether_Value);
    setselectedFIATPer(value);
  }

  function handlePayEther(event) {
    const value = parseFloat(event.target.value); // Convertir el valor del botón a un número decimal

    // Subtotal con/sin descuento
    let subtotal_final = subtotal;
    if (useMealBalance === true && accountMealBalance >= 10) {
      subtotal_final -= 10;
    }
    // Cantidad FIAT 
    let FIAT_Value = subtotal_final * (100-value)/100;
    if (FIAT_Value <= 0) {
      subtotal_final -= FIAT_Value;
      FIAT_Value = 0;
    }
    const Ether_Value = (subtotal_final/conversionRate) * value/100;

    handlePayConfig(FIAT_Value, Ether_Value);
    setselectedFIATPer(100-value);
  }

  const toggleButton = () => {
      setUseMealBalance(!useMealBalance);  
  };

  useEffect(() => {
    handleBonusGenerated((subtotal*0.05).toFixed(2));
    }, [subtotal, handleBonusGenerated, selectedFIATValue]);

  useEffect(() => {

    if ((useMealBalance && subtotal-10 <= 0) || selectedFIATValue === null) {
      handlePayConfig(0,0);
    } else {
      const calculatedFiat = useMealBalance && accountMealBalance >= 10
      ? (subtotal - 10) * selectedFIATValue / 100
      : subtotal * selectedFIATValue / 100;

    const calculatedEther = useMealBalance && accountMealBalance >= 10
      ? ((subtotal - 10) * conversionRate) * (100 - selectedFIATValue) / 100
      : (subtotal * conversionRate) * (100 - selectedFIATValue) / 100;

    handlePayConfig(calculatedFiat, calculatedEther);
    }
  }, [useMealBalance, subtotal, selectedFIATValue, handlePayConfig, conversionRate, accountMealBalance]);

  return (
    
    <div className="subtotal-container">
      <hr/>
      <div className="label-container">
        <div className="label">Subotal:</div>
        <div className="amount">
          <span className="currency">{subtotal.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="label-container">
        <div className="label">Bonus generated:</div>
        <div className="amount">
          <span>MEALS {bonusGenerated}</span>
        </div>
      </div>

      <h2 className="config-label">Configura el pago:</h2>
      <div className="pay-container">
        <div className="pay-config">
          <div className="pay-option">
            <div className="pay-label">Usar MEALS disponibles:</div>
            <div className="button-bar">
            <div className={`toggle-button ${useMealBalance ? 'active' : ''}`} onClick={toggleButton}>
                {useMealBalance ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-toggle-on" viewBox="0 0 16 16">
                    <path d="M5 3a5 5 0 0 0 0 10h6a5 5 0 0 0 0-10H5zm6 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-toggle-off" viewBox="0 0 16 16">
                    <path d="M11 4a4 4 0 0 1 0 8H8a4.992 4.992 0 0 0 2-4 4.992 4.992 0 0 0-2-4h3zm-6 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8zM0 8a5 5 0 0 0 5 5h6a5 5 0 0 0 0-10H5a5 5 0 0 0-5 5z"/>
                  </svg>
                )}
              </div>
            </div>
          </div>
          <div className="meal-balance">  Meals disp.  {accountMealBalance ? parseFloat(accountMealBalance).toFixed(2):''}</div>

          <div className="pay-option">
            <div className="pay-label">FIAT:</div>
            <div className="button-bar">
            <button
                  className={`option-button ${selectedFIATValue === 25 ? 'selected' : ''}`}
                  onClick={handlePayFIAT}
                  value="25"
                >
                  25%
                </button>
                <button
                  className={`option-button ${selectedFIATValue === 50 ? 'selected' : ''}`}
                  onClick={handlePayFIAT}
                  value="50"
                >
                  50%
                </button>
                <button
                  className={`option-button ${selectedFIATValue === 75 ? 'selected' : ''}`}
                  onClick={handlePayFIAT}
                  value="75"
                >
                  75%
                </button>
                <button
                  className={`option-button ${selectedFIATValue === 100 ? 'selected' : ''}`}
                  onClick={handlePayFIAT}
                  value="100"
                >
                  Max
                </button>
              </div>
          </div>

          <div className="pay-option">
          <div className="pay-label"> {nativeTokenSymbol || "ETH"}:</div>
              <div className="button-bar">
                <button
                  className={`option-button ${selectedFIATValue === 75 ? 'selected' : ''}`}
                  onClick={handlePayEther}
                  value="25"
                >
                  25%
                </button>
                <button
                  className={`option-button ${selectedFIATValue === 50 ? 'selected' : ''}`}
                  onClick={handlePayEther}
                  value="50"
                >
                  50%
                </button>
                <button
                  className={`option-button ${selectedFIATValue === 25 ? 'selected' : ''}`}
                  onClick={handlePayEther}
                  value="75"
                >
                  75%
                </button>
                <button
                  className={`option-button ${selectedFIATValue === 0 ? 'selected' : ''}`}
                  onClick={handlePayEther}
                  value="100"
                >
                  Max
                </button>
              </div>      
          </div>
          
          <div className="pay-subtotal">
            {isWalletConnected ? (
              <>
                <div className="label-container">
                  <div className="pay-label">Subtotal:</div>
                  <div className="amount currency">
                  <span>
                    {useMealBalance && accountMealBalance >=10? subtotal-10 <= 0? 0 : subtotal.toFixed(2)-10 : subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="label-container">
                  <div className="pay-label">MEALS utilizados:</div>
                  <div className="amount currency">
                    <span>{useMealBalance  && accountMealBalance >=10? -10 : 0}</span>
                  </div>
                </div>
                <hr className="hr"></hr>
                <div className="label-container">
                  <div className="pay-label">Total FIAT:</div>
                  <div className="amount currency">
                    <span>{accountMealBalance ? parseFloat(AmountWithFiat).toFixed(2) :''}</span>
                  </div>
                </div>

                <div className="label-container">
                  <div className="pay-label">Tasa conversión {nativeTokenSymbol}/USD:</div>
                  <span className="amount"> {conversionRate} </span>
                </div>
                <div className="label-container">
                  <div className="pay-label">Total {nativeTokenName}:</div>
                  <div className="amount">
                    <span>{accountMealBalance ? parseFloat(AmountWithEther).toFixed(5): ''} {nativeTokenName} </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="pay-label">Conecte una billetera!</div>
            )}
          </div>
        </div>
    </div>
  </div>
  );
}
