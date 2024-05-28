const User = require("../models/User");

//argument 'next' pour passer au prochain middleware
const isAuthenticated = async (req, res, next) => {
  try {
    // if (!req.headers.authorization) {
    //   return res.status(401).json({ message: "Unauthorized" });
    // }
    // if (!user) {
    //   return res.status(401).json({ message: "Unauthorized" });
    // }

    // req.user = user;

    // return next();
    if (req.headers.authorization) {
      const token = req.headers.authorization.replace("Bearer ", "");
      // console.log(token);
      // Méthode mongoose .select pour choisir quelles clés à renvoyer (notamment pour cacher les infos de connexion)
      const user = await User.findOne({ token: token }).select("account _id");
      // console.log(user);
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = isAuthenticated;
