import mongoose from 'mongoose';

// 🚀 Used with router.param(): an id that isn't a valid MongoDB ObjectId gets a 400 right away,
// instead of Mongoose throwing a CastError that ends up as a 500.
export const checkObjectId = (req, res, next, value) => {
  if (!mongoose.isValidObjectId(value)) return res.status(400).json({ message: 'Invalid ID.' });
  next();
};
