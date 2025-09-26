import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  return res.json(await User.findAll());
};

export const updateUser = async (id, userData) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");
  return await user.update(userData);
};

export const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");
  await user.destroy();
  return user;
};
