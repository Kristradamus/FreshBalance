import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./FavoritesComponent.css";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../protectionComponents/AuthContext.jsx";
import ConfirmationToast from "../reusableComponents/ConfirmationToast.jsx";
import axios from "axios";

export default function FavoritesComponent() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [isRemoving, setIsRemoving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserFavorites = async () => {
      if (isAuthenticated && user) {
        try {
          const token = localStorage.getItem("authToken");
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/favorites`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          );

          setFavorites(
            response.data.map((product) => {
              if (product.image && product.image.data) {
                return {
                  ...product,
                  imageUrl: `data:image/jpeg;base64,${product.image.data.toString("base64"
                  )}`,
                };
              }
              return product;
            })
          );
        } 
        catch (error) {
          console.error("Error fetching user favorites:", error);
          setToast({
            show:true,
            message:t("profile.favorites.error"),
            type:"error"
          })
        }
      } 
      else {
        setFavorites([]);
      }
    };
    fetchUserFavorites();
  }, [isAuthenticated, user, t]);

  const handleRemoveProduct = async(productId) => {
    if(!isAuthenticated || isRemoving){
      return;
    }
    
    setIsRemoving(true);
    try{
      const token = localStorage.getItem("authToken");
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/favorites/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      
      setFavorites(favorites.filter(product => product.id !== productId));
      
      setToast({
        show: true,
        message: t("profile.favorites.removeSuccess"),
        type: "success"
      });
    }
    catch(error) {
      console.error("Error removing favorite:", error);
      setToast({
        show: true,
        message: t("profile.favorites.removeError"),
        type: "error"
      });
    }
    finally {
      setIsRemoving(false);
    }
  };
 
  return (
    <div className="profileContentAriafavorites">
      <ConfirmationToast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({show:false, message:"", type:""})}/>
      <div className="favoritesMainTitleBox">
        <h2 className="favoritesMainTitle">
          {t("profile.favorites.mainTitle")}:&nbsp;
        </h2>
        <h3 className="favoritesMainTitleNumber">
          {favorites.length === 1 ? (
            <h3 className="favoritesMainTitleNumber">{favorites.length} {t("profile.product")}</h3>
          ) : (
            <h3 className="favoritesMainTitleNumber">{favorites.length} {t("profile.products")}</h3>
          )}
        </h3>
      </div>
      <div className="favoritesList">
        {favorites.map((product) => (
          <div key={product.id} className="favoriteItem">
            {product.imageUrl ? (
              <div className="favoritesImageBox" onClick={() => navigate(`/singleProductPage/${product.id}`)}>
                <img src={product.imageUrl} alt={product.name} className="favoriteImage"/>
              </div>
            ) : (
              <div className="noImageBox" onClick={() => navigate(`/singleProductPage/${product.id}`)}>
                <p><i class="fa-solid fa-camera"></i> <span>{t("profile.favorites.noImage")}</span></p>
              </div>
            )}
            <div className="favoriteInfo">
              <h3 className="favoriteName">{product.name}</h3>
              <p className="favoritePrice">{product.price} {t("profile.lv")}.</p>
              <div className={`stockInfo ${product.stock > 0 ? "available" : "soldOut"}`}>
                {product.stock > 0 ? (product.stock === 1 ? (
                  <p><i className="fa-solid fa-check"></i> {t("profile.favorites.only")} {product.stock} {t("profile.favorites.isLeft")}</p>
                ) : (
                  <p><i className="fa-solid fa-check"></i> {t("profile.favorites.only")} {product.stock} {t("profile.favorites.areLeft")}</p>
                )) : (
                  <p><i className="fa-solid fa-xmark"></i>{t("profile.favorites.noProductsLeft")}</p>
                )}
              </div>
            </div>
            <div className="favoritesButtons">
              <button className="favoritesRemoveBtn" onClick={() => handleRemoveProduct(product.id)} disabled={isRemoving}>
                <i class="fa-solid fa-trash"></i> {t("profile.favorites.remove")}
              </button>
              <button className="favoritesAddToCartBtn">
                <i className="fa-solid fa-cart-shopping"></i> {t("profile.favorites.addToCart")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}