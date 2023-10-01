import { useState } from 'react';
import { useWeb3Context as Web3Context} from '../../contexts/ContextWeb3';
import '../../styles/Web3.css';
import { Link } from 'react-router-dom';

const MenuWeb3 = () => {
  const [menu, setMenu] = useState(false);
  const {
    isWalletConnected,
    truncatedAddress,
    accountBalanceEth,
    accountBalanceWei,
    balanceContractWei,
    balanceContractEther,
    showInEth,
    chainId,
    nativeTokenName,
    nativeTokenSymbol,
    connectWallet,
    disconnectWallet,
    toggleBalanceDisplay,
    handleNetworkChange,
  } = Web3Context();

  const toggleMenu = () => {
    setMenu(!menu);
  };

  

  return (
    <header className={`web3 ${menu ? '' : 'web3-collapsed'}`}>
      <h1 className="web3-h1">
        <span className={`web3-title ${menu ? '' : 'hide'}`}>SmartChef</span>
        <button onClick={toggleMenu} className={`web3-button-svg ${menu ? '' : 'web3-button-svg-collapsed'}`}>
          <svg className="web3-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path
              fillRule="evenodd"
              d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
            />
          </svg>
        </button>
      </h1>

      {menu && (
        <>
          {!isWalletConnected ? (
            <button onClick={connectWallet} className={`walletButton ${menu ? '' : 'hide'}`}>
              Connect MetaMask
            </button>
          
          ) : (
            <div>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <button onClick={disconnectWallet} className={`walletButton ${menu ? '' : 'hide'}`}>
                  Disconnect Wallet
                </button>
              </Link>
              <div className={`web3-body ${menu ? '' : 'hide'}`}>
              <div className="web3-label-container">
                  <div className="web3-label">Account:</div>
                  <div className="web3-data">
                    <span>{truncatedAddress} </span>
                  </div>
                </div>
                <div className="web3-label-container">
                  <div className="web3-label">Connection Status:</div>
                  <div className="web3-data">
                    <span className='connected'>Connected </span>
                  </div>
                </div>
                <div className="web3-label-container">
                  <div className="web3-label">Actual Chain:</div>
                  <div className="web3-data">
                    <span>{chainId}</span>
                  </div>
                </div>
                <div className="web3-label-container">
                  <div className="web3-label">Select Network:</div>
                </div>
                <div className="web3-list">
                    <select id="networkSelect" onChange={handleNetworkChange} value={chainId || ''}>
                      <option value="8045">Local Host "8045"</option>
                      <option value="80001">Mumbai TNet</option>
                      <option value="5">Goerli TNet</option>
                      <option value="97">Binance SC TNet</option>
                    </select>
                </div>
                <div className="web3-label-container">
                  <div className="web3-label">Token Name: </div>
                  <div className="web3-data">
                    <label>{nativeTokenName}</label>
                  </div>
                </div>
                <div className="web3-label-container">
                  <div className="web3-label">Token Symbol: </div>
                  <div className="web3-data">
                    <label>{nativeTokenSymbol}</label>
                  </div>
                </div>
                <div className="web3-label-container">
                  <div className="web3-label">Balance: </div>
                  <div className="web3-data">
                  {showInEth ? `Ether` : `Wei`}
                  <button onClick={toggleBalanceDisplay} className={`unit-change`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-repeat" viewBox="0 0 16 16">
                      <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                      <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
                    </svg>
                  </button>
                  </div>
                </div>
                <div className="web3-amount">
                  <label> {showInEth ? `${accountBalanceEth}` : `${accountBalanceWei}`} </label>
                </div>
              </div>
              <div className="web3-label-container">
              <div className="web3-label">Balance in contract: </div>
                  <div className="web3-data">
                  {showInEth ? `Ether` : `Wei`}
                  <button onClick={toggleBalanceDisplay} className={`unit-change`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-repeat" viewBox="0 0 16 16">
                      <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                      <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
                    </svg>
                  </button>
                  </div>
                </div>
                <div className="web3-amount">
                  <label> {showInEth ? `${balanceContractEther}` : `${balanceContractWei}`} </label>
                </div>                  
            </div>
          )}
        </>
      )}
    </header>
  );
};

export default MenuWeb3;
