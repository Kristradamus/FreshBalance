import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./FavoritesComponent.css";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../protectionComponents/AuthContext.jsx";
import ConfirmationToast from "../reusableComponents/ConfirmationToast.jsx";
import LoadingAnimation from "../layout/LoadingAnimation.jsx";
import useRemoveAddHandler from "../reusableComponents/RemoveAddItems.jsx";
import axios from "axios";

 const FavoritesComponent = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [isRemoving, setIsRemoving] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const {handleAddToCart, isAddingToCart} = useRemoveAddHandler();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchUserFavorites = async () => {
      if (isAuthenticated) {
        try {
          setIsLoading(true)
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/favorites`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
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
        finally{
          setIsLoading(false);
        }
      } 
      else {
        setFavorites([]);
      }
    };
    fetchUserFavorites();
  }, [isAuthenticated]);

  const handleRemoveProduct = async(productId) => {
    if(!isAuthenticated || isRemoving){
      return;
    }
    
    try{
      setIsRemoving(productId);
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
      setIsRemoving(null);
    }
  };
 
  return (
    <>
      {isLoading ? (
          <LoadingAnimation/>
        ) : (
          <div className="profileContentAriafavorites">
            <ConfirmationToast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({show:false, message:"", type:""})}/>
            <div className="favoritesMainTitleBox">
              <h2 className="favoritesMainTitle">
                {t("profile.favorites.mainTitle")}:&nbsp;
              </h2>
              <h3 className="favoritesMainTitleNumber">
                {favorites.length === 1 ? (
                  <p className="favoritesMainTitleNumber">{favorites.length} {t("profile.product")}</p>
                ) : (
                  <p className="favoritesMainTitleNumber">{favorites.length} {t("profile.products")}</p>
                )}
              </h3>
            </div>
            <div className="favoritesList">
              {favorites.map((product) => (
                <div key={product.id} className="favoriteItem">
                  {product.imageUrl ? (
                    <div className="favoritesImageBox" onClick={() => navigate(`/single-product/${product.id}`)}>
                      <img src={product.imageUrl} alt={product.name} className="favoriteImage"/>
                    </div>
                  ) : (
                    <div className="noImageBox" onClick={() => navigate(`/single-product/${product.id}`)}>
                      <p><i className ="fa-solid fa-camera"></i> <span>{t("profile.favorites.noImage")}</span></p>
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
                    <button className="favoritesRemoveBtn" onClick={() => handleRemoveProduct(product.id)} disabled={isAddingToCart === product.id || isRemoving === product.id}>
                      {isRemoving === product.id ? (
                        <span><i className="fa-solid fa-trash"></i> {t("profile.favorites.remove") + "..."}</span>
                      ) : (
                        <span><i className="fa-solid fa-trash"></i> {t("profile.favorites.remove")}</span>
                      )}
                    </button>
                    <button className="favoritesAddToCartBtn" onClick={(e) => handleAddToCart(e, product.id, setToast, t)} disabled={isAddingToCart === product.id || isRemoving === product.id}>
                      {isAddingToCart === product.id ? (
                        <span><i className="fa-solid fa-cart-shopping"></i> {t("profile.favorites.addingToCart") + "..."}</span>
                      ) : (
                        <span><i className="fa-solid fa-cart-shopping"></i> {t("profile.favorites.addToCart")}</span>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }  
    </>
  );
};

export default FavoritesComponent;