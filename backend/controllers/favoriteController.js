const pool = require("../dataBase.js");
const { z } = require("zod");

/*---------------------ZOD-VALIDATION-------------------------*/
const productIdSchema = z.string({required_error: "Product ID is required.",invalid_type_error: "Product ID must be a string.",})
  .regex(/^\d+$/, { message: "Product ID must contain only digits." })
  .transform(Number);

/*-------------------------CHECK-FAVORITE----------------------*/
const checkFavorite = async (req, res) => {
  console.log("checkFavorites function has been called!");

  try {
    const productIdValidation = productIdSchema.safeParse(req.params.productId);

    if(!productIdValidation.success){
      return res.status(400).json({message:"Invalid favorites item data!", error:productIdValidation.error.issues});
    }

    const productId = productIdValidation.data;

    const [result] = await pool.query(
      "SELECT 1 FROM user_favorites WHERE user_id = ? AND product_id = ?",
      [req.user.userId, productId]
    );
    res.json({ isFavorite: result.length > 0 });
  } 
  catch(error){
    console.error("Error checking favorites: ", error);
    res.status(500).json({ message: "Server error!", error:error.message });
  }
};

/*-------------------------ADD-FAVORITE----------------------*/
const addFavorite = async (req, res) => {
  console.log("addFavorites function has been called!");

  try {
    const productIdValidation = productIdSchema.safeParse(req.params.productId);

    if(!productIdValidation.success){
      return res.status(400).json({message:"Invalid favorites item data!", error:productIdValidation.error.issues});
    }

    const productId = productIdValidation.data;

    await pool.query(
      "INSERT INTO user_favorites (user_id, product_id) VALUES (?, ?)",
      [req.user.userId, productId]
    );
    res.json({ success: true });
  } 
  catch(error){
    console.error("Error adding favorites: ", error);
    if (error.code === "ER_DUP_ENTRY") {
      res.status(409).json({ message: "Product already in favorites!", error:error.message });
    } 
    else {
      res.status(500).json({ message: "Server error!", error:error.message});
    }
  }
};

/*-------------------------REMOVE-FAVORITE----------------------*/
const removeFavorite = async (req, res) => {
  console.log("removeFavorites function has been called!");

  try {
    const productIdValidation = productIdSchema.safeParse(req.params.productId);

    if(!productIdValidation.success){
      return res.status(400).json({message:"Invalid favorites item data!", error:productIdValidation.error.issues});
    }

    const productId = productIdValidation.data;

    await pool.query(
      "DELETE FROM user_favorites WHERE user_id = ? AND product_id = ?",
      [req.user.userId, productId]
    );
    res.json({ success: true });
  } 
  catch(error){
    console.error("Error removing favorites: ", error);
    res.status(500).json({ message: "Server error!", error:error.message});
  }
};

/*-------------------------GET-FAVORITES----------------------*/
const getUserFavorites = async (req, res) => {
  console.log("getUserFavorites function has been called!");

  try {
    const [favorites] = await pool.query(
      `SELECT p.* FROM products p
       JOIN user_favorites uf ON p.id = uf.product_id
       WHERE uf.user_id = ?`,
      [req.user.userId]
    );
    
    res.json(favorites.map(product => {
      if (product.image) {
        return {
          ...product,
          image: {
            data: product.image.toString("base64")
          }
        };
      }
      return product;
    }));
  }
  catch(error){
    console.error("Error getting user favorites: ",error);
    res.status(500).json({ message: "Server error!", error:error.message });
  }
};

module.exports = {
  checkFavorite,
  addFavorite,
  removeFavorite,
  getUserFavorites
};