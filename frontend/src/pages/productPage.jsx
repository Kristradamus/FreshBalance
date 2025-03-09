import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import "./productPage.css";

const ProductPage = () => {
const { promotionName } = useParams();
const [productData, setProductData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const { t } = useTranslation();

useEffect(() => {
if (!promotionName) {
  setError("Invalid promotion name.");
  setLoading(false);
  return;
}

const fetchProductData = async () => {
  try {
    const url = `http://localhost:5000/products/${promotionName}`;
        
    if (!response.ok) {
      throw new Error(`Failed to fetch. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched data:", data);
    setProductData(data);
  } 
  catch (err) {
    console.error("Error fetching product data:", err);
    setError(`Failed to load product data: ${err.message || err}`);
  } 
  finally {
    setLoading(false);
  }
};

fetchProductData();

return () => {
  setLoading(false);
  setProductData(null);
};}, [promotionName]);

if (loading) return <div>Loading...</div>;
if (error) return <div>{error}</div>;

return (
  <div>
    <h1>Product Page: {promotionName}</h1>
    {productData ? (
    <div>
      <h2>{productData.name}</h2>
      <p>Price: ${productData.price}</p>
      <p>{productData.description}</p>
    </div>) : 
    (
      <p>No data available</p>
    )}
  </div>
);};

export default ProductPage;
