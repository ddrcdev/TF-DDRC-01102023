import React, {useState} from 'react';
import "../styles/styles.css";
import { Link } from 'react-router-dom';
import Cart from '../components/Cart/Cart'
import Logo from "./logos/Logo_meat.png";
import Mains from "../components/RestaurantMenu/Mains";
import Extras from "../components/RestaurantMenu/Extras";
import data_meat from './data_shop/data_meat.json';
import RestaurantButton from "../components/RestaurantAdminButton"
import ProjectDocsButton from "../components/ReadDocsButton"
import { RestaurantAddressBook } from '../components/Web3ConnectionMenu/Networks';


const {mains,sides,drinks} = data_meat;


const BrasaBrava = () => {
  const direccion = RestaurantAddressBook["/brasa_brava"];
  const [copiado, setCopiado] = useState(false);

  const copiarDireccion = () => {
    setCopiado(true);
  };

  const handleMouseEnter = () => {
    // Cambiar el color y subrayar cuando el cursor está encima
    document.getElementById('copiar-address').style.color = 'blue';
    document.getElementById('copiar-address').style.textDecoration = 'underline';
    document.getElementById('copiar-address').style.cursor = 'pointer';
  };

  const handleMouseLeave = () => {
    // Restaurar el estilo cuando el cursor se va
    document.getElementById('copiar-address').style.color = '#473d72';
    document.getElementById('copiar-address').style.textDecoration = 'none';

  };

  return (
        <div className="menu">
          <div>
            <Link to="/">Volver a Home</Link>
          </div>
          <div className="circle logo-centered">
            <img src={Logo} alt={"La Brasa Brava"}/>
          </div>
          <div>
          <h1 className='rest-address-label'>Address del restaurante:</h1>
          <h2
            id='copiar-address'
            className={`rest-address ${copiado ? 'copiado' : ''}`}
            onClick={copiarDireccion}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {direccion.substring(0, 6) + '...' + direccion.substring(direccion.length - 4)}
          </h2>
        </div> 
         
          <Mains meals={mains} />
          <aside className="aside">
            <Extras type="Acompañantes" items={sides} />
            <Extras type="Bebidas" items={drinks} />
          </aside>
          <div className="cart-container">
            <Cart />
          </div>
          <div className="button-container">
          <RestaurantButton />
          </div>
          <div className="button-container">
            <ProjectDocsButton />
          </div>
          {copiado && (
          <div className='popup'>
            <div className='popup-content'>
              <h2>La Brasa Brava Address</h2>
              <h4>{direccion}</h4>
              <button onClick={() => setCopiado(false)}>Close</button>
            </div>
          </div>
        )}
        </div>
  );
}
export default BrasaBrava;