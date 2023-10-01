
import { Link } from "react-router-dom";
import "../styles/Home.css"; // Estilos para el componente Home
import RestaurantButton from "../components/RestaurantAdminButton"
import ProjectDocsButton from "../components/ReadDocsButton"
import chef from "./logos/chef.gif"

const restaurants = [
  {
    name: "The Veggie Garden",
    logo: require("./logos/Logo_veg.png"),
    path: "/veggie_garden", // Ruta para el restaurante Moonrise Dinner
  },
  {
    name: "La Brasa Brava",
    logo: require("./logos/Logo_meat.png"),
    path: "/brasa_brava", // Ruta para el restaurante Restaurante de Carne
  },
  {
    name: "Cafe Delicias",
    logo: require("./logos/Logo_coffee.png"),
    path: "/cafe_delicias", // Ruta para el restaurante Cafetería
  },
];


const Home = ({ currentRestaurant, handleShowRestaurant }) => {
  return (
    <div className="portal">
      <h3 className="surf-text">Smart Chef</h3>
      <div className={`gif-container-logo`}>
          <img
            src={chef}
            alt="GIF animado"
            className={`gif-logo`}
          />
        </div>
      {!currentRestaurant ? (  
        <div>
        <div className="circle-container">
          {restaurants.map((restaurant) => (
            <div
              className="restaurant"
              key={restaurant.name}
              onClick={() => handleShowRestaurant(restaurant)}
            >
              <Link to={restaurant.path}>
              <div className="circle">
                <img src={restaurant.logo} alt={restaurant.name}/>
              </div>
              </Link>
            </div>
          ))}
        </div>
        
        <div className="button-container">
          <RestaurantButton />
        </div>
        <div className="button-container">
          <ProjectDocsButton />
        </div>
      </div>
      ) : (
        <div>
          {currentRestaurant.logo}
          <h1>{currentRestaurant.name}</h1>
        </div>
      )}
    </div>
  );
};

export default Home;