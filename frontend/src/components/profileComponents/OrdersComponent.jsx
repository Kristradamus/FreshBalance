import { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../protectionComponents/AuthContext.jsx";
import LoadingAnimation from "../layout/LoadingAnimation.jsx";
import ConfirmationToast from "../reusableComponents/ConfirmationToast.jsx";
import "./OrdersComponent.css";

const UserOrdersPage = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setOrders(response.data.orders);
        }
        else {
          throw new Error(response.data.message || "Failed to fetch orders");
        }
      } 
      catch (error) {
        console.error("Error fetching orders:", error);
        setError(error.message || "An error occurred while fetching your orders");
        setToast({
          show: true,
          message: t("profile.orders.fetchError"),
          type: "error"
        });
      } 
      finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    } else {
      setIsLoading(false);
      setToast({
        show: true,
        message: t("profile.orders.loginRequired"),
        type: "error"
      });
      navigate("/login");
    }
  }, [user, navigate, t]);

  const toggleOrderDetails = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "processing":
        return "status-processing";
      case "shipped":
        return "status-shipped";
      case "delivered":
        return "status-delivered";
      case "canceled":
        return "status-canceled";
      default:
        return "";
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (error && !orders.length) {
    return (
      <div className="ordersErrorContainer">
        <h2>{t("profile.orders.error")}</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/profile")} className="backButton">
          {t("profile.orders.backToProfile")}
        </button>
      </div>
    );
  }

  return (
    <div className="ordersPageContainer">
      <ConfirmationToast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ show: false, message: "", type: "" })}
      />
      
      <div className="ordersHeader">
        <h1>{t("profile.orders.title")}</h1>
        <p>{t("profile.orders.subtitle")}</p>
      </div>

      {orders.length === 0 ? (
        <div className="noOrdersContainer">
          <h2>{t("profile.orders.noOrders")}</h2>
          <p>{t("profile.orders.startShopping")}</p>
          <button onClick={() => navigate("/products")} className="shopNowButton">
            {t("profile.orders.shopNow")}
          </button>
        </div>
      ) : (
        <div className="ordersListContainer">
          {orders.map((order) => (
            <div key={order.order_id} className="orderCard">
              <div className="orderHeader" onClick={() => toggleOrderDetails(order.order_id)}>
                <div className="orderBasicInfo">
                  <h3>{t("profile.orders.orderNumber")}: #{order.order_id}</h3>
                  <p className="orderDate">{formatDate(order.created_at)}</p>
                </div>
                <div className="orderStatusInfo">
                  <span className={`orderStatus ${getStatusClass(order.status)}`}>
                    {t(`profile.orders.status.${order.status}`)}
                  </span>
                  <span className="orderTotal">{Number(order.total_amount).toFixed(2)} {t("profile.lv")}</span>
                  <span className="expandIcon">{expandedOrder === order.order_id ? "▲" : "▼"}</span>
                </div>
              </div>
              
              {expandedOrder === order.order_id && (
                <div className="orderDetails">
                  <div className="orderDetailSection">
                    <h4>{t("profile.orders.customerInfo")}</h4>
                    <p>{order.first_name} {order.last_name}</p>
                    <p>{order.email}</p>
                  </div>
                  
                  <div className="orderDetailSection">
                    <h4>{t("profile.orders.deliveryMethod")}</h4>
                    <p>{t(`profile.checkout.${order.delivery_method}`)}</p>
                    {order.delivery_method === "speedyAddress" && (
                      <p>{order.delivery_address}, {order.delivery_city}, {order.delivery_postal_code}</p>
                    )}
                    {order.delivery_method === "speedyOffice" && (
                      <p>{order.delivery_office}, {order.delivery_city}</p>
                    )}
                    {order.delivery_method === "freshBalance" && (
                      <p>{order.delivery_store}</p>
                    )}
                  </div>
                  
                  <div className="orderDetailSection">
                    <h4>{t("profile.orders.paymentInfo")}</h4>
                    <p>{t(`checkout.${order.payment_method}`)}</p>
                    <p>{t(`profile.orders.paymentStatus.${order.payment_status}`)}</p>
                  </div>
                  
                  <div className="orderItems">
                    <h4>{t("profile.orders.items")}</h4>
                    <table className="orderItemsTable">
                      <thead>
                        <tr>
                          <th>{t("profile.orders.product")}</th>
                          <th>{t("profile.orders.quantity")}</th>
                          <th>{t("profile.orders.price")}</th>
                          <th>{t("profile.orders.total")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>{Number(item.price).toFixed(2)} {t("profile.lv")}</td>
                            <td>{Number(item.price * item.quantity).toFixed(2)} {t("profile.lv")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="orderSummary">
                    <div className="summaryRow">
                      <span>{t("checkout.subtotal")}:</span>
                      <span>{Number(order.total_amount - order.shipping_cost).toFixed(2)} {t("profile.lv")}</span>
                    </div>
                    <div className="summaryRow">
                      <span>{t("checkout.shipping")}:</span>
                      <span>{Number(order.shipping_cost).toFixed(2)} {t("profile.lv")}</span>
                    </div>
                    <div className="summaryRow totalRow">
                      <span>{t("checkout.total")}:</span>
                      <span>{Numbд .er(order.total_amount).toFixed(2)} {t("profile.lv")}</span>
                    </div>
                  </div>
                  
                  <div className="orderActions">
                    <button 
                      onClick={() => navigate(`/profile/orders/${order.order_id}`)} 
                      className="viewDetailButton"
                    >
                      {t("profile.orders.viewDetails")}
                    </button>
                    
                    {order.status === "delivered" && (
                      <button className="reorderButton">
                        {t("profile.orders.reorder")}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrdersPage;