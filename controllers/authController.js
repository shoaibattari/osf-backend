import bcrypt from "bcryptjs";
import cloudinary from "cloudinary";
import User from "../model/userModel.js";

export const registerUser = async (req, res, next) => {
  const { name, email, password, userRole } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "please provide all fields",
      status: false,
    });
  }
  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({
      message: "User with same email already exists",
      status: false,
    });
  }
  try {
    const newUser = await User.create({
      name,
      email,
      password,
      userRole: userRole || "user",
    });
    res.status(200).json({
      message: "User Create Succesfully",
      status: "true",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: false,
    });
  }
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "please provide all fields",
      status: false,
    });
  }

  try {
    let user = await User.findOne({ email });
    if (!user) {
      console.log("🚀 ~ loginUser ~ user:", user);
      return res.status(401).json({
        message: "No User with email",
        status: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Password",
        status: false,
      });
    }
    const token = user.getSignedToken();
    const userData = user._doc;

    res.status(200).json({
      message: "Login Successfull",
      status: true,
      token,
      data: userData,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: false,
    });
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json({
        message: "User Not Found",
        status: false,
      });
    }

    res.status(203).json({
      message: "User Profile Fetch Succesfully",
      data: user,
      status: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: false,
    });
  }
};

export const getAllUsersForAdmin = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      message: "All users fetched successfully",
      status: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      status: false,
    });
  }
};

export const uploadUserAvatar = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res
        .status(400)
        .json({ message: "Image not found", status: false });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found", status: false });
    }

    if (user.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar.publicId);
    }
    // const result = await cloudinary.uploader.upload(req.file.path, {
    //   folder: "profileImages",
    // });

    user.avatar = {
      url: req.file.path,
      publicId: req.file.filename,
    };

    await user.save();

    console.log(user, "user");
    res.status(200).json({
      message: "Image Succesfully Upload Cloudinary",
      status: true,
      data: {
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
};
