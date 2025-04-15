import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../protectionComponents/AuthContext.jsx";

const useFavoritesHandler = () => {
  const [favorites, setFavorites] = useState([]);
  const { isAuthenticated, user } = useContext(AuthContext);

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
          setFavorites(response.data.map((item) => item.id));
        } catch (error) {
          console.error("Error fetching user favorites:", error);
        }
      } else {
        setFavorites([]);
      }
    };
    fetchUserFavorites();
  }, [isAuthenticated, user]);

  const handleAddTofavorites = async (e, productId, setToast, t, setShowAlert) => {
    e.stopPropagation();
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
      } else {
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
    } catch (error) {
      console.error("Error updating favorites:", error);
      setToast({
        show: true,
        message: t("productPage.favoritesError"),
        type: "error",
      });
    }
  };

  return { favorites, handleAddTofavorites };
};

export default useFavoritesHandler;