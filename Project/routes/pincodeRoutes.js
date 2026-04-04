const express = require("express");
const router = express.Router();
const {
  getRoot,
  getPincodeByQuery,
  getPincodeByParam,
  searchPincodes,
  autocomplete,
  getNearby,
  bulkLookup,
  getStats,
  getStateDistribution,
  getDeliveryDistribution,
  getStates,
  getDistrictsByState,
  getTaluks,
  getTaluksAdvanced,
  getPincodes,
  exportData,
  getLegacyStates,
  getLegacyStateByName,
} = require("../controllers/pincodeController");

// Root
router.get("/", getRoot);

// Pincode lookup
router.get("/api/pincode", getPincodeByQuery);
router.get("/api/pincode/:pincode", getPincodeByParam);

// Search & autocomplete
router.get("/api/search", searchPincodes);
router.get("/api/autocomplete", autocomplete);

// Nearby
router.get("/api/nearby", getNearby);

// Bulk lookup
router.post("/api/bulk", bulkLookup);

// Stats
router.get("/api/stats", getStats);
router.get("/api/stats/state-distribution", getStateDistribution);
router.get("/api/stats/delivery-distribution", getDeliveryDistribution);

// States, districts, taluks
router.get("/api/states", getStates);
router.get("/api/states/:state/districts", getDistrictsByState);
router.get("/api/states/:state/districts/:district/taluks", (req, res, next) => {
  if (req.query.method === "advanced") {
    return getTaluksAdvanced(req, res);
  }
  return getTaluks(req, res);
});

// Filtered + paginated pincodes
router.get("/api/pincodes", getPincodes);

// Export
router.get("/api/export", exportData);

// Legacy routes
router.get("/states", getLegacyStates);
router.get("/states/:state_name", getLegacyStateByName);

module.exports = router;
