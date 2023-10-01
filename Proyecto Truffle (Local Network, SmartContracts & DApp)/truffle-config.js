require('dotenv');

module.exports = {

  networks: {
    //Red ganache
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "5777",       // Any network (default: none)
    },
    
    dashboard: {
      host: "127.0.0.1",
      port: 24012,
      network_id: "*"
    },

    polygon_mumbai_testnet: {
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },

  },

  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.19"
    }
  },
  plugins: [
    'truffle-plugin-verify'
  ],
  api_keys: {
    polygonscan: process.env.POLYGON_APY_KEY,
  },
};
