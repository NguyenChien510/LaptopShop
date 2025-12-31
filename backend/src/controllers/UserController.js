import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  return res.json(await User.findAll());
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, city, district, street, image, role } =
      req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Only allow role update if it's a valid value
    const updateData = {
      name: name !== undefined ? name : user.name,
      email: email !== undefined ? email : user.email,
      phone: phone !== undefined ? phone : user.phone,
      city: city !== undefined ? city : user.city,
      district: district !== undefined ? district : user.district,
      street: street !== undefined ? street : user.street,
      image: image !== undefined ? image : user.image,
    };

    // Allow role update only if value is valid
    if (role !== undefined && ["user", "admin"].includes(role)) {
      updateData.role = role;
    }

    await user.update(updateData);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error("User not found");
  await user.destroy();
  return user;
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ["password", "refreshToken", "resetOtp", "resetOtpExpireAt"],
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update current user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, city, district, street, image } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user data
    await user.update({
      name: name !== undefined ? name : user.name,
      email: email !== undefined ? email : user.email,
      phone: phone !== undefined ? phone : user.phone,
      city: city !== undefined ? city : user.city,
      district: district !== undefined ? district : user.district,
      street: street !== undefined ? street : user.street,
      image: image !== undefined ? image : user.image,
    });

    // Return updated user without sensitive data
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ["password", "refreshToken", "resetOtp", "resetOtpExpireAt"],
      },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
