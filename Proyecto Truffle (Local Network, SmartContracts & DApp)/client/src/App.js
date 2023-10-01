// LIBRERÍAS
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// IMPORTACIÓN DE PROVEEDORES DE CONTEXTO
import { Provider } from "./contexts/Context";
import { Web3Provider } from "./contexts/ContextWeb3"; 

// PAGES
import MenuWeb3 from "./components/Web3ConnectionMenu/MenuWeb3";
import Home from './pages/Home';
import CafeDelicias from './pages/CafeDelicias';
import BrasaBrava from './pages/BrasaBrava';
import VeggieGarden from "./pages/VeggieGarden";
import RestaurantAdmin from "./pages/RestaurantAdmin";

const App = () => {
  // Manejo de Páginas
  const [, setCurrentRestaurant] = useState();
  const handleShowRestaurant = (restaurant) => {
    setCurrentRestaurant(restaurant);
  };

  return (
    <Web3Provider>
      <Provider>
        <Router>
          <div>
            <MenuWeb3 />
            <Routes>
              <Route path="/admin_restaurant" element={<RestaurantAdmin/>}/>
              <Route path="/brasa_brava" element={<BrasaBrava />} />
              <Route path="/veggie_garden" element={<VeggieGarden />} />
              <Route path="/cafe_delicias" element={<CafeDelicias />} />
              <Route
                path="/"
                element={<Home handleShowRestaurant={handleShowRestaurant} />}
              />
            </Routes>
          </div>
        </Router>
      </Provider>
    </Web3Provider>
  );
};

export default App;

