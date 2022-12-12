import User from "../models/userModel.js";
import compare from "../helpers/authentication.js";
import AppError from "../util/AppError.js";
import cloudinary from "../helpers/cloudinary.js";


export const signup = async (req, res, next) => {
  const result = await cloudinary.uploader.upload(req.file.path,{
    folder: 'Restaurant',
    use_filename: true
},);
  const { username, email,phone,thumb, password } = req.body;
  const hashpassword = compare.hashpassword(password);

  let userEmailExist = await User.findOne({ email: req.body.email });
  let usernameExist = await User.findOne({ username: req.body.username });
  if (userEmailExist) return next(new AppError("Email already taken!", 409));
  if (usernameExist) return next(new AppError("Username already taken!", 409));

  const user = new User({
    username: username,
    email: email,
    phone:phone,
    thumb:result.secure_url,
    password: hashpassword,
  });

  user
    .save()
    .then(() => {
      res.status(201).json({
        message: "You have successfully registered. Please login now", 
        data:user
      });
    })
    .catch((err) => {
      res.status(500).json({
        message:
          " there is something wrong, check your internet or call support",
        status: 500,
      });
    });
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({email});
    
    if (!user) {
      throw new Error("User not found");
    }
    await compare.comparePassword(password,user.password)
    return res.status(200).json({
      message: "you are logged in successfully",
      status: 200,
      token: compare.generateToken(user),
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    await User.find({})
    .then((users) => {
      return res.status(200).json({
        data: users,
        message: "Retrieved",
      });
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const updateProfile = (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;

  User.findByIdAndUpdate(
    id,
    {
      username: username,
      email: email,
    },
    (err, result) => {
      if (result) {
        res.status(201).json({
          message: "user updated",
        });
      }
    }
  );
};
export const deleteUser = async (req, res) => {
  try {
    const id = req.params
    const user = await User.findByIdAndDelete(id);
    console.log(user)
    res.status(200).json({ message: "User deleted successfully ",data: user, });
  } catch (error) {
    console.log(error);
  }
};
