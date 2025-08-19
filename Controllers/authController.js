import {
  loginuser,
  registerUser,
  verifyUserOTP,
  EmailCheckAndSendOTP,
  ResetPasswordUser,
} from "../Services/authService.js";
import { tempUsers } from "../temporaryStorage.js";
import jwt from "jsonwebtoken";

export const Signup = async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  try {
    const user = await registerUser(name, email, phone, password, role);
    res.status(201).json({ Message: "Signup SuccessFull", user });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(400).json({ message: error.message });
  }
};

export const VerifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    console.log("2");

    const user = await verifyUserOTP(email, otp);
    console.log("3");

    res.json({ message: "User verified and registered", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const Signin = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const token = await loginuser(identifier, password);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie("_is_logged_in_", "1", {
      httpOnly: false, // Frontend can access this
      secure: true,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login successful", token: token });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

export const sentresetpassOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const result = await EmailCheckAndSendOTP(email);
    console.log(result + "99999");
    return res.json({ message: "Send OTP via Email" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const verifyResetOTP = async (req, res) => {
  const { email, otp } = req.body;
  const user = tempUsers[email];

  if (user.otp !== otp || user.expires < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  res.json({ message: "OTP verified" });
};

export const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and new password required" });
  }
  const user = tempUsers[email];
  try {
    if (!user || user.expires < Date.now()) {
      return res.status(400).json({ message: "OTP expired or not verified" });
    }
    const result = await ResetPasswordUser(password, email);

    delete tempUsers[email];

    return res.json({ message: "Password SuccesFully Update" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// export const Logininfo = (req, res) => {
//   const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
//   console.log(token);
//   if (!token) return res.status(401).json({ message: "Not logged in" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     res.json({ user: { id: decoded.id, email: decoded.email } });
//   } catch {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };

export const profile = async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Not logged in" });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    res.json({ message: "Welcome", user });
  } catch {
    res.status(403).json({ message: "Invalid Token" });
  }
};

export const Logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });

  res.clearCookie("_is_logged_in_", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });

  res.json({ message: "Logged out" });
};
