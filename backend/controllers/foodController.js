const Food = require('../models/Food');

// GET /api/foods
const getFoods = async (req, res) => {
  try {
    const { search, category, sort, available } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (available !== undefined) {
      query.available = available === 'true';
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const foods = await Food.find(query).populate('category', 'name').sort(sortOption);
    res.json({ success: true, foods });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/foods/:id
const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate('category', 'name');
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }
    res.json({ success: true, food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/foods
const createFood = async (req, res) => {
  try {
    const { name, description, price, category, available } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const food = await Food.create({
      name,
      description,
      price: Number(price),
      category,
      image,
      available: available !== 'false',
    });

    const populatedFood = await food.populate('category', 'name');
    res.status(201).json({ success: true, message: 'Food item created', food: populatedFood });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/foods/:id
const updateFood = async (req, res) => {
  try {
    const { name, description, price, category, available } = req.body;
    const updateData = { name, description, price: Number(price), category, available };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const food = await Food.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('category', 'name');

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }

    res.json({ success: true, message: 'Food updated', food });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/foods/:id
const deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }
    res.json({ success: true, message: 'Food deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getFoods, getFoodById, createFood, updateFood, deleteFood };
