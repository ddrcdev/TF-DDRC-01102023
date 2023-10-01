// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./MealToken.sol";

contract OrderAdmin {
    MealToken TokenInstance;
    uint256 public depositAmount;

    constructor(address _tokenAddress) {
        TokenInstance = MealToken(_tokenAddress);
        admins[msg.sender] = true;
        depositAmount = 0.1 ether;
    }

    // Estructura para almacenar los detalles de una compra
    struct Purchase {
        address customer;              // Dirección del cliente
        uint256 amountToPay_Fiat;      // Monto a pagar con FIAT
        uint256 amountToPay_Ether;     // Monto a pagar con Ether
        uint256 usedMealsTokens;       // Token Meals utilizados para pagar
        bool isClosed;                 // Indica si la compra está cerrada
        bool isCustomerApproved;       // Indica si el cliente aprobó la compra
        bool isRestaurantApproved;     // Indica si el restaurante aprobó el cierre
        uint256 mealBonus;
        string status;
    }

    // Mapping que relaciona direcciones de restaurantes con sus detalles de compra
    mapping(address => mapping( uint256 => Purchase)) public purchases; //restaurante:id:purchase
    mapping(address => mapping(address => uint256)) public activeUserIds; //restaurante:user: open_order_id    
    mapping(address => uint256) public orderIds; //restaurante:last_id
 

    // Mapping que indica si un restaurante está activo o no
    mapping(address => bool) public activeRestaurants;

    // Gestor de recompensas con token MEAL 
    mapping(address => mapping(address => uint256)) public mealRewards; //user:restaurant:number

    // Mapeo para almacenar el estado de los administradores
    mapping(address => bool) public admins;

    // Modificador para restringir el acceso a funciones solo al administrador
    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admin can call this function");
        _;
    }

    // Modificador para restringir el acceso a funciones solo al cliente del restaurante específico
    modifier onlyCustomer() {
        require(activeRestaurants[msg.sender] == false, "Only customer can call this function");
        _;
    }

    // Modificador para restringir el acceso a funciones solo al restaurante específico
    modifier onlyRestaurant() {
        require(activeRestaurants[msg.sender] == true, "Only restaurant can call this function");
        _;
    }

    // Función para asignar o revocar el rol de administrador
    function setAdmin(address _admin, bool _status) external onlyAdmin {
        admins[_admin] = _status;
    }
    
    function registerRestaurant() external payable {
        require(!activeRestaurants[msg.sender], "Restaurant already registered");
        require(msg.value == depositAmount, "Must deposit exactly depositAmount to register");
        activeRestaurants[msg.sender] = true;

        emit RestaurantRegistered(msg.sender, depositAmount);
    }

    // Función para desactivar un restaurante y devolver los fondos depositados
    function closeRestaurant(address _restaurant) external onlyAdmin {
        require(activeRestaurants[_restaurant], "Restaurant not registered or already closed");

        activeRestaurants[_restaurant] = false;

        // Devolver los fondos al restaurante
        payable(_restaurant).transfer(depositAmount);

        emit RestaurantClosed(_restaurant);
    }

    // Función para desregistrar un restaurante
    function unregisterRestaurant(address _restaurant) external onlyAdmin {
        require(activeRestaurants[_restaurant], "Restaurant not registered");
        activeRestaurants[_restaurant] = false;
        emit RestaurantUnregistered(_restaurant);
    }
    
    // Función para crear una nueva compra
    function createPurchase(address _restaurant, uint256 _amountFIAT, uint256 _amountEther, uint256 _meals, uint256 _mealBonus) external onlyCustomer(){
        require(activeRestaurants[_restaurant], "Restaurant not registered");
        require(activeUserIds[_restaurant][msg.sender] == 0, "You have an order open in this restaurant");
        if (_meals >= 0) {
            require(TokenInstance.balanceOf(msg.sender) >= _meals, "Not MEALS in your balance");
        }

        orderIds[_restaurant] += 1;
        uint256 new_id = orderIds[_restaurant];

        purchases[_restaurant][new_id] = Purchase({
            customer: msg.sender,
            amountToPay_Fiat: _amountFIAT,
            amountToPay_Ether: _amountEther,
            usedMealsTokens: _meals,
            isClosed: false,
            isCustomerApproved: false,
            isRestaurantApproved: false,
            mealBonus:_mealBonus,
            status: 'Deposit pending'
        });

        activeUserIds[_restaurant][msg.sender] = new_id;

        // Llamar a la función deposit para que el cliente deposite el monto necesario
        emit PurchaseCreated(msg.sender, _restaurant, new_id);
    }

    // Función para que el cliente deposite el monto necesario en el contrato
    function deposit(address _restaurant, uint256 order_id) public payable onlyCustomer() {
        Purchase storage purchase = purchases[_restaurant][order_id];

        require(purchase.customer != address(0), "The order id does not exists");
        require(!purchase.isClosed, "Your order is already closed");
        require(purchase.customer == msg.sender,"You do not order this purchase");
        require(keccak256(abi.encodePacked(purchase.status)) == keccak256(abi.encodePacked('Deposit pending')), "Deposit is done");
        require(msg.value == purchase.amountToPay_Ether, "Amount sent must be equal to amountToPay");

        purchase.status = 'Waiting restaurant aproval';
    }

    // Función para que el restaurante apruebe el cierre
    function approveOrder(uint256 order_id) external onlyRestaurant() {
        Purchase storage purchase = purchases[msg.sender][order_id];

        require(purchase.customer != address(0), "The order id does not exists");
        require(!purchase.isClosed, "Your order is already closed");
        require(!purchase.isRestaurantApproved, "The order is already approved by restaurant");

        purchase.isRestaurantApproved = true;
        purchase.status = 'Waiting customer aproval';
        
        emit PurchaseApprovedByRestaurant(msg.sender,order_id);
    }

    // Función para que el cliente apruebe la compra
    function approvePurchase(address _restaurant, uint256 order_id) external onlyCustomer() {
        Purchase storage purchase = purchases[_restaurant][order_id];

        require(purchase.customer != address(0), "The order id does not exists");
        require(!purchase.isClosed, "Your order is already closed");
        require(purchase.customer == msg.sender,"You do not order this purchase");
        require(!purchase.isCustomerApproved, "The order is already approved by customer");

        purchase.isCustomerApproved = true;
        purchase.status = 'Purchase ready to close';
        emit PurchaseApprovedByCustomer(msg.sender, _restaurant, order_id);
    }

    // Función para cerrar la compra y pagar al restaurante
    function closeAndPay(uint256 order_id) external onlyRestaurant() {
        Purchase storage purchase = purchases[msg.sender][order_id];
        require(purchase.customer != address(0), "The order id does not exists");
        require(purchase.isCustomerApproved, "Customer must approve the closure first");
        require(purchase.isRestaurantApproved, "Restaurant must approve the closure first");
        require(!purchase.isClosed, "Purchase is already closed");

        purchase.isClosed = true;
        purchase.status = 'Closed';

        payable(msg.sender).transfer(purchase.amountToPay_Ether);

        activeUserIds[msg.sender][purchase.customer] = 0;

        // Quemado de tokens Meals
        if (purchase.usedMealsTokens != 0) {
            TokenInstance.burn(purchase.customer, purchase.usedMealsTokens);     
        }
        
        // Actualización de rewards
        mealRewards[purchase.customer][msg.sender] += purchase.mealBonus;

        // Envío de 10 en 10 tokens
        if (mealRewards[purchase.customer][msg.sender] >= 10*10**18) {
            TokenInstance.mint(purchase.customer, 10*10**18); // Mint 10 tokens to the customer
            mealRewards[purchase.customer][msg.sender] = 0;            
            emit TokensMinted(purchase.customer, 10);
        }

        //Eventos
        emit PurchaseClosed(purchase.customer, msg.sender, order_id);
        emit MealRewardsUpdated(purchase.customer, mealRewards[purchase.customer][msg.sender]);
        

    }

    // Función view para verificar si un restaurante está activo
    function isRestaurantActive(address _restaurant) external view returns (bool) {
        return activeRestaurants[_restaurant];
    }

    // Función view para obtener las recompensas de tokens MEAL para un restaurante
    function getMealRewards(address _restaurant) external view returns (uint256) {
        return mealRewards[msg.sender][_restaurant];
    }

    // Función view para verificar si una dirección es administrador
    function isAdmin(address _address) external view returns (bool) {
        return admins[_address];
    }

    // Función view para ver el saldo de Ether del contrato
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    event RestaurantRegistered(address indexed restaurant, uint256 depositAmount);
    event RestaurantUnregistered(address indexed restaurant);
    event RestaurantClosed(address indexed restaurant);
    event PurchaseCreated(address indexed customer, address indexed restaurant, uint256 orderId);
    event PurchaseClosed(address indexed customer, address indexed restaurant, uint256 orderId);
    event PurchaseApprovedByCustomer(address indexed customer, address indexed restaurant, uint256 orderId);
    event PurchaseApprovedByRestaurant(address indexed restaurant, uint256 orderId);
    event MealRewardsUpdated(address indexed customer, uint256 newRewardsBalance);
    event TokensMinted(address indexed customer, uint256 amount);
}
