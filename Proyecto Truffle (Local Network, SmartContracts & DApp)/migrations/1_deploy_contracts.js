const Token = artifacts.require("MealToken");
//const NFT = artifacts.require("NFT");
const OrderAdmin = artifacts.require("OrderAdmin");


module.exports = async (deployer) => {
  // Desplegar el contrato Token
  await deployer.deploy(Token,1000000000000000);
  const tokenInstance = await Token.deployed();
  await tokenInstance.mint("0xb97a88BF1C636f437F0a445c85f4ACC144cd09C8",web3.utils.toWei("100", "ether"))
  console.log(await tokenInstance.balanceOf("0xb97a88BF1C636f437F0a445c85f4ACC144cd09C8"))

  // Desplegar el contrato OrderAdmin, pasando la dirección del contrato Token
  await deployer.deploy(OrderAdmin, tokenInstance.address);
  const orderAdminInstance = await OrderAdmin.deployed();


  const restaurantsAddresses = ["0x73EC13927Df3A50c7Ea768f30f187C002C1Ee9C0",
                                "0x9aCf8812EB94d403DE8037e6D15C2D4457016CAF",
                                "0x6C8ab9Fd63c7e7b08AF92ED657d9cF713f86676F"
                              ]
  for (const restaurantAddress of restaurantsAddresses) { // Usar "of" en lugar de "in"
    try {
      await orderAdminInstance.registerRestaurant({ from: restaurantAddress, value: web3.utils.toWei("0.1", "ether") }); // Cambiar el valor del depósito
      console.log(`Restaurant ${restaurantAddress} registered.`);
    } catch (error) {
      console.error(`Error registering restaurant ${restaurantAddress}:`, error);
    }
  }



  // Otorgar privilegios al contrato OrderAdmin en el contrato Token
  await tokenInstance.addAdmin(orderAdminInstance.address); // Corrección en el nombre de la función
  console.log("OrderAdmin con rol de administrador en Token Contract ")
  
  // Ejemplo de cómo imprimir las direcciones de los contratos desplegados
  console.log("Token Contract Address:", tokenInstance.address);
  console.log("OrderAdmin Contract Address:", orderAdminInstance.address);
};
