import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./productPage.css";

export default function ProductPage (){
  const { productName } = useParams();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { t } = useTranslation();

{/*--------------------------------------PRODUCTS--------------------------------------------*/}
  async function fetchProductData() {
    try {
      const response = await fetch(`http://localhost:5000/products/${productName}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch. Status: ${response.status}`);
      }

      const data = await response.json();
      setProductData(data);
    } catch (err) {
      setError(t("productPage.errorLoading"));
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProductData();
  }, [productName]);

  if (loading) {
    return <div style={{ padding: "20px", fontWeight:"bold"}}>
    {t("productPage.loading")}
  </div>
  }

  if (error) {
    return <div style={{ padding: "20px",fontWeight:"bold" }}>{error}</div>;
  }

  return (
    <div>
      <h1>{t("productPage.title")}: {productName}</h1>
      {productData ? (
        <div>
          <h2>{productData.name}</h2>
          <p>{t("productPage.price")}: ${productData.price}</p>
          <p>{productData.description}</p>
        </div>
      ) : (
        <p>{t("productPage.noData")}</p>
      )}
    </div>
  );
};