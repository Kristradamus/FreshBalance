import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./ProductManagement.css";

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
    category: "",
    stock: ""
  });

  /*--------------------------------SMALL-JS--------------------------------*/
  const handleAddClick = () => {
    setActiveForm(activeForm === 'add' ? null : 'add');
    setFeedback({ type: '', message: '' });
  };

  const handleRemoveClick = () => {
    setActiveForm(activeForm === 'remove' ? null : 'remove');
    setFeedback({ type: '', message: '' });
  };

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.match('image.*')) {
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
      setIsSubmitting(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', formData.stock);
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }
      
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        body: formDataToSend
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setFeedback({
          type: 'success',
          message: t("admin.addSuccess", "Product added successfully!")
        });
        
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          stock: ''
        });
        setSelectedImage(null);
        setImagePreview(null);
      } else {
        setFeedback({
          type: 'error',
          message: result.message || t("admin.addError", "Error adding product")
        });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: t("admin.serverError", "Error connecting to server")
      });
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSubmit = async (e) => {
    e.preventDefault();
    // Implement your remove product logic here
    console.log("Remove product functionality to be implemented");
  };

  return (
    <div className="adminContentAreaProducts">
      <div className="productManagementHeader">
        <h2>{t("admin.productsMainTitle", "Product Management")}</h2>
        <div className="productManagementButtons">
          <button className={`removeProductBtn ${activeForm === 'remove' ? 'active' : ''}`} onClick={handleRemoveClick}>
            <i className="fa-solid fa-minus"></i>
            {t("admin.removeProduct", "Remove Product")}
          </button>
          <button className={`addProductBtn ${activeForm === 'add' ? 'active' : ''}`} onClick={handleAddClick}>
            <i className="fa-solid fa-plus"></i>
            {t("admin.addProduct", "Add New Product")}
          </button>
        </div>
      </div>

      {feedback.message && (
        <div className={`productFeedback ${feedback.type === 'success' ? 'success' : 'error'}`}>
          {feedback.message}
        </div>
      )}

      {/* Add Product Form */}
      {activeForm === 'add' && (
        <div className="productForm">
          <h3>{t("admin.addProductFormTitle", "Add New Product")}</h3>
          <form onSubmit={handleAddSubmit}>
            <div className="formGrid">
              <div className="formGroup">
                <label>{t("admin.productName", "Product Name")} *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required/>
              </div>
              <div className="formGroup">
                <label>{t("admin.productPrice", "Price")} *</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} step="0.01" min="0" required />
              </div>
              <div className="formGroup">
                <label>{t("admin.productCategory", "Category")}</label>
                <input type="text" name="category" value={formData.category} onChange={handleChange} />
              </div>
              <div className="formGroup">
                <label>{t("admin.productStock", "Stock")}</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" />
              </div>
            </div>
            <div className="formGroup">
              <label>{t("admin.productDescription", "Description")}</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3" ></textarea>
            </div>
            <div className="formGroup">
              <label>{t("admin.productImage", "Product Image")}</label>
              <div className="imageUploadContainer">
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && (
                  <div className="imagePreview">
                    <img src={imagePreview} alt={t("admin.imagePreview", "Preview")} />
                  </div>
                )}
              </div>
              <p className="imageUploadHint">
                {t("admin.imageUploadHint", "Max size: 16MB. Supported formats: JPEG, PNG, GIF")}
              </p>
            </div>
            
            <button type="submit" className="submitBtn" disabled={isSubmitting} >
              {isSubmitting 
                ? t("admin.addingProduct", "Adding Product...") 
                : t("admin.submitAddProduct", "Add Product")}
            </button>
          </form>
        </div>
      )}

      {activeForm === 'remove' && (
        <div className="productForm">
          <h3>{t("admin.removeProductFormTitle", "Remove Product")}</h3>
          <form onSubmit={handleRemoveSubmit}>
            <div className="formGroup">
              <label>{t("admin.selectProductToRemove", "Select Product to Remove")} *</label>
              <select required>
                <option value="">{t("admin.selectProduct", "-- Select Product --")}</option>
                <option value="1">Product 1</option>
                <option value="2">Product 2</option>
                <option value="3">Product 3</option>
              </select>
            </div>
            <div className="formGroup">
              <label>
                <input type="checkbox" required />
                {t("admin.confirmRemoval", "I confirm I want to remove this product")}
              </label>
            </div>
            <button type="submit" className="submitBtn remove">
              {t("admin.submitRemoveProduct", "Remove Product")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}