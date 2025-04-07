import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./ProductManagement.css";
import axios from 'axios';

export default function ProductManagement() {
  const { t } = useTranslation();
  const [activeForm, setActiveForm] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [formData, setFormData] = useState({
      name: "",
      description: "",
      price: "",
      stock: "",
      details: ""
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [removeProductId, setRemoveProductId] = useState('');
  const [productList, setProductList] = useState([]);
  const [confirmRemoval, setConfirmRemoval] = useState(false);


  /*--------------------------------FORM-LOADING--------------------------------*/
  const handleAddClick = () => {
    setActiveForm(activeForm === "add" ? null : "add");
    setFeedback({ type: "", message: "" });
  };

  const handleRemoveClick = () => {
    setActiveForm(activeForm === "remove" ? null : "remove");
    setFeedback({ type: "", message: "" });
  };

  /*--------------------------------FORM-LOADING--------------------------------*/
  const sanitizeInput = (value) => {
    return value
    .replace(/[<>]/g, "")
    .replace(/['"]/g, "′")
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: sanitizeInput(value)
    });
  };

  /*--------------------------------REMOVE-SUBMIT--------------------------------*/
  const handleRemoveSubmit = async (e) => {
    e.preventDefault();
    console.log("REMOVE PRODUCT FUNCTIONALITIES NEED TO BE IMPLEMENTED");
  };

  /*--------------------------------CATEGORIES--------------------------------*/
  const handleCategoryChange = (e) => {
    const categoryId = parseInt(e.target.value);
    if (e.target.checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    }
  };

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/products/categories`)
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  }, []);





  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.type.match("image.*")) {
        setFeedback({
          type: 'error',
          message: t("admin.imageTypeError", "Please select an image file")
        });
        return;
      }

      if (file.size > 16 * 1024 * 1024) {
        setFeedback({
          type: 'error',
          message: t("admin.imageSizeError", "Image size should be less than 16MB")
        });
        return;
      }

      setSelectedImage(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      setFeedback({
        type: 'error',
        message: t("admin.requiredFields", "Name and price are required")
      });
      return;
    }

    try {
      console.log("everything is good for now")
      setIsSubmitting(true);

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('details', formData.details);
      formDataToSend.append('categories', JSON.stringify(selectedCategories));

      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/products/admin/products`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setFeedback({
        type: 'success',
        message:"Product added successfully!",
      });

      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        details: ''
      });
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedCategories([]); // Reset selected categories
    } 
    catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || "Error connecting to server"
      });
      console.error('Error submitting form:', error);
    } 
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="adminProductManagement">
      <div className="adminContentAreaProducts">
        <div className="productManagementHeader">
          <h2>{t("admin.productManagement.mainTitle")}</h2>
          <div className="productManagementButtons">
            <button className={`removeProductBtn ${activeForm === "remove" ? "active" : ''}`} onClick={handleRemoveClick}>
              <i className="fa-solid fa-minus"></i>
              {t("admin.productManagement.remove.productBtnText")}
            </button>
            <button className={`addProductBtn ${activeForm === "add" ? "active" : ""}`} onClick={handleAddClick}>
              <i className="fa-solid fa-plus"></i>
              {t("admin.productManagement.add.productBtnText")}
            </button>
          </div>
        </div>
        {feedback.message && (
          <div className={`productFeedback ${feedback.type === 'success' ? 'success' : 'error'}`}>
            {feedback.message}
          </div>
        )}
      </div>

      {activeForm === "add" && (
        <div className="productForm">
          <h3 className="productFormMainTitle">{t("admin.productManagement.add.productMainTitle")}:</h3>
          <form onSubmit={handleAddSubmit}>
            <div className="formGrid">
              <div className="formGroup">
                <label>{t("admin.productManagement.add.formNameTitle")} *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="formGroup">
                <label>{t("admin.productManagement.add.formPriceTitle")} *</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} step="0.01" min="0" required />
              </div>
              <div className="formGroup">
                <label>{t("admin.productManagement.add.formStockTitle")}</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" />
              </div>
            </div>
            <div className="formGroup">
              <label>{t("admin.productManagement.add.formDescriptionTitle")}</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3" ></textarea>
            </div>
            <div className="formGroup">
              <label>{t("admin.productManagement.add.formDetailsTitle")}</label>
              <textarea name="details" value={formData.details} onChange={handleChange} rows="3" ></textarea>
            </div>
            <div className="formGroup">
              <label>{t("admin.productManagement.add.formImageTitle")}</label>
              <div className="imageUploadContainer">
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && (
                  <div className="imagePreview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
              <p className="imageUploadHint">
                Max size: 16MB. Supported formats: JPEG, PNG, GIF
              </p>
            </div>
            <div className="formGroup">
              <label>Categories</label>
              {categories.map(category => (
                <div key={category.id}>
                  <label>
                    <input type="checkbox" value={category.id} checked={selectedCategories.includes(category.id)} onChange={handleCategoryChange}/>
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
            <button type="submit" className="submitBtn" disabled={isSubmitting} >
              {isSubmitting
                ? "Adding Product..."
                : "Add Product"}
            </button>
          </form>
        </div>
      )}

      {activeForm === "remove" && (
        <div className="productForm">
          <h3 className="productFormMainTitle">{t("admin.productManagement.remove.productMainTitle")}</h3>
          <form onSubmit={handleRemoveSubmit}>
            <div className="formGroup">
              <label>Select Product to Remove *</label>
              <select required value={removeProductId} onChange={(e) => setRemoveProductId(e.target.value)}>
                <option value="">-- Select Product --</option>
                {productList.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
            <div className="formGroup">
              <label>
                <input type="checkbox" checked={confirmRemoval} onChange={(e) => setConfirmRemoval(e.target.checked)} required />
                I confirm I want to remove this product
              </label>
            </div>
            <button type="submit" className="submitBtn remove">
              Remove Product
            </button>
          </form>
        </div>
      )}
    </div>
  );
}