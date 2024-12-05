const express = require("express");
const router = express.Router();
const User = require("./../Models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

//User Signup
router.post("/signup", async (req, res) => {
  try {
    const data = req.body;
    const newUser = new User(data);
    const response = await newUser.save();
    console.log("Data saved");
    const payload = {
      id: response.id,
      username: response.username,
    };
    console.log(JSON.stringify(payload));

    // Generate JWT token
    const token = generateToken(payload);
    console.log("Token is : ", token);
    res.status(200).json({ Response: response, Token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//User login
router.post("/login", async (req, res) => {
  try {
    //Extract username and password from request body
    const { username, password } = req.body;

    //Find the user by email
    const user = await User.findOne({ username: username });
    //If the user does not exist or password does not match,then return error
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    //Generate Token
    const payload = {
      id: user.id,
      role: user.role,
    };
    const token = generateToken(payload);
    //Return token as response
    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Create a User Profile Route
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user.userData; //Here this user is from jwt.js file
    const userID = userData.id;
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;

// User PUT route for profile update
router.put("/profile/update", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.userData.id; // Extract the id from the token
    const { currentPassword, newPassword, ...updateData } = req.body; // Extract data from the request body

    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If both currentPassword and newPassword are provided, update the password
    if (currentPassword && newPassword) {
      // Verify the current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid current password" });
      }

      // Update the user's password
      user.password = newPassword;
    } else if (currentPassword || newPassword) {
      // If only one of the fields is provided, return an error
      return res.status(400).json({
        error:
          "Both current and new password are required to update the password",
      });
    }

    // Update other profile details
    Object.keys(updateData).forEach((key) => {
      user[key] = updateData[key];
    });

    await user.save(); // Save the updated user details

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
