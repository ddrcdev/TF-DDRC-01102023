const OrderAdmin = artifacts.require("OrderAdmin");

contract("OrderAdmin", (accounts) => {
  const adminAddress = accounts[0]; // Dirección del administrador
  const restaurantAddress = accounts[9]; // Dirección del restaurante
  let orderAdminInstance;

  before(async () => {
    orderAdminInstance = await OrderAdmin.deployed();
  });

  it("Debería fallar al registrar un restaurante con un valor diferente de depositAmount", async () => {
    const invalidDepositAmount = web3.utils.toWei("2", "ether"); // Valor diferente de depositAmount

    try {
      // Intento de registro de restaurante con un valor incorrecto
      await orderAdminInstance.registerRestaurant({ from: restaurantAddress, value: invalidDepositAmount });
      assert.fail("El registro de restaurante con un valor incorrecto debería haber fallado");
    } catch (error) {
      assert.include(error.message, "Must deposit exactly depositAmount to register", "El error no coincide con el esperado");
    }
  });

  it("Debería permitir el registro y cierre normal de un restaurante con depositAmount", async () => {
    const depositAmount = web3.utils.toWei("0.1", "ether");

    // Comprobación de saldo antes del registro
    const contractBalanceBeforeRegister = await orderAdminInstance.getContractBalance();

    // Registro de un restaurante con 1 ETH
    await orderAdminInstance.registerRestaurant({ from: restaurantAddress, value: depositAmount });
    const isRestaurantActive = await orderAdminInstance.isRestaurantActive(restaurantAddress);
    assert.isTrue(isRestaurantActive, "El restaurante no se registró correctamente");

    const contractBalanceAfterRegister = await orderAdminInstance.getContractBalance();
    // Comprobación de saldo después del registro
    const suposeAfterRegisteBalance = new web3.utils.BN(contractBalanceBeforeRegister).add(new web3.utils.BN(depositAmount));
    assert.equal(
      contractBalanceAfterRegister.toString(),
      suposeAfterRegisteBalance.toString(),
       "El saldo del contrato después del registro válido no es correcto"
      );
    
    // Cierre del restaurante y comprobación de saldo
    const contractBalanceBeforeClose = await orderAdminInstance.getContractBalance();
    await orderAdminInstance.closeRestaurant(restaurantAddress, { from: adminAddress });
    const isRestaurantClosed = !(await orderAdminInstance.isRestaurantActive(restaurantAddress));
    assert.isTrue(isRestaurantClosed, "El restaurante no se cerró correctamente");
    // Comprobación de saldo después del cierre
    const contractBalanceAfterClose = await orderAdminInstance.getContractBalance();
    const suposeAfterCloseBalance = new web3.utils.BN(contractBalanceBeforeClose).sub(new web3.utils.BN(depositAmount));
    assert.equal(
      suposeAfterCloseBalance.toString(),
      contractBalanceAfterClose.toString(),
      "El saldo del contrato después del cierre no es correcto"
    );
  });

  
  it("No debería permitir el registro del restaurante ya registrado", async () => {
    const depositAmount = web3.utils.toWei("0.1", "ether");
    await orderAdminInstance.registerRestaurant({ from: restaurantAddress, value: depositAmount });
    const contractBalanceBeforeFailedRegistration = await orderAdminInstance.getContractBalance();
    // Intento de registro del mismo restaurante nuevamente
    try {
      
      await orderAdminInstance.registerRestaurant({ from: restaurantAddress, value: depositAmount });
      // Si el registro se realiza sin errores, el test falla
      assert.fail("Se permitió el registro duplicado del restaurante");
    } catch (error) {
      // Comprobamos si el error lanzado es el esperado (revert)
      assert.include(
        error.message,
        "revert",
        "Se esperaba un error 'revert' al intentar registrar el restaurante duplicado"
      );
    }
    // Comprobación de saldo después del intento fallido de registro
    const contractBalanceAfterFailedRegistration = await orderAdminInstance.getContractBalance();
    assert.equal(
      contractBalanceBeforeFailedRegistration.toString(),
      contractBalanceAfterFailedRegistration.toString(),
      "El saldo del contrato después del intento fallido de registro no es correcto"
    );
  });

  it("unregisterRestaurant debería desactivar al restaurante pero no devolver el depósito al usar unregister", async () => {
    const contractBalanceBeforeUnregister = await orderAdminInstance.getContractBalance();
    // Uso de unregister
    await orderAdminInstance.unregisterRestaurant(restaurantAddress, { from: adminAddress });
    const isRestaurantClosed = !(await orderAdminInstance.isRestaurantActive(restaurantAddress));
    assert.isTrue(isRestaurantClosed, "El restaurante no se desactivó correctamente");
    // Comprobación de saldo después de unregister (no debe devolver el depósito)
    const contractBalanceAfterUnregister = await orderAdminInstance.getContractBalance();
    assert.equal(
      contractBalanceBeforeUnregister.toString(),
      contractBalanceAfterUnregister.toString(),
      "El saldo del contrato después de unregister no es correcto"
    );
  });
});
