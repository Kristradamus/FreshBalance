import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../protectionComponents/AuthContext.jsx";

const useRemoveAddHandler = () => {
  const [favorites, setFavorites] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(null);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
  const [isFetchingFavorites, setIsFetchingFavorites] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserFavorites = async () => {
      if (isAuthenticated) {
        try {
          setIsFetchingFavorites(true);
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
          setFavorites(response.data.map((item) => item.id));
        } 
        catch (error) {
          console.error("Error fetching user favorites:", error);
        }
        finally{
          setIsFetchingFavorites(false);
        }
      } 
      else {
        setFavorites([]);
      }
    };
    fetchUserFavorites();
  }, [isAuthenticated]);

  /*-------------------------------FAVORITES------------------------------------*/
  const handleAddToFavorites = async (e, productId, setToast, t, setShowAlert) => {
    e.stopPropagation();
    setIsAddingToFavorites(true);
    if (!isAuthenticated) {
      setShowAlert(true);
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      const isCurrentlyFavorite = favorites.includes(productId);

      if (isCurrentlyFavorite) {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/favorites/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        setFavorites(favorites.filter((id) => id !== productId));
        setToast({
          show: true,
          message: t("productPage.removedFromFavorites"),
          type: "success",
        });
      } 
      else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/favorites/${productId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        setFavorites([...favorites, productId]);
        setToast({
          show: true,
          message: t("productPage.addedToFavorites"),
          type: "success",
        });
      }
    } 
    catch (error) {
      console.error("Error updating favorites:", error);
      setToast({
        show: true,
        message: t("productPage.favoritesError"),
        type: "error",
      });
    }
    finally{
      setIsAddingToFavorites(false);
    }
  };

  /*------------------------------CART--------------------------------------*/
  const handleAddToCart = async (e, productId, setToast, t, setShowAlert, quantity = 1) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setShowAlert(true);
      return;
    }
    try {
      setIsAddingToCart(productId);
      const token = localStorage.getItem("authToken");
      
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/cart/add/${productId}`,{ quantity: quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      
      setToast({
        show: true,
        message: t("productPage.addedToCart"),
        type: "success",
      });
      
    } 
    catch (error) {
      console.error("Error adding item to cart:", error);
      
      setToast({
        show: true,
        message: t("productPage.cartError"),
        type: "error",
      });
    }
    finally{
      setIsAddingToCart(null);
    }
  };

  return { favorites, handleAddToFavorites, isAddingToCart, handleAddToCart, isAddingToFavorites, isFetchingFavorites};
};

export default useRemoveAddHandler;