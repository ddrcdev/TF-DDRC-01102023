const networks = {
  "1": {
    "chainId": "0x1",
    "chainName": "Ethereum Mainnet",
    "rpcUrls": ["https://mainnet.infura.io/v3/d2668152aca44a92bc9b8e4d7e685899"],
    "nativeCurrency": {
      "name": "Ether",
      "symbol": "ETH",
      "decimals": 18
    },
    "conversionRate": 1849.34,  
  },
  "5": {
    "chainId": "0x5",
    "chainName": "Goerli Testnet",
    "rpcUrls": ["https://goerli.infura.io/v3/d2668152aca44a92bc9b8e4d7e685899"],
    "nativeCurrency": {
      "name": "Goerli Ether",
      "symbol": "GOETH",
      "decimals": 18
    },
    "conversionRate": 1849.34,  
  },
  "80001": {
    "chainId": "0x13881",
    "chainName": "Mumbai Testnet",
    "rpcUrls": ["https://endpoints.omniatech.io/v1/matic/mumbai/public"],
    "nativeCurrency": {
      "name": "MATIC",
      "symbol": "MATIC",
      "decimals": 18
    },
    "conversionRate": 1.22,
  },
  "137": {
    "chainId": "0x89",
    "chainName": "Polygon Mainnet",
    "rpcUrls": ["https://rpc-mainnet.maticvigil.com"],
    "nativeCurrency": {
      "name": "MATIC",
      "symbol": "MATIC",
      "decimals": 18
    },
    "conversionRate": 1.22,

  },
  "56": {
    "chainId": "0x38",
    "chainName": "Binance Smart Chain",
    "rpcUrls": ["https://bsc-dataseed.binance.org"],
    "nativeCurrency": {
      "name": "BNB",
      "symbol": "BNB",
      "decimals": 18
    },
    "conversionRate": 342.21,
  },
  "97": {
    "chainId": "0x61",
    "chainName": "Binance Smart Chain Testnet",
    "rpcUrls": ["https://data-seed-prebsc-1-s1.binance.org:8545"],
    "nativeCurrency": {
      "name": "BNB",
      "symbol": "TBNB",
      "decimals": 18
    },
    "conversionRate": 342.21,
  },
  "8045": {
    "chainId": "0x539",
    "chainName": "Local Host 8045",
    "rpcUrls": ["http://127.0.0.1:8045"],
    "nativeCurrency": {
      "name": "ETH",
      "symbol": "ETH",
      "decimals": 18
    },
    "conversionRate": 1849.34,    
  },
};


const RestaurantAddressBook = 
  {
    "/veggie_garden": "0x73EC13927Df3A50c7Ea768f30f187C002C1Ee9C0",
    "/brasa_brava": "0x9aCf8812EB94d403DE8037e6D15C2D4457016CAF",
    "/cafe_delicias": "0x6C8ab9Fd63c7e7b08AF92ED657d9cF713f86676F",
  }


export { networks, RestaurantAddressBook };


