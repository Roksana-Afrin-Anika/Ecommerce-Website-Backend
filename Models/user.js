const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const user = this;
  //Hash the password only if it has been modified (or is new)
  if (!user.isModified("password")) {
    return next();
  }
  try {
    //hash password generation
    const salt = await bcrypt.genSalt(10);
    //hash password (it takes two parametars)
    const hashedPassword = await bcrypt.hash(user.password, salt);
    //Override the plain password with the hashed one
    user.password = hashedPassword;
    next();
  } catch (err) {
    return next(err);
  }
});
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    //Use bcrypt to compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (err) {
    console.error("Password comparison error:", err);
    throw new Error("Password comparison failed");
  }
};
const User = mongoose.model("User", userSchema);
module.exports = User;
