import User from '../models/user.model.js';
import bcrypt from 'bcrypt';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['name', 'email', 'profile_img']
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email, profile_img, password, oldPassword } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If password is to be changed, verify old password
    if (password) {
      if (!oldPassword) {
        return res.status(400).json({ message: 'Old password is required to change password' });
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Old password is incorrect' });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (profile_img !== undefined) user.profile_img = profile_img;

    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_img: user.profile_img,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
