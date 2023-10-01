const OrderAdmin = artifacts.require("OrderAdmin");
const MealToken = artifacts.require("MealToken"); // Asegúrate de importar el contrato MealToken si aún no lo has hecho

contract("OrderAdmin", (accounts) => {
  const clientAddress = accounts[0];
  const restaurantAddress = accounts[3];
  let orderAdminInstance;
  let mealTokenInstance;
  let fiatAmount = 100; // Monto en FIAT
  let etherAmount = web3.utils.toWei("5", "ether"); // Monto en Ether
  let mealsUsed = 10; // Tokens Meals utilizados
  let mealBonus = 0; // Bonus en tokens Meals

  before(async () => {
    orderAdminInstance = await OrderAdmin.deployed();
    mealTokenInstance = await MealToken.deployed(); // Asegúrate de tener el contrato MealToken desplegado
  });

  it("No debería permitir a un restaurante crear un pedido", async () => {
    // Creación de un pedido por parte del cliente
    try {
      // Intento de creación de un pedido desde la dirección del restaurante (lo cual no debería ser permitido)
      await orderAdminInstance.createPurchase(
        restaurantAddress,
        fiatAmount,
        etherAmount,
        mealsUsed,
        mealBonus,
        { from: restaurantAddress }
      );
      // Si la operación se realiza correctamente, la prueba falla
      assert.fail("La creación de un pedido desde la dirección del restaurante debería haber fallado");
    } catch (error) {
      // Verifica que la excepción sea lanzada con un mensaje adecuado
      assert.include(error.message, "Only customer can call this function", "La excepción lanzada no es la esperada");
    }
  });

  let orderId;
  it("Debería permitir a un cliente crear un pedido", async () => {
    // Crear un pedido desde la dirección del cliente
    const result = await orderAdminInstance.createPurchase(
      restaurantAddress,
      fiatAmount,
      etherAmount,
      mealsUsed,
      mealBonus,
      { from: clientAddress }
    );

    // Verificar que se haya emitido el evento PurchaseCreated
    assert.equal(result.logs[0].event, "PurchaseCreated", "El evento PurchaseCreated no se emitió correctamente");

    // Obtener el ID del pedido creado
    orderId = result.logs[0].args.orderId.toNumber();

    // Verificar que los detalles del pedido se almacenaron correctamente
    const purchase = await orderAdminInstance.purchases(restaurantAddress, orderId);

    assert.equal(purchase.customer, clientAddress, "La dirección del cliente en el pedido no es correcta");
    assert.equal(purchase.amountToPay_Fiat, fiatAmount, "El monto en FIAT en el pedido no es correcto");
    assert.equal(purchase.amountToPay_Ether.toString(), etherAmount, "El monto en Ether en el pedido no es correcto");
    assert.equal(purchase.usedMealsTokens, mealsUsed, "Los tokens Meals utilizados en el pedido no son correctos");
    assert.equal(purchase.mealBonus, mealBonus, "El bonus en tokens Meals en el pedido no es correcto");
    assert.equal(purchase.status, "Deposit pending", "El estado del pedido no es correcto");
  });

  it("Debería permitir a un cliente depositar los fondos del pedido", async () => {
    const contractBalanceBeforeDeposit = await orderAdminInstance.getContractBalance();
    const clientBalanceBefore = await web3.eth.getBalance(clientAddress);

    // Verificar que el pedido se ha creado correctamente
    const purchase = await orderAdminInstance.purchases(restaurantAddress, orderId);
    assert.equal(purchase.status, "Deposit pending", "El estado del pedido no es correcto");

    // Depositar los fondos por parte del cliente
    await orderAdminInstance.deposit(restaurantAddress, orderId, {
      from: clientAddress,
      value: etherAmount,
    });

    const suposeAfterDepositBalance = new web3.utils.BN(contractBalanceBeforeDeposit).add(
      new web3.utils.BN(etherAmount)
    );
    
    // Verifica el balance del contrato
    const contractBalanceAfterDeposit = await orderAdminInstance.getContractBalance();
    assert.equal(
      suposeAfterDepositBalance.toString(),
      contractBalanceAfterDeposit.toString(),
      "El balance del contrato no se actualizó correctamente"
    );

    // Verificar que el estado del pedido se actualiza correctamente
    const updatedPurchase = await orderAdminInstance.purchases(restaurantAddress, orderId);
    assert.equal(
      updatedPurchase.status,
      "Waiting restaurant aproval",
      "El estado del pedido no se actualizó correctamente"
    );
    
    // Verificar que el balance del cliente se actualiza correctamente
    const clientBalanceAfter = await web3.eth.getBalance(clientAddress);
    const suposeAfterClientBalance = new web3.utils.BN(clientBalanceBefore).sub(new web3.utils.BN(etherAmount));
    assert.equal(
        suposeAfterClientBalance.toString(),
        clientBalanceAfter.toString(),
        "El balance del cliente no se actualizó correctamente"
      );
  });

  it("Debería permitir a un restaurante aprobar un pedido pendiente de su aprobación", async () => {
    // Verificar que el pedido se ha creado correctamente
    const purchaseBefore = await orderAdminInstance.purchases(restaurantAddress, orderId);
    assert.equal(
      purchaseBefore.status,
      "Waiting restaurant aproval",
      "El estado del pedido no es correcto"
    );

    // Aprobar el pedido por parte del restaurante utilizando el orderId guardado en el bloque anterior
    await orderAdminInstance.approveOrder(orderId, { from: restaurantAddress });

    // Verificar que el estado del pedido se actualiza correctamente
    const purchaseAfter = await orderAdminInstance.purchases(restaurantAddress, orderId);
    assert.equal(
      purchaseAfter.status,
      "Waiting customer aproval",
      "El estado del pedido no se actualizó correctamente"
    );
  });

  it("Debería permitir a un cliente confirmar un pedido pendiente de su aprobación", async () => {
    // Verificar que el estado del pedido se actualiza correctamente
    const purchaseBefore = await orderAdminInstance.purchases(restaurantAddress, orderId);
    assert.equal(
      purchaseBefore.status,
      "Waiting customer aproval",
      "El estado del pedido no se actualizó correctamente"
    );

    // Aprobar el pedido por parte del restaurante
    await orderAdminInstance.approvePurchase(restaurantAddress, orderId, { from: clientAddress });

    // Verificar que el estado del pedido se actualiza correctamente
    const purchaseAfter = await orderAdminInstance.purchases(restaurantAddress, orderId);
    assert.equal(
      purchaseAfter.status,
      "Purchase ready to close",
      "El estado del pedido no se actualizó correctamente"
    );
  });

  it("Debería permitir a un restaurante cerrar y cobrar un pedido", async () => {
    // Verificar que el estado del pedido se actualiza correctamente
    const purchaseBefore = await orderAdminInstance.purchases(restaurantAddress, orderId);
    assert.equal(
      purchaseBefore.status,
      "Purchase ready to close",
      "El estado del pedido no se actualizó correctamente"
    );

    // Aprobar el pedido por parte del restaurante
    const contractBalanceBeforeDeposit = await orderAdminInstance.getContractBalance();


    await orderAdminInstance.closeAndPay(orderId, { from: restaurantAddress });
    const purchaseAfter = await orderAdminInstance.purchases(restaurantAddress, orderId);

    // Verificar actualización de balances
    const suposeAfterDepositBalance = new web3.utils.BN(contractBalanceBeforeDeposit).sub(
      new web3.utils.BN(etherAmount)
    );
    const contractBalanceAfterDeposit = await orderAdminInstance.getContractBalance();
    assert.equal(
      suposeAfterDepositBalance.toString(),
      contractBalanceAfterDeposit.toString(),
      "El balance del contrato no se actualizó correctamente"
    );

    // Verificar que el estado del pedido se actualiza correctamente
    assert.equal(purchaseAfter.status, "Closed", "El estado del pedido no se actualizó correctamente");
  });
});
