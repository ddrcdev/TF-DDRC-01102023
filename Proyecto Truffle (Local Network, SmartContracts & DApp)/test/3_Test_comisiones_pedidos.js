const OrderAdmin = artifacts.require("OrderAdmin");
const MealToken = artifacts.require("MealToken");

contract("OrderAdmin", (accounts) => {
    const clientAddress = accounts[6];
    const restaurantAddress = accounts[1];
    let orderAdminInstance;
    let mealTokenInstance;

    before(async () => {
        orderAdminInstance = await OrderAdmin.deployed();
        mealTokenInstance = await MealToken.deployed();
    });

    it("Test de comisiones: obtener estadísticos de 5 ciclos completos de pedido", async () => {
        const transactions = [
            "Crear pedido",
            "Depositar",
            "AprobarOrder",
            "AprobarCliente",
            "CerrarPedido",
            "Total Fee Cliente",
            "Total Fee Restaurante",
            "Total Order Fee"
        ];

        let fees = {
            "Crear pedido": [],
            "Depositar": [],
            "AprobarOrder": [],
            "AprobarCliente": [],
            "CerrarPedido": [],
            "Total Fee Cliente": [],
            "Total Fee Restaurante": [],
            "Total Order Fee": [],
        };

        for (let i = 0; i < 5; i++) { // Ciclo para 5 pedidos
            const fiatAmount = 50;
            const etherAmount = web3.utils.toWei("0.003", "ether");
            const mealsUsed = 0;
            const mealBonus = 5;

            const transactionHashes = [];

            const create_purchase = await orderAdminInstance.createPurchase(
                restaurantAddress,
                fiatAmount,
                etherAmount,
                mealsUsed,
                mealBonus,
                { from: clientAddress }
            );
            const orderId = create_purchase.logs[0].args.orderId.toNumber();

            transactionHashes.push(create_purchase.tx);

            // Depositar los fondos en el pedido
            const depositTx = await orderAdminInstance.deposit(restaurantAddress, orderId, {
                from: clientAddress,
                value: etherAmount,
            });
            transactionHashes.push(depositTx.tx);

            // Aprobar el pedido por parte del restaurante
            const approveOrderTx = await orderAdminInstance.approveOrder(orderId, {
                from: restaurantAddress,
            });
            transactionHashes.push(approveOrderTx.tx);

            // Aprobar la compra por parte del cliente
            const approvePurchaseTx = await orderAdminInstance.approvePurchase(restaurantAddress, orderId, {
                from: clientAddress,
            });
            transactionHashes.push(approvePurchaseTx.tx);

            // Cerrar y pagar el pedido por parte del restaurante
            const closeResult = await orderAdminInstance.closeAndPay(orderId, { from: restaurantAddress });
            transactionHashes.push(closeResult.tx);

            const totalFee = web3.utils.toBN(0);
            const totalFeeClient = web3.utils.toBN(0);
            const totalFeeRestaurant = web3.utils.toBN(0);

            // Calcular y registrar comisiones
            for (let j = 0; j < transactionHashes.length; j++) {
                const transaction = await web3.eth.getTransaction(transactionHashes[j]);
                const gasPrice = web3.utils.toBN(transaction.gasPrice);
                const gasUsed = web3.utils.toBN((await web3.eth.getTransactionReceipt(transactionHashes[j])).gasUsed);
                const feePaid = gasPrice.mul(gasUsed);
                fees[transactions[j]].push(feePaid);

                // Actualizar totales
                totalFee.iadd(feePaid);

                if (["Crear pedido", "Depositar", "AprobarCliente"].includes(transactions[j])) {
                    totalFeeClient.iadd(feePaid);
                } else {
                    totalFeeRestaurant.iadd(feePaid);
                }
            }
            fees["Total Fee Cliente"].push(totalFeeClient);
            fees["Total Fee Restaurante"].push(totalFeeRestaurant);
            fees["Total Order Fee"].push(totalFee);
        }

        // Imprimir matriz de comisiones
        const formattedFees = {};
        for (const transactionType in fees) {
            formattedFees[transactionType] = fees[transactionType].map(value => web3.utils.fromWei(value.toString(), "ether"));
        }
        console.log("Matriz de comisiones:");
        console.table(formattedFees);

        // Definir un objeto para almacenar los resultados
        let totalFeePaid_array = {
            "Crear pedido": {
                "Mínima comisión pagada": "",
                "Máxima comisión pagada": "",
                "Comisión promedio pagada": "",
                "Varianza promedio": "",
            },
            "Depositar": {
                "Mínima comisión pagada": "",
                "Máxima comisión pagada": "",
                "Comisión promedio pagada": "",
                "Varianza promedio": "",
            },
            "AprobarOrder": {
                "Mínima comisión pagada": "",
                "Máxima comisión pagada": "",
                "Comisión promedio pagada": "",
                "Varianza promedio": "",
            },
            "AprobarCliente": {
                "Mínima comisión pagada": "",
                "Máxima comisión pagada": "",
                "Comisión promedio pagada": "",
                "Varianza promedio": "",
            },
            "CerrarPedido": {
                "Mínima comisión pagada": "",
                "Máxima comisión pagada": "",
                "Comisión promedio pagada": "",
                "Varianza promedio": "",
            },
            "Total Fee Cliente": {
                "Mínima comisión pagada": "",
                "Máxima comisión pagada": "",
                "Comisión promedio pagada": "",
                "Varianza promedio": "",
            },
            "Total Fee Restaurante": {
                "Mínima comisión pagada": "",
                "Máxima comisión pagada": "",
                "Comisión promedio pagada": "",
                "Varianza promedio": "",
            },
            "Total Order Fee": {
                "Mínima comisión pagada": "",
                "Máxima comisión pagada": "",
                "Comisión promedio pagada": "",
                "Varianza promedio": "",
            },

        };

        // Calcular estadísticas sobre comisiones para cada tipo de transacción
        for (const transaction of transactions) {
            const maxFeePaid = web3.utils.fromWei(Math.max(...fees[transaction]).toString(), "ether");
            const minFeePaid = web3.utils.fromWei(Math.min(...fees[transaction]).toString(), "ether");
            const feePaidValues = fees[transaction].map(fee => web3.utils.fromWei(fee.toString(), "ether"));

            // Calcular la media (promedio) de las comisiones pagadas
            const averageFeePaid = web3.utils.fromWei(
                fees[transaction].reduce((a, b) => a.add(b)).div(web3.utils.toBN(fees[transaction].length)).toString(),
                "ether"
            );

            // Calcular la varianza
            const squaredDifferences = feePaidValues.map(fee => Math.pow(fee - averageFeePaid, 2));
            const variance = squaredDifferences.reduce((a, b) => a + b) / squaredDifferences.length;

            // Almacena los resultados en totalFeePaid_array
            totalFeePaid_array[transaction]["Máxima comisión pagada"] = maxFeePaid;
            totalFeePaid_array[transaction]["Mínima comisión pagada"] = minFeePaid;
            totalFeePaid_array[transaction]["Comisión promedio pagada"] = averageFeePaid;
            totalFeePaid_array[transaction]["Varianza promedio"] = variance;
        }

        // Imprimir los resultados totales
        console.log("Resultados totales:");
        console.table(totalFeePaid_array);
    });
});
