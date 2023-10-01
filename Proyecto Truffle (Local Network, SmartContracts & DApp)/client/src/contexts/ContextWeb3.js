import React, { createContext, useState, useEffect, useContext } from 'react';
import Web3 from 'web3';
import {networks, RestaurantAddressBook} from '../components/Web3ConnectionMenu/Networks'
import TokenJSON from "../contracts/MealToken.json"
import OrderAdminJSON from "../contracts/OrderAdmin.json"

const Web3Context = createContext();

const Web3Provider = ({ children }) => {
  // Conexión Web3
  const [isWalletConnected, setWalletConnected] = useState(false);
  const [accountAddress, setAccountAddress] = useState('');
  const [truncatedAddress,setTruncatedAddress] = useState('');
  const [chainId, setChainId] = useState('');
  const [nativeTokenSymbol, setNativeTokenSymbol] = useState('');
  const [nativeTokenName, setNativeTokenName] = useState('');
  const [provider,setProvider] = useState();
  const [isRestaurant, setIsRestaurant] = useState(false);

  // Instancias de contratos
  const [tokenInstance, setTokenInstance] = useState();
  const [orderAdminInstance,setOrderAdminInstance] = useState();
  const [balanceContractWei,setBalanceContractWei] = useState();
  const [balanceContractEther,setBalanceContractEther] = useState();

  // Balances
  const [accountBalanceEth, setAccountBalanceEth] = useState();
  const [accountBalanceWei, setAccountBalanceWei] = useState();
  const [accountMealBalance, setAccountMealBalance] = useState();
  const [showInEth, setShowInEth] = useState(true);
  const [conversionRate,setConversionRate] = useState();

  // Purchase config
  const [AmountWithFiat, setAmountWithFiat] = useState();
  const [AmountWithEther, setAmountWithEther] = useState();
  const [bonusGenerated,setBonusGenerated] = useState();
  const [useMealBalance,setUseMealBalance] = useState(false);

  // Actual Purchase
  const [_restaurantPath,setRestaurantPath] = useState('');
  const [actualUserPurchase,setActualPurchase] = useState([]);
  
  //CONECT/DISCONECT WALLET
  const connectWallet = async () => {
    try {
      if (!isWalletConnected) {
        // Check if MetaMask is installed
        if (window.ethereum) {
          // Check if the detected wallet is MetaMask
          if (window.ethereum.isMetaMask) {
            // Request user to connect with MetaMask
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accountAdress = accounts[0];
            const truncatedAddress = truncateAddress(accountAdress);
            const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
            setChainId(currentChainId);
            setAccountAddress(accountAdress); // Truncate and save address
            setTruncatedAddress(truncatedAddress); // Truncate and save address
            // You can now interact with MetaMask using 'provider'
            setWalletConnected(true);
  
            const provider = new Web3(window.ethereum);
            setProvider(provider);
            
          } else {
            // Display a message indicating that only MetaMask is supported
            alert('Please use MetaMask to connect.');
          }
        } else {
          console.log('MetaMask is not installed.');
        }
      } else {
        // Disconnection logic goes here (if needed)
        setWalletConnected(false);
        setAccountAddress('');
        setChainId(undefined);
      }

      
      console.log()
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setAccountAddress('');
    setTruncatedAddress('');
    setChainId('');
    setNativeTokenSymbol('');
    setNativeTokenName('');
    setProvider();
    setIsRestaurant(false);
    setTokenInstance();
    setOrderAdminInstance();
    setAccountBalanceEth();
    setAccountBalanceWei();
    setAccountMealBalance();
    setBalanceContractWei();
    setBalanceContractEther();
    setShowInEth(true);
    setConversionRate();
    setAmountWithFiat();
    setAmountWithEther();
    setBonusGenerated();
    setUseMealBalance(false);
    setRestaurantPath('');
    setActualPurchase([]);
  };

  //SWITCH NETWORK
  const switchNetwork = async (newChainId) => {
    try {
      if (window.ethereum && window.ethereum.isMetaMask) {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

        if (currentChainId === `0x${newChainId.toString(16)}`) {
          console.log('Already on the desired network.');
          return;
        }
        
        let selectedChainId = newChainId
        if (selectedChainId === "31337" || selectedChainId === "5777" || selectedChainId === "1337") {
          selectedChainId = "8045"
          return;
        }

        const selectedNetwork = networks[selectedChainId];
        if (!selectedNetwork) {
          console.error('Selected network not found in the JSON.');
          return;
        }
  
        try {
          const params = {
            chainId: selectedNetwork.chainId,
          }

          // Intentar cambiar a la cadena después de agregarla
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [params],
          });
          setChainId(selectedNetwork.chainId)
          console.log('Switched to the desired network.');
        } catch (error) {
          console.error('Error switching network:', error);
        }
      } else {
        alert('Please use MetaMask to connect.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };



  const toggleBalanceDisplay = () => {
    setShowInEth((prev) => !prev);
  };

  const handleNetworkChange = (event) => {
    const newChainId = event.target.value;
    switchNetwork(newChainId);
  };
 
  const truncateAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handlePayConfig = (FIAT,Ether) => {
    setAmountWithFiat(FIAT);
    setAmountWithEther(Ether);
  };

  const handleBonusGenerated = (Bonus) => {
    setBonusGenerated(Bonus);
  };

  // Cambio de instancia si de contratos si se cambia la network
  useEffect(() => {
    if (isWalletConnected){
      const updateContractInstances = async () => {
        if (chainId !== undefined && chainId !== '') {
          let selectedChainId = chainId;
      
          if (chainId === "8045") {
            selectedChainId = "5777";
          }

          if (!TokenJSON.networks[selectedChainId]) {
            console.error('Este cadena no está disponible');
            return;
          } else {

          await provider.eth.requestAccounts(); // Request user account access
      
          const TokenAddress = TokenJSON.networks[selectedChainId].address;
          const TokenABI = TokenJSON.abi;
      
          const OrderAdminAddress = OrderAdminJSON.networks[selectedChainId].address;
          const OrderAdminABI = OrderAdminJSON.abi;
      
          const tokenInstance = new provider.eth.Contract(TokenABI, TokenAddress);
          setTokenInstance(tokenInstance);
      
          const orderAdminInstance = new provider.eth.Contract(OrderAdminABI, OrderAdminAddress);
          setOrderAdminInstance(orderAdminInstance);


          //Fetch ContractBalance
          const balanceContractWei = await orderAdminInstance.methods.getContractBalance(OrderAdminAddress).call();
          const balanceContractEther = Web3.utils.fromWei(balanceContractWei, 'ether');

          setBalanceContractWei(balanceContractWei);
          setBalanceContractEther(balanceContractEther);
          console.log(`El balance de Ether del contrato en la dirección ${balanceContractWei} es: ${balanceContractEther} ETH`);
        }}
      };
      updateContractInstances();
    }
    
  }, [isWalletConnected,chainId,provider]);  

  
  useEffect(() => {
    if (isWalletConnected) {
      // Fetch account balance
      const fetchAccountBalance = async () => {
        try {
            //GET USER ETHER BALANCE
          //GET USER ETHER BALANCE
          const getEtherBalance = async () => {
            try{   
              // Get the balance in wei
              const balanceInWei = await provider.eth.getBalance(accountAddress);
              // Convert balance to Ether
              const balanceInEther = provider.utils.fromWei(balanceInWei, 'ether');

              // Update account balance state
              setAccountBalanceEth(balanceInEther);
              setAccountBalanceWei(balanceInWei);

            } catch (error) {
              console.error('Error obteniendo balance:', error);
            }
          }
          // Get the balance in wei
          getEtherBalance();
        } catch (error) {
          console.error('Error fetching account balance:', error);
        }
      };
      fetchAccountBalance();
    }
  }, [isWalletConnected, accountAddress,provider,actualUserPurchase,chainId]); // Agregado getEtherBalance aquí

  useEffect(() => {
    if (isWalletConnected) {
      // Fetch chain params
      const fetchChainParams = async () => {
        try {
            //GET CHAIN PARAMS
            const getChainParams = async () => {
              try{
                // Get the chainId
                const chainId = await provider.eth.net.getId();
                const chainIdNum = chainId.toString();
                let selectedChainId = chainIdNum; // Variable que se utilizará más adelante

                if (chainIdNum === '31337' || selectedChainId === "5777" || selectedChainId === "1337") {
                  selectedChainId = "8045"; // Cambiar el valor de la variable en caso de que se cumpla la condición
                } 
                setChainId(selectedChainId); // Usar la variable seleccionada
                
                // Obtén la configuración de red correspondiente al chainIdNum
                const selectedNetwork = networks[selectedChainId];
                if (!selectedNetwork) {
                  console.error('Selected network not found in the JSON.');
                  return;
                } else {
                  // Get Native Token Name from networks.json
                  const tokenName = selectedNetwork.nativeCurrency.name
                  const tokenSymbol = selectedNetwork.nativeCurrency.symbol
                  const conversionRate = selectedNetwork.conversionRate
                  setNativeTokenName(tokenName);
                  setNativeTokenSymbol(tokenSymbol);
                  setConversionRate(conversionRate);
                }
              } catch (error) {
                console.error('Error obteniendo parametros de cadena:', error);
              }
            }

          // Get the params
          getChainParams();
        } catch (error) {
          console.error('Error fetching account balance:', error);
        }
      };
      fetchChainParams();
    }
  }, [isWalletConnected, accountAddress,provider, chainId]); 

  useEffect(() => {
    if (isWalletConnected) {
      // Fetch chain params
      const  fetchMealBalance = async () => {
        try {
          const getUserMealBalance = async () => {
              try {
                  const userMealBalance = await tokenInstance.methods.balanceOf(accountAddress).call();
                  const ammountMeals =  Web3.utils.fromWei(userMealBalance, 'ether');
                  setAccountMealBalance(ammountMeals)
              } catch (error) {
                  console.error("Error getting user meal balance:", error);
                  return 0; // Manejo de errores
              }
          };
          // Get the params
          getUserMealBalance();
        } catch (error) {
          console.error('Error fetching account balance:', error);
        }
      };
      fetchMealBalance();
    }
  }, [isWalletConnected, accountAddress,tokenInstance,chainId]);  


  useEffect(() => {
    const checkIsRestaurant = async () => {
      try { if (accountAddress !== undefined && orderAdminInstance !== undefined){
        const isRestaurant = await orderAdminInstance.methods.isRestaurantActive(accountAddress).call();
        setIsRestaurant(isRestaurant);
      }
      } catch (error) {
        console.error("Error checking if address is a restaurant:", error);
      }
    };
  
    checkIsRestaurant();
  }, [accountAddress, orderAdminInstance,_restaurantPath,chainId]);

  useEffect(() => {
    const handleActiveOrder = async (_restaurant) => {
      if (orderAdminInstance !== undefined && _restaurant !== undefined) {
        try {
          const _restaurant = RestaurantAddressBook[_restaurantPath];
          const receipt_id = await orderAdminInstance.methods.activeUserIds(_restaurant,accountAddress).call();
          const order_id = parseInt(receipt_id,10);
  
          if (order_id === 0) {
            return
          }
          
          const receipt_purchase = await orderAdminInstance.methods.purchases(_restaurant, order_id).call();

          if (receipt_purchase.customer !== "0x0000000000000000000000000000000000000000" && receipt_purchase.isClosed === false) {
            const actual_purchase = [
              order_id,
              _restaurant, 
              receipt_purchase[0],
              parseFloat(Web3.utils.fromWei(receipt_purchase[1],'ether')).toFixed(2),
              parseFloat(Web3.utils.fromWei(receipt_purchase[2],'ether')),
              parseFloat(Web3.utils.fromWei(receipt_purchase[3],'ether')).toFixed(2),
              parseFloat(Web3.utils.fromWei(receipt_purchase[7],'ether')).toFixed(2),
              receipt_purchase[8]]
  
            setActualPurchase(actual_purchase);

          } else {

            setActualPurchase([]);
          }
        } catch (error) {
          console.error("Error al realizar la consulta:", error);
        }
      }
    };
    handleActiveOrder(_restaurantPath);
  },[accountAddress,orderAdminInstance, _restaurantPath,accountMealBalance, chainId])

  return (
    <Web3Context.Provider
      value={{
        isWalletConnected,
        accountAddress,
        truncatedAddress,
        accountBalanceEth,
        accountBalanceWei,
        accountMealBalance,
        showInEth,
        chainId,
        AmountWithFiat,
        AmountWithEther,
        bonusGenerated,
        nativeTokenName,
        nativeTokenSymbol,
        conversionRate,
        tokenInstance,
        orderAdminInstance,
        useMealBalance,
        isRestaurant,
        actualUserPurchase,
        balanceContractWei,
        balanceContractEther,
        _restaurantPath,
        connectWallet,
        disconnectWallet,
        toggleBalanceDisplay,
        handleNetworkChange,
        switchNetwork,
        truncateAddress,
        handlePayConfig,
        setUseMealBalance,
        handleBonusGenerated,
        setRestaurantPath,
        setActualPurchase
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

const useWeb3Context = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3Context must be used within a Web3Context.Provider');
  }
  return context;
};

export { Web3Provider, useWeb3Context };
