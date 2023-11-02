const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Mendapatkan token dari header otorisasi
    const token = req.headers.authorization.split(" ")[1];

    // Memeriksa apakah token ada
    if (!token) {
      return res.status(401).send({
        message: "Auth failed 1",
        success: false,
      });
    }

    // Memverifikasi token
    const decodedToken = jwt.verify(token, process.env.jwt_secret);
    req.params.userId = decodedToken.userId;
    
    // Melanjutkan ke middleware atau penanganan berikutnya
    next();
  } catch (error) {
    // Menangani kesalahan autentikasi
    res.status(401).send({
      message: "Auth failed 2",
      success: false,
    });
  }
};
