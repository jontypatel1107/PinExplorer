const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGODB_URI || "mongodb+srv://JontyPatel1107:JiyaJonty2511@cluster0.yujjuv4.mongodb.net/Pincode?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Error:", err));

const pincodeSchema = new mongoose.Schema({
  officeName: String,
  pincode: Number,
  officeType: String,
  deliveryStatus: String,
  divisionName: String,
  regionName: String,
  circleName: String,
  taluk: String,
  districtName: String,
  stateName: String,
});

pincodeSchema.index({ pincode: 1 });
pincodeSchema.index({ stateName: 1 });
pincodeSchema.index({ districtName: 1 });
pincodeSchema.index({ taluk: 1 });
pincodeSchema.index({ officeName: "text", taluk: "text", districtName: "text" });

const Pincode = mongoose.model("Pincode", pincodeSchema);

// ── Root ──────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Pincode API is running", version: "2.0" });
});

// ── GET /api/pincode?code=400001 ──────────────────────────
app.get("/api/pincode", async (req, res) => {
  try {
    const pin = Number(req.query.code);
    if (!pin) return res.status(400).json({ success: false, message: "Please provide pincode in query params" });

    const data = await Pincode.find({ pincode: pin });
    if (data.length === 0) return res.status(404).json({ success: false, message: "No data found for this pincode" });

    res.json({
      success: true,
      cityDetails: {
        pincode: pin,
        city: data[0].taluk,
        district: data[0].districtName,
        state: data[0].stateName?.trim(),
        region: data[0].regionName,
        division: data[0].divisionName,
        circle: data[0].circleName,
        totalOffices: data.length,
        offices: data.map((item) => ({
          name: item.officeName,
          type: item.officeType,
          deliveryStatus: item.deliveryStatus,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/pincode/:pincode ─────────────────────────────
app.get("/api/pincode/:pincode", async (req, res) => {
  try {
    const pin = Number(req.params.pincode);
    if (!pin) return res.status(400).json({ success: false, message: "Please provide a valid pincode" });

    const data = await Pincode.find({ pincode: pin });
    if (data.length === 0) return res.status(404).json({ success: false, message: "No data found for this pincode" });

    res.json({
      success: true,
      cityDetails: {
        pincode: pin,
        city: data[0].taluk,
        district: data[0].districtName,
        state: data[0].stateName?.trim(),
        region: data[0].regionName,
        division: data[0].divisionName,
        circle: data[0].circleName,
        totalOffices: data.length,
        offices: data.map((item) => ({
          name: item.officeName,
          type: item.officeType,
          deliveryStatus: item.deliveryStatus,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/search?q=Mumbai&type=city|district|office ────
app.get("/api/search", async (req, res) => {
  try {
    const q = req.query.q?.trim();
    const type = req.query.type || "all"; // city | district | office | all

    if (!q || q.length < 2) {
      return res.status(400).json({ success: false, message: "Query must be at least 2 characters" });
    }

    const regex = new RegExp(q, "i");
    let query = {};

    if (type === "city") query = { taluk: regex };
    else if (type === "district") query = { districtName: regex };
    else if (type === "office") query = { officeName: regex };
    else query = { $or: [{ taluk: regex }, { districtName: regex }, { officeName: regex }] };

    // Get distinct pincodes matching the query
    const results = await Pincode.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$pincode",
          city: { $first: "$taluk" },
          district: { $first: "$districtName" },
          state: { $first: "$stateName" },
          region: { $first: "$regionName" },
          officeCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    res.json({
      success: true,
      query: q,
      total: results.length,
      results: results.map((r) => ({
        pincode: r._id,
        city: r.city,
        district: r.district,
        state: r.state?.trim(),
        region: r.region,
        officeCount: r.officeCount,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/autocomplete?q=Mum ───────────────────────────
app.get("/api/autocomplete", async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q || q.length < 2) return res.json({ success: true, suggestions: [] });

    const regex = new RegExp("^" + q, "i");

    const [cities, districts] = await Promise.all([
      Pincode.distinct("taluk", { taluk: regex }),
      Pincode.distinct("districtName", { districtName: regex }),
    ]);

    const suggestions = [
      ...cities.slice(0, 5).map((c) => ({ label: c, type: "city" })),
      ...districts.slice(0, 5).map((d) => ({ label: d, type: "district" })),
    ].slice(0, 8);

    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/nearby?pincode=400001 ───────────────────────
app.get("/api/nearby", async (req, res) => {
  try {
    const pin = Number(req.query.pincode);
    if (!pin) return res.status(400).json({ success: false, message: "Provide pincode" });

    const base = await Pincode.findOne({ pincode: pin });
    if (!base) return res.status(404).json({ success: false, message: "Pincode not found" });

    const nearby = await Pincode.aggregate([
      {
        $match: {
          districtName: base.districtName,
          stateName: base.stateName,
          pincode: { $ne: pin },
        },
      },
      {
        $group: {
          _id: "$pincode",
          city: { $first: "$taluk" },
          district: { $first: "$districtName" },
          state: { $first: "$stateName" },
          officeCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 20 },
    ]);

    res.json({
      success: true,
      basePincode: pin,
      baseDistrict: base.districtName,
      total: nearby.length,
      nearby: nearby.map((r) => ({
        pincode: r._id,
        city: r.city,
        district: r.district,
        state: r.state?.trim(),
        officeCount: r.officeCount,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/bulk ─────────────────────────────────────────
// Body: { pincodes: [400001, 110001, ...] }
app.post("/api/bulk", async (req, res) => {
  try {
    const { pincodes } = req.body;
    if (!Array.isArray(pincodes) || pincodes.length === 0) {
      return res.status(400).json({ success: false, message: "Provide an array of pincodes" });
    }
    if (pincodes.length > 50) {
      return res.status(400).json({ success: false, message: "Maximum 50 pincodes per request" });
    }

    const pins = pincodes.map(Number).filter(Boolean);

    const results = await Pincode.aggregate([
      { $match: { pincode: { $in: pins } } },
      {
        $group: {
          _id: "$pincode",
          city: { $first: "$taluk" },
          district: { $first: "$districtName" },
          state: { $first: "$stateName" },
          region: { $first: "$regionName" },
          division: { $first: "$divisionName" },
          officeCount: { $sum: 1 },
          offices: { $push: "$officeName" },
        },
      },
    ]);

    const found = results.map((r) => ({ pincode: r._id, city: r.city, district: r.district, state: r.state?.trim(), region: r.region, division: r.division, officeCount: r.officeCount, offices: r.offices }));
    const notFound = pins.filter((p) => !results.find((r) => r._id === p));

    res.json({ success: true, found, notFound });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/stats ────────────────────────────────────────
app.get("/api/stats", async (req, res) => {
  try {
    const [totalDocs, stateStats, officeTypeStats, deliveryStats] = await Promise.all([
      Pincode.countDocuments(),
      Pincode.aggregate([
        {
          $group: {
            _id: "$stateName",
            totalOffices: { $sum: 1 },
            uniquePincodes: { $addToSet: "$pincode" },
            uniqueDistricts: { $addToSet: "$districtName" },
          },
        },
        {
          $project: {
            state: { $trim: { input: "$_id" } },
            totalOffices: 1,
            uniquePincodes: { $size: "$uniquePincodes" },
            uniqueDistricts: { $size: "$uniqueDistricts" },
          },
        },
        { $sort: { totalOffices: -1 } },
      ]),
      Pincode.aggregate([
        { $group: { _id: "$officeType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Pincode.aggregate([
        { $group: { _id: "$deliveryStatus", count: { $sum: 1 } } },
      ]),
    ]);

    const uniquePincodes = await Pincode.distinct("pincode");
    const uniqueStates = await Pincode.distinct("stateName");
    const uniqueDistricts = await Pincode.distinct("districtName");

    res.json({
      success: true,
      summary: {
        totalOffices: totalDocs,
        totalPincodes: uniquePincodes.length,
        totalStates: uniqueStates.length,
        totalDistricts: uniqueDistricts.length,
      },
      stateStats: stateStats.map((s) => ({
        state: s.state,
        totalOffices: s.totalOffices,
        uniquePincodes: s.uniquePincodes,
        uniqueDistricts: s.uniqueDistricts,
      })),
      officeTypes: officeTypeStats.map((o) => ({ type: o._id || "Unknown", count: o.count })),
      deliveryStatus: deliveryStats.map((d) => ({ status: d._id || "Unknown", count: d.count })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/states ───────────────────────────────────────
app.get("/api/states", async (req, res) => {
  try {
    const states = await Pincode.distinct("stateName");
    const uniqueStates = [...new Set(states.map((s) => s?.trim()).filter(Boolean))].sort();
    res.json(uniqueStates);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/states/:state/districts ──────────────────────
app.get("/api/states/:state/districts", async (req, res) => {
  try {
    const stateName = req.params.state.trim();
    const allStates = await Pincode.distinct("stateName");
    const matchedState = allStates.find(s => s.trim().toLowerCase() === stateName.toLowerCase());
    if (!matchedState) return res.json([]);
    const districts = await Pincode.distinct("districtName", { stateName: matchedState });
    res.json([...new Set(districts.map(d => d?.trim()).filter(Boolean))].sort());
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/states/:state/districts/:district/taluks ─────
app.get("/api/states/:state/districts/:district/taluks", async (req, res) => {
  try {
    const { state, district } = req.params;
    const allStates = await Pincode.distinct("stateName");
    const matchedState = allStates.find(s => s.trim().toLowerCase() === state.trim().toLowerCase());
    if (!matchedState) return res.json([]);
    const allDistricts = await Pincode.distinct("districtName", { stateName: matchedState });
    const matchedDistrict = allDistricts.find(d => d?.trim().toLowerCase() === district.trim().toLowerCase());
    if (!matchedDistrict) return res.json([]);
    const taluks = await Pincode.distinct("taluk", { stateName: matchedState, districtName: matchedDistrict });
    res.json([...new Set(taluks.map(t => t?.trim()).filter(Boolean))].sort());
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/states/:state/districts/:district/taluks ─────
app.get("/api/states/:state/districts/:district/taluks", async (req, res) => {
  try {
    const { state, district } = req.params;
    const taluks = await Pincode.aggregate([
      {
        $addFields: {
          normalizedState: {
            $trim: {
              input: {
                $reduce: {
                  input: { $split: [{ $toLower: "$stateName" }, " "] },
                  initialValue: "",
                  in: { $concat: ["$$value", { $cond: [{ $eq: ["$$value", ""] }, "", " "] }, "$$this"] },
                },
              },
            },
          },
          normalizedDistrict: {
            $trim: {
              input: {
                $reduce: {
                  input: { $split: [{ $toLower: "$districtName" }, " "] },
                  initialValue: "",
                  in: { $concat: ["$$value", { $cond: [{ $eq: ["$$value", ""] }, "", " "] }, "$$this"] },
                },
              },
            },
          },
          searchState: { $toLower: { $trim: { input: state } } },
          searchDistrict: { $toLower: { $trim: { input: district } } },
        },
      },
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$normalizedState", "$searchState"] },
              { $eq: ["$normalizedDistrict", "$searchDistrict"] },
            ],
          },
        },
      },
      { $group: { _id: { $trim: { input: "$taluk" } } } },
      { $sort: { _id: 1 } },
    ]);
    res.json(taluks.map((t) => t._id).filter(Boolean));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/pincodes (filtered + paginated) ──────────────
app.get("/api/pincodes", async (req, res) => {
  try {
    const { state, district, taluk, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (state) {
      const allStates = await Pincode.distinct("stateName");
      const matchedState = allStates.find(s => s.trim().toLowerCase() === state.trim().toLowerCase());
      if (matchedState) query.stateName = matchedState;
    }
    if (district) {
      const allDistricts = await Pincode.distinct("districtName");
      const matchedDistrict = allDistricts.find(d => d?.trim().toLowerCase() === district.trim().toLowerCase());
      if (matchedDistrict) query.districtName = matchedDistrict;
    }
    if (taluk) {
      const allTaluks = await Pincode.distinct("taluk");
      const matchedTaluk = allTaluks.find(t => t?.trim().toLowerCase() === taluk.trim().toLowerCase());
      if (matchedTaluk) query.taluk = matchedTaluk;
    }

    const [data, total] = await Promise.all([
      Pincode.find(query).skip(skip).limit(limitNum),
      Pincode.countDocuments(query),
    ]);

    res.json({
      data: data.map((d) => ({
        pincode: d.pincode,
        officeName: d.officeName,
        officeType: d.officeType,
        deliveryStatus: d.deliveryStatus,
        taluk: d.taluk?.trim(),
        district: d.districtName?.trim(),
        state: d.stateName?.trim(),
        division: d.divisionName,
        region: d.regionName,
        circle: d.circleName,
      })),
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/stats/state-distribution ─────────────────────
app.get("/api/stats/state-distribution", async (req, res) => {
  try {
    const data = await Pincode.aggregate([
      { $group: { _id: "$stateName", count: { $sum: 1 } } },
      { $project: { state: { $trim: { input: "$_id" } }, count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/stats/delivery-distribution ──────────────────
app.get("/api/stats/delivery-distribution", async (req, res) => {
  try {
    const data = await Pincode.aggregate([
      { $group: { _id: "$deliveryStatus", count: { $sum: 1 } } },
    ]);
    const result = {};
    data.forEach((d) => {
      const key = (d._id || "Unknown").toLowerCase().replace(/\s+/g, "");
      result[key] = d.count;
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/export ───────────────────────────────────────
app.get("/api/export", async (req, res) => {
  try {
    const { state, district, taluk } = req.query;
    const query = {};
    if (state) query.stateName = { $regex: new RegExp(`^${state}$`, "i") };
    if (district) query.districtName = { $regex: new RegExp(`^${district}$`, "i") };
    if (taluk) query.taluk = { $regex: new RegExp(`^${taluk}$`, "i") };

    const data = await Pincode.find(query);
    const csvRows = [
      "Pincode,Office Name,Office Type,Delivery Status,Taluk,District,State,Division,Region,Circle",
      ...data.map(
        (d) =>
          `${d.pincode},"${d.officeName}","${d.officeType}","${d.deliveryStatus}","${d.taluk}","${d.districtName}","${d.stateName}","${d.divisionName}","${d.regionName}","${d.circleName}"`
      ),
    ];
    const csv = csvRows.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="pincodes_export.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /states (legacy) ──────────────────────────────────
app.get("/states", async (req, res) => {
  try {
    const states = await Pincode.distinct("stateName");
    const uniqueStates = [...new Set(states.map((s) => s?.trim()).filter(Boolean))].sort();
    res.json({ success: true, totalStates: uniqueStates.length, states: uniqueStates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /states/:state_name (legacy) ──────────────────────
app.get("/states/:state_name", async (req, res) => {
  try {
    const stateName = req.params.state_name.trim().toUpperCase();
    const data = await Pincode.find({ stateName: { $regex: new RegExp(`^${stateName}\\s*$`, "i") } });

    if (data.length === 0) return res.status(404).json({ success: false, message: "No data found for this state" });

    const districtMap = {};
    data.forEach((item) => {
      const district = item.districtName?.trim();
      const city = item.taluk?.trim();
      if (!district || !city) return;
      if (!districtMap[district]) districtMap[district] = new Set();
      districtMap[district].add(city);
    });

    const result = Object.keys(districtMap)
      .sort()
      .map((district) => ({ district, cities: [...districtMap[district]].sort() }));

    res.json({ success: true, state: stateName, totalDistricts: result.length, districts: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
