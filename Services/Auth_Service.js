import { findUserByEmailorPhone, Register } from "../Models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { client } from "../Config/connectDb.js";
import otpGenerator from "otp-generator";
import { sendOTPEmail } from "../Helper/SendEmail.js";
import { tempUsers } from "../temporaryStorage.js";

export const registerUser = async (name, email, phone, password, role) => {
  const exisitnguser = await findUserByEmailorPhone(email, client);
  if (exisitnguser) {
    throw new Error("Email or Phone Allready exists");
  }
  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  await sendOTPEmail(email, otp);

  const hashed = await bcrypt.hash(password, 10);

  console.log("hashed", hashed);

  tempUsers[email] = {
    name,
    email,
    phone,
    hashed,
    otp,
    role,
    expires: Date.now() + 5 * 60000,
  };

  console.log("tempUsers", tempUsers[email]);

  return { message: "OTP sent to email" };
  // return await Register(name, email, phone, hashed, client);
};

export const verifyUserOTP = async (email, userOtp) => {
  const temp = tempUsers[email];

  console.log(temp);

  if (!temp) {
    throw new Error("No OTP found. Register again.");
  }
  if (Date.now > temp.expires) {
    throw new Error("OTP expired");
  }

  if (temp.otp !== userOtp) throw new Error("Incorrect OTP");

  console.log("33", temp.hased);

  const user = await Register(
    temp.name,
    temp.email,
    temp.phone,
    temp.role,
    temp.hashed
  );

  delete tempUsers[email];

  return user;
};

export const loginuser = async (identifier, password) => {
  const user = await findUserByEmailorPhone(identifier, client);

  if (!user) throw new Error("User not found");

  const passwordcompare = await bcrypt.compare(password, user.password);
  console.log(process.env.JWT_SECRET);

  if (!passwordcompare) {
    throw new Error("password incorrect");
  }
  const token = jwt.sign(
    { name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return token;
};

export const EmailCheckAndSendOTP = async (email) => {
  try {
    const exisitnguser = await findUserByEmailorPhone(email, client);
    if (!exisitnguser) {
      throw new Error("This Email Id No any Account Find");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    tempUsers[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000, // 5 mins
    };

    await sendOTPEmail(email, otp);
    return "OTP sent to email";
  } catch (error) {
    return error;
  }
};

export const ResetPasswordUser = async (password, email) => {
  console.log(email);
  try {
    const hashed = await bcrypt.hash(password, 10);

    await client.query(`UPDATE admindata SET password = $1 WHERE email = $2`, [
      hashed,
      email,
    ]);

    return "Password updated successfully";
  } catch (error) {
    return error;
  }
};
