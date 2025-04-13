const pool = require("../dataBase.js");

const checkFavorite = async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT 1 FROM user_favorites WHERE user_id = ? AND product_id = ?',
      [req.user.user_id, req.params.productId]
    );
    res.json({ isFavorite: result.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const addFavorite = async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO user_favorites (user_id, product_id) VALUES (?, ?)',
      [req.user.user_id, req.params.productId || req.body.productId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'Product already in favorites' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

const removeFavorite = async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM user_favorites WHERE user_id = ? AND product_id = ?',
      [req.user.user_id, req.params.productId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserFavorites = async (req, res) => {
  try {
    const [favorites] = await pool.query(
      `SELECT p.* FROM products p
       JOIN user_favorites uf ON p.id = uf.product_id
       WHERE uf.user_id = ?`,
      [req.user.user_id]
    );
    
    res.json(favorites.map(product => {
      if (product.image) {
        return {
          ...product,
          image: {
            data: product.image.toString('base64')
          }
        };
      }
      return product;
    }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  checkFavorite,
  addFavorite,
  removeFavorite,
  getUserFavorites
};