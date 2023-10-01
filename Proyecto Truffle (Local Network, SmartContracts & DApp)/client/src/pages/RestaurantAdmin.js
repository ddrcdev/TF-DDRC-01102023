import React, { useState, useEffect } from 'react';
import '../styles/RestaurantAdmin.css'
import { useWeb3Context as Web3Context } from "../contexts/ContextWeb3";
import Web3 from 'web3';


const RestaurantAdmin = () => {
  const {
    accountAddress,
    nativeTokenSymbol,
    orderAdminInstance,
    truncateAddress,
  }
  = Web3Context();

  const [restaurantOrders, setRestaurantOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState();
  const [metrics,setMetrics] = useState([]);
  const [refreshTables,setRefreshTables] = useState(0); //contador utilizado como trigger para los useEffect
 
  //////////////////////////////////////
  // onClick para mostrar una comanda //
  const showOrder = async (orderId) => {
    try {
      if (orderAdminInstance !== undefined) {
        const direccionRestaurante = accountAddress; // Actualiza esto con la dirección real
        const purchase = await orderAdminInstance.methods.purchases(direccionRestaurante, orderId).call();        
        const actual_purchase = [
          orderId, 
          purchase[0],
          parseFloat(Web3.utils.fromWei(purchase[1],'ether')).toFixed(2),
          parseFloat(Web3.utils.fromWei(purchase[2],'ether')),
          parseFloat(Web3.utils.fromWei(purchase[3],'ether')).toFixed(2),
          parseFloat(Web3.utils.fromWei(purchase[7],'ether')).toFixed(2),
          purchase[8]]
        setSelectedOrder(actual_purchase);
        console.log(actual_purchase)
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  /////////////////////////////////////
  // onClick para aprobar un pedido //
  const aprobarPedido = async (orderId) => {
    try {
      if (orderAdminInstance !== undefined) {
        const result = await orderAdminInstance.methods.approveOrder(orderId).send({from:accountAddress, value:0});        
        console.log("Aprobación de pedido:", result)
        setRefreshTables(refreshTables+1);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  ////////////////////////////////////////////////////////
  // onClick para cerrar y cobrar fondos de una comanda //
  const cerrarPedido = async (orderId) => {
    console.log("OrderId",typeof Web3.utils.toWei(orderId,'ether'))

    try {
      if (orderAdminInstance !== undefined) {
        const result = await orderAdminInstance.methods.closeAndPay(orderId).send({from:accountAddress, value:0});        
        console.log("Cierre de pedido:", result)
        setRefreshTables(refreshTables+1);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };


  /////////////////////////////////////////////////////////////////////////
  // UseEffect para Orders abiertas a partir de eventos PurchaseCreated //
  useEffect(() => {
    // Escucha los eventos emitidos por el contrato inteligente
    const fetchPurchaseEvents = async () => {
      if (accountAddress !== '') {
        if (orderAdminInstance !== undefined) {
          const direccionRestaurante = accountAddress; // Actualiza esto con la dirección real
          const events = await orderAdminInstance.getPastEvents('PurchaseCreated', {
            filter: { restaurant: direccionRestaurante },
            fromBlock: 0,
            toBlock: 'latest'
          });

          const ordersList = await Promise.all(events.map(async event => {
            const orderId = Web3.utils.fromWei(event.returnValues.orderId,'wei');
            const purchase = await orderAdminInstance.methods.purchases(direccionRestaurante, orderId).call();
            const isClosed = purchase.isClosed;
            const status = purchase.status;
            return [orderId, truncateAddress(event.returnValues.customer),  status, purchase,isClosed];
          }));
          setRestaurantOrders(ordersList);
        }
      } else {
        setRestaurantOrders();
        setSelectedOrder();
        setMetrics();
    }};

    fetchPurchaseEvents();
  }, [accountAddress, orderAdminInstance,truncateAddress, refreshTables]);

  ///////////////////////////////////////////////////////
  // UseEffect para Metricas iterando sobre orderList //
  useEffect(() => {
    // Otro useEffect para iterar sobre la lista de pedidos
    if ( restaurantOrders.length > 0) {

      let countClosedOrder = 0;
      let countCustomers = new Set(); // Usar un conjunto para contar valores únicos
      let mealsGenerated = 0;
      let mealsUsed = 0;
      let totalFIAT = 0;
      let totalETH = 0;
  
      restaurantOrders.forEach(async (order) => {
        try {
          const isClosed = order[4];
          if (isClosed === true) {
            countClosedOrder++;
          }
          mealsGenerated += parseFloat(Web3.utils.fromWei(order[3].mealBonus,'ether'))
          mealsUsed += parseFloat(Web3.utils.fromWei(order[3].usedMealsTokens,'ether'))
          totalFIAT += parseFloat(Web3.utils.fromWei(order[3].amountToPay_Fiat,'ether'))
          totalETH += parseFloat(Web3.utils.fromWei(order[3].amountToPay_Ether,'ether'))

          // Registrar clientes únicos
          countCustomers.add(order[1]);  
          // Continuar con otros cálculos según sea necesario
        } catch (error) {
          console.error("Error fetching element at position 5:", error);
        }
      });
  
      // Obtener la cantidad de clientes únicos
      const uniqueCustomersCount = countCustomers.size;

      // Continuar con otros cálculos según sea necesario
      setMetrics([countClosedOrder, uniqueCustomersCount,mealsGenerated, mealsUsed, totalFIAT, totalETH])
    }
  }, [accountAddress,restaurantOrders, orderAdminInstance, refreshTables]);

  
  return (
    <div>   
      <div className='order-traker-container'>
        <div className='table-container'>
          <h2>Pedidos Activos:</h2>
          <table className='tracking-table'>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Comanda</th>
                <th>Aprobar</th>
                <th>Cerrar</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {restaurantOrders.map((order) => (
                <tr key={order[0]}>
                  <td>{order[0]}</td>
                  <td>{order[1]}</td>
                  <td>
                    <button onClick={() => showOrder(order[0])}>Mostrar</button>
                  </td>
                  
                  <td>
                  {order[2] === "Waiting customer aproval" || order[2] === "Purchase ready to close" || order[2] === "Closed" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                      </svg>
                    ) : <button onClick={() => aprobarPedido(order[0])}>Aprobar</button>}
                  </td>
                  <td>
                  {order[2] === "Purchase ready to close" ? (
                        <button onClick={() => cerrarPedido(order[0])}>Cerrar</button>
                      ) : order[2] === "Closed" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
                          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                          <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                        </svg>
                      ) : null}
                  </td>
                  <td>{order[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedOrder && (
        <div className='popup'>
          <div className='popup-content'>
            <h2>Order Details</h2>
            <p>ID: {selectedOrder[0]}</p>
            <p>Customer: {selectedOrder[1]}</p>
            <p>Configuración de pago: </p>
            <hr/>
            <p>Cantidad FIAT: {selectedOrder[2]} </p>
            <p>Cantidad {nativeTokenSymbol}: {selectedOrder[3]} </p>
            <p>Meals Utilizados: {selectedOrder[4]} </p>
            <p>Meals generados: {selectedOrder[5]} </p>
            <button onClick={() => setSelectedOrder(null)}>Close</button>
          </div>
        </div>
      )}
        <div className='metrics-container'>
          <table className='tracking-table'>
            <thead>
              <tr>
                <th>Closed Orders</th>
                <th>Number of customer</th>
                <th>MEALS generated</th>
                <th>MEALS used by customer</th>
                <th>Total FIAT</th>
                <th>Total ETH</th>
              </tr>
            </thead>
            <tbody>
              <td>{metrics[0]}</td>
              <td>{metrics[1]}</td>
              <td>{!metrics[2] ? '': metrics[2].toFixed(2)}</td>
              <td>{metrics[3]} MEALS</td>
              <td>{!metrics[2] ? '': metrics[4].toFixed(2)}$</td>
              <td>{!metrics[2] ? '': metrics[5].toFixed(7)}{nativeTokenSymbol}</td>
            </tbody>
          </table>
        </div>
    </div>
  );
};

// Rest of the CSS remains the same

export default RestaurantAdmin;
