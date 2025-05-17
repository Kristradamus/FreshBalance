import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./ProductManagement.css";
import ConfirmationToast from "../reusableComponents/ConfirmationToast.jsx";
import ScrollToTop from "../reusableComponents/ScrollToTop.jsx";
import axios from "axios";

const ProductManagement = () => {
  const { t } = useTranslation();
  const [activeForm, setActiveForm] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    details: "",
  });
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [scrollToTop, setScrollToTop] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [removeProductId, setRemoveProductId] = useState("");
  const [productList, setProductList] = useState([]);
  const [confirmRemoval, setConfirmRemoval] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  /*--------------------------------FORM-LOADING--------------------------------*/
  const handleAddClick = () => {
    setActiveForm(activeForm === "add" ? null : "add");
  };

  const handleRemoveClick = () => {
    setActiveForm(activeForm === "remove" ? null : "remove");
  };

  /*-------------------------------SCROLL-TO-TOP-RESET----------------------------*/
  useEffect(() => {
    if (scrollToTop) {
      const timer = setTimeout(() => {
        setScrollToTop(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [scrollToTop]);

  /*--------------------------------FORM-LOADING--------------------------------*/
  const sanitizeInput = (value) => {
    return value.replace(/[<>]/g, "").replace(/['"]/g, "′");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: sanitizeInput(value),
    });
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

  useEffect(() => {axios.get(`${import.meta.env.VITE_BACKEND_URL}/products/category-groups`).then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("Error fetching category groups:", error);
      });
  }, []);

  /*--------------------------------IMAGE-UPLOAD--------------------------------*/
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.type.match("image.*")) {
        setToast({
          show: true,
          message: t("admin.productManagement.add.errorNotImage"),
          type: "error",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setToast({
          show: true,
          message: t("admin.productManagement.add.errorImageTooBig"),
          type: "error",
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

  /*--------------------------------ADD-SUBMIT--------------------------------*/
  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      setToast({
        show: true,
        message: t("admin.productManagement.add.errorNameAndPrice"),
        type: "error",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("details", formData.details);
      formDataToSend.append("categories", JSON.stringify(selectedCategories));

      if (selectedImage) {
        formDataToSend.append("image", selectedImage);
      }
      const token = localStorage.getItem("authToken");
      console.log("everything is good for now frontend");
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/products/admin/products`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setScrollToTop(true);
      setToast({
        show: true,
        message: t("admin.productManagement.add.success"),
        type: "success",
      });
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        details: "",
      });
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedCategories([]);
    } 
    catch (error) {
      setScrollToTop(true);
      setToast({
        show: true,
        message: t("admin.productManagement.add.errorConectingToServer"),
        type: "error",
      });
      console.error("Error submitting form:", error);
    } 
    finally {
      setIsSubmitting(false);
    }
  };

  /*--------------------------------REMOVE-SUBMIT--------------------------------*/
  const handleRemoveSubmit = async (e) => {
    e.preventDefault();

    if (!removeProductId) {
      setToast({ show: true, message: "No product selected", type: "error" });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token missing");
      }

      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/products/${removeProductId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      setProductList((prev) => prev.filter((p) => p.id !== removeProductId));

      setToast({
        show: true,
        message: t("admin.productManagement.remove.success"),
        type: "success",
      });

      setRemoveProductId(null);
      setConfirmRemoval(false);
      setSearchTerm("");
    } 
    catch (error) {
      console.error("Remove error:", error);
      setToast({
        show: true,
        message: t("admin.productManagement.remove.failedToRemoveProduct"),
        type: "error",
      });
    } 
    finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/products`, {
          headers: {
            Accept: "application/json",
          },
        });

        const productsWithImages = response.data.map((product) => {
          if (product.image && product.image.data) {
            return {
              ...product,
              imageUrl: `data:image/jpeg;base64,${product.image.data}`,
            };
          }
          return product;
        });

        setProductList(productsWithImages);
      } 
      catch (error) {
        console.error("Error fetching products:", error);
        setToast({
          show: true,
          message: t("admin.productManagement.remove.failedToLoadProducts"),
          type: "error",
        });
      }
    };

    if (activeForm === "remove") {
      fetchProducts();
    }

    return () => {
      productList.forEach((product) => {
        if (product.imageUrl) {
          URL.revokeObjectURL(product.imageUrl);
        }
      });
    };
  }, [activeForm]);

  const filteredProducts = productList.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.id.toString().includes(searchTerm) || (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())));

  const handleSearchBar = (e) => {
    setSearchTerm(e.target.value);
    setConfirmRemoval(false);
    setRemoveProductId("");
  };

  const handleProductSelect = (selectedId) => {
    setRemoveProductId(selectedId);
    if (selectedId !== removeProductId) {
      setConfirmRemoval(false);
    } else {
      setRemoveProductId("");
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setSelectedImage(null);

    document.getElementById("fileUpload").value = "";
  };

  return (
    <div className="adminProductManagement">
      <ConfirmationToast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: "", type: "" })} />
      <ScrollToTop trigger={scrollToTop} />
      <div className="adminContentAreaProducts">
        <div className="productManagementHeader">
          <h2>{t("admin.productManagement.mainTitle")}</h2>
          <div className="productManagementButtons">
            <button className={`removeProductBtn ${activeForm === "remove" ? "active" : ""}`} onClick={handleRemoveClick}>
              <span><i className="fa-solid fa-minus"></i>{t("admin.productManagement.remove.productBtnText")}</span>
            </button>
            <button className={`addProductBtn ${activeForm === "add" ? "active" : ""}`} onClick={handleAddClick}>
              <span><i className="fa-solid fa-plus"></i>{t("admin.productManagement.add.productBtnText")}</span>
            </button>
          </div>
        </div>
      </div>

      {/*--------------------------------------------ADD-FORM------------------------------------------*/}
      {activeForm === "add" && (
        <div className="productForm">
          <h3 className="productFormMainTitle">{t("admin.productManagement.add.productMainTitle")}:</h3>
          <form onSubmit={handleAddSubmit}>
            <div className="formGrid">
              <div className="formGroup">
                <label className="formGroupTitle">{t("admin.productManagement.add.formNameTitle")}</label>
                <input type="text" name="name" value={formData.name} placeholder={t("admin.productManagement.add.formNameTitle") + "..."} onChange={handleChange} required />
              </div>
              <div className="formGroup">
                <label className="formGroupTitle">{t("admin.productManagement.add.formPriceTitle")}</label>
                <input type="number" name="price" value={formData.price} onChange={(e) => { const value = e.target.value; if (/^\d*\.?\d{0,2}$/.test(value)) { setFormData({ ...formData, price: value }); }}} step="0.01" min="0.01" placeholder="0.00" required />
              </div>
              <div className="formGroup">
                <label className="formGroupTitle">{t("admin.productManagement.add.formStockTitle")}</label>
                <input type="number" name="stock" placeholder="0" value={formData.stock} onChange={handleChange} min="0" />
              </div>
            </div>
            <div className="formGroup">
              <label className="formGroupTitle">{t("admin.productManagement.add.formDescriptionTitle")}</label>
              <textarea name="description" value={formData.description} placeholder={t("admin.productManagement.add.formDescriptionTitle") + "..."} onChange={handleChange} rows="3"></textarea>
            </div>
            <div className="formGroup">
              <label className="formGroupTitle">{t("admin.productManagement.add.formDetailsTitle")}</label>
              <textarea className="details" name="details" value={formData.details} placeholder={t("admin.productManagement.add.formDetailsTitle") + "..."} onChange={handleChange} rows="3"></textarea>
            </div>

            {/*------------------------------------IMAGES--------------------------------*/}
            <div className="formGroup">
              <label className="formGroupTitle">{t("admin.productManagement.add.formImageTitle")}</label>
              <hr />
              <div className="imageUploadContainer">
                <input type="file" accept="image/*" onChange={handleImageChange} id="fileUpload" />
                <label htmlFor="fileUpload" className="uploadArea">
                  {t("admin.productManagement.add.uploadImage")}
                </label>
                {imagePreview && (
                  <div className="imagePreviewContainer">
                    <img className="imagePreview" src={imagePreview} alt="Preview" />
                    <button onClick={clearImage} className="clearImageBtn">
                      {t("admin.productManagement.add.clearImage")}
                    </button>
                  </div>
                )}
              </div>
              <p className="imageUploadHint" onClick={(e) => e.preventDefault()}>
                {t("admin.productManagement.add.uploadLimitations")}
              </p>
            </div>

            {/*------------------------------------CATEGORIES--------------------------------*/}
            <div className="formGroup">
              <label className="formGroupTitle">{t("admin.productManagement.add.categoriesTitle")}</label>
              <hr />
              <div className="categoriesWrapper">
                {categories && categories.reduce(
                  (acc, group) => {
                    if (!acc.names.includes(group.name)) {
                      acc.names.push(group.name);
                      acc.elements.push(
                        <div className="categoriesColumnBox" key={group.name}>
                          <div className="categoriesBox">
                            <h4>{group.name}</h4>
                            {group.categories.map((category) => (
                              <div key={category.id} className="productCategoryCheckboxBox" onClick={() => { document.getElementById(`category-${category.id}`).click(); }} >
                                <input type="checkbox" onClick={(e) => e.stopPropagation()} value={category.id} id={`category-${category.id}`} checked={selectedCategories.includes(category.id)} onChange={handleCategoryChange} />
                                <div className="productCategoryCheckbox">
                                  <p className="productCategoryCheckboxText">{category.name}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return acc;
                  },
                  { names: [], elements: [] }
                ).elements}
              </div>
            </div>
            <button type="submit" className="submitBtn" disabled={isSubmitting}>
              {isSubmitting ? t("admin.productManagement.add.addBtnWorking") + "..." : t("admin.productManagement.add.addBtnTitle")}
            </button>
          </form>
        </div>
      )}

      {/*----------------------------------------REMOVE-FORM--------------------------------------------*/}
      {activeForm === "remove" && (
        <div className="productForm">
          <h3 className="productFormMainTitle">{t("admin.productManagement.remove.productMainTitle")}</h3>
          <form onSubmit={handleRemoveSubmit}>
            <div className="formGroup">
              <label className="formGroupTitle">{t("admin.productManagement.remove.seachMainTitle")}</label>
              <input type="text" className="searchInput" placeholder={t("admin.productManagement.remove.searchPlaceholder") + "..."} value={searchTerm} onChange={handleSearchBar} />
            </div>

            <div className="formGroup">
              <label className="formGroupTitle">{t("admin.productManagement.remove.selectAProductTitle")}</label>
              <hr />
              {productList.length === 0 ? (
                <p>Loading products...</p>
              ) : filteredProducts.length === 0 ? (
                <p className="noResults">{t("admin.productManagement.remove.noProductsFound")}</p>
              ) : (
                <div className="productGrid">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className={`productCard ${removeProductId === product.id ? "selected" : ""}`} onClick={() => handleProductSelect(product.id)}>
                      {product.imageUrl && (
                        <div className="productImage">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/default-product.png";
                            }}
                          />
                        </div>
                      )}
                      <div className="productDetails">
                        <h4>{product.name}</h4>
                        <p className="productId">
                          {t("admin.productManagement.remove.id") + ":"} {product.id}
                        </p>
                        {product.price && (
                          <p className="productPrice">
                            {product.price} {t("admin.productManagement.remove.lv") + "."}
                          </p>
                        )}
                      </div>
                      <div className="selectionIndicator">{removeProductId === product.id ? <i className="fa-solid fa-check"></i> : ""}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {removeProductId && (
              <div className="productRemoveConfirmationCheckboxBox" onClick={() => {   document.getElementById("removeConfirm").click(); }} >
                <input type="checkbox" onClick={(e) => e.stopPropagation()} checked={confirmRemoval} id="removeConfirm" onChange={(e) => setConfirmRemoval(e.target.checked)} required></input>
                <div className="productRemoveConfirmationCheckbox">
                  <p className="productRemoveConfirmationCheckboxText">
                    {t("admin.productManagement.remove.checkboxText") + ": "}
                    <strong>{productList.find((p) => p.id === removeProductId)?.name}</strong>
                  </p>
                </div>
              </div>
            )}

            <button type="submit" className="removeBtn" disabled={!removeProductId || !confirmRemoval || isSubmitting}>
              {isSubmitting ? t("admin.productManagement.remove.removeBtnWorking") + "..." : t("admin.productManagement.remove.removeBtnTitle")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;