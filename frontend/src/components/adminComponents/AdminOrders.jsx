import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import LoadingAnimation from "../layout/LoadingAnimation";
import ConfirmationToast from "../reusableComponents/ConfirmationToast";
import "./AdminOrders.css";

const AdminOrders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchAdminOrders = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setOrders(response.data.orders);
          const initialStatusUpdates = {};
          response.data.orders.forEach(order => {
            initialStatusUpdates[order.order_id] = order.status;
          });
          setStatusUpdates(initialStatusUpdates);
        } else {
          throw new Error(response.data.message || "Failed to fetch admin orders");
        }
      } 
      catch (error) {
        console.error("Error fetching admin orders:", error);
        setError(error.message || "An error occurred while fetching admin orders");
        setToast({
          show: true,
          message: t("admin.orders.fetchError"),
          type: "error",
        });
      } 
      finally {
        setIsLoading(false);
      }
    };

    fetchAdminOrders();
  }, [t]);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleStatusChange = (orderId, newStatus) => {
    setStatusUpdates(prev => ({
      ...prev,
      [orderId]: newStatus,
    }));
  };

  const updateOrderStatus = async (orderId) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("authToken");
      const newStatus = statusUpdates[orderId];
      const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setToast({
          show: true,
          message: response.data.message,
          type: "success",
        });
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.order_id === orderId ? { ...order, status: newStatus } : order
          )
        );
        setExpandedOrder(null);
      } else {
        setToast({
          show: true,
          message: response.data.message || "Failed to update order status",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      setToast({
        show: true,
        message: error.response?.data?.message || "An error occurred while updating status",
        type: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (error) {
    return <div className="adminOrdersError">{t("admin.orders.error")}: {error}</div>;
  }

  return (
    <div className="adminContentAreaOrders">
      <ConfirmationToast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: "", type: "" })} />
      <h2>{t("admin.orders.mainTitle")}</h2>
      <div className="adminOrders">
        {orders.length === 0 ? (
          <p>{t("admin.orders.noOrders")}</p>
        ) : (
          <table className="ordersTable">
            <thead>
              <tr>
                <th>{t("admin.orders.orderId")}</th>
                <th>{t("admin.orders.customer")}</th>
                <th>{t("admin.orders.orderDate")}</th>
                <th>{t("admin.orders.totalAmount")}</th>
                <th>{t("admin.orders.status")}</th>
                <th>{t("admin.orders.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order.order_id}>
                  <tr onClick={() => toggleOrderDetails(order.order_id)} className={`orderRow ${expandedOrder === order.order_id ? 'expanded' : ''}`}>
                    <td>#{order.order_id}</td>
                    <td>{order.customer_info?.firstName} {order.customer_info?.lastName}</td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>{Number(order.total_amount)?.toFixed(2)} {t("profile.lv")}</td>
                    <td>
                      <select
                        value={statusUpdates[order.order_id] || order.status}
                        onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                      >
                        <option value="pending">{t("admin.orders.statusOptions.pending")}</option>
                        <option value="processing">{t("admin.orders.statusOptions.processing")}</option>
                        <option value="shipped">{t("admin.orders.statusOptions.shipped")}</option>
                        <option value="delivered">{t("admin.orders.statusOptions.delivered")}</option>
                        <option value="canceled">{t("admin.orders.statusOptions.canceled")}</option>
                      </select>
                    </td>
                    <td>
                      <button onClick={() => updateOrderStatus(order.order_id)} disabled={isUpdating}>
                        {isUpdating ? t("admin.orders.updating") : t("admin.orders.updateStatus")}
                      </button>
                    </td>
                  </tr>
                  {expandedOrder === order.order_id && (
                    <tr className="orderDetailsRow">
                      <td colSpan="6">
                        <div className="orderDetails">
                          <h3>{t("admin.orders.orderDetails")} #{order.order_id}</h3>
                          <div className="detailSection">
                            <h4>{t("admin.orders.customerInfo")}</h4>
                            <p>{t("admin.orders.name")}: {order.customer_info?.firstName} {order.customer_info?.lastName}</p>
                            <p>{t("admin.orders.email")}: {order.customer_info?.email}</p>
                            <p>{t("admin.orders.phone")}: {order.customer_info?.phone}</p>
                          </div>

                          <div className="detailSection">
                            <h4>{t("admin.orders.deliveryInfo")}</h4>
                            <p>{t(`profile.checkout.${order.delivery_info?.method}`)}</p>
                            {order.delivery_info?.method === "speedyAddress" && (
                              <>
                                <p>{t("admin.orders.address")}: {order.delivery_info?.address}, {order.delivery_info?.addressDetails}</p>
                                <p>{t("admin.orders.city")}: {order.delivery_info?.city}, {t("admin.orders.postalCode")}: {order.delivery_info?.postalCode}</p>
                              </>
                            )}
                            {order.delivery_info?.method === "speedyOffice" && (
                              <>
                                <p>{t("admin.orders.city")}: {order.delivery_info?.city}</p>
                                <p>{t("admin.orders.office")}: {order.delivery_info?.office}</p>
                              </>
                            )}
                            {order.delivery_info?.method === "freshBalance" && (
                              <p>{t("admin.orders.store")}: {order.delivery_info?.store}</p>
                            )}
                          </div>

                          <div className="detailSection">
                            <h4>{t("admin.orders.paymentInfo")}</h4>
                            <p>{t(`checkout.${order.payment_info?.method}`)}</p>
                            <p>{t("admin.orders.paymentStatus")}: {order.payment_info?.status}</p>
                          </div>

                          <div className="detailSection">
                            <h4>{t("admin.orders.items")}</h4>
                            <table className="orderItemsTable">
                              <thead>
                                <tr>
                                  <th>{t("admin.orders.product")} ID</th>
                                  <th>{t("admin.orders.quantity")}</th>
                                  <th>{t("admin.orders.price")}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items?.map(item => (
                                  <tr key={item.product_id}>
                                    <td>{item.product_id}</td>
                                    <td>{item.quantity}</td>
                                    <td>{Number(item.price)?.toFixed(2)} {t("profile.lv")}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="detailSection">
                            <h4>{t("admin.orders.summary")}</h4>
                            <p>{t("admin.orders.subtotal")}: {Number(order.subtotal)?.toFixed(2)} {t("profile.lv")}</p>
                            <p>{t("admin.orders.shipping")}: {Number(order.shipping_cost)?.toFixed(2)} {t("profile.lv")}</p>
                            <p className="total">{t("admin.orders.totalAmount")}: {Number(order.total_amount)?.toFixed(2)} {t("profile.lv")}</p>
                            {order.notes && <p>{t("admin.orders.notes")}: {order.notes}</p>}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;