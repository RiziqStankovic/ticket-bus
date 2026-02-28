const express = require("express");
const router = express();

const {
  AddBus,
  GetAllBuses,
  GetBusesForHomepage,
  UpdateBus,
  DeleteBus,
  GetBusById,
  GetBusesByFromAndTo,
} = require("../Controllers/busController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/add-bus", authMiddleware, AddBus);
router.post("/get-all-buses", authMiddleware, GetAllBuses);
router.get("/home", GetBusesForHomepage); // Public - bus untuk homepage
router.get("/detail/:id", GetBusById); // Public - detail bus untuk halaman book-now
router.post("/get", GetBusesByFromAndTo); // Public - pencarian bus tanpa login
router.put("/:id", authMiddleware, UpdateBus);
router.delete("/:id", authMiddleware, DeleteBus);
router.get("/:id", authMiddleware, GetBusById);

module.exports = router;
