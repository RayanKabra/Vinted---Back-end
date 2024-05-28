const express = require("express");

const router = express.Router();

const fileupload = require("express-fileupload");

const cloudinary = require("cloudinary").v2;

// fileupload() // c'est mon middleware

//import de mes modèles
const Offer = require("../models/Offer");
const User = require("../models/User");

//import de ma fonction utils
const convertToBase64 = require("../utils/convertToBase64");

// import de mon middleware
const isAuthenticated = require("../middlewares/isAuthenticated");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileupload(),
  async (req, res) => {
    try {
      // console.log(req.headers.authorization.replace("Bearer ", ""));

      // const token = req.headers.authorization.replace("Bearer ", "");
      // console.log(req.headers.authorization);
      // const user = await User.findOne({ token: token }).select("account");
      const { title, description, price, condition, city, brand, size, color } =
        req.body;
      // console.log(req.body);
      // console.log(req.files);

      // const pictureData = await cloudinary.uploader.upload(
      //   convertToBase64(req.files.picture)
      // );

      // console.log(pictureData);

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { MARQUE: brand },
          { TAILLE: size },
          { ÉTAT: condition },
          { COULEUR: color },
          { EMPLACEMENT: city },
        ],
        owner: req.user,
      });
      //   // product_image: pictureData,

      // console.log(newOffer);

      const pictureData = await cloudinary.uploader.upload(
        convertToBase64(req.files.picture)
      );
      newOffer.product_image = pictureData;
      await newOffer.save();
      res.status(201).json(newOffer);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    const filters = {};
    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }
    if (req.query.priceMin) {
      filters.product_price = {
        $gte: Number(req.query.priceMin), //Number pour convertir la query qui est considéré comme une string
      };
    }
    if (req.query.priceMax) {
      // filters.product_price = {
      //   $lte: Number(req.query.priceMax), //Number pour convertir la query qui est considéré comme une string
      // };
      if (filters.product_price) {
        filters.product_price.$lte = Number(req.query.priceMax);
      } else {
        filters.product_price = {
          $lte: Number(req.query.priceMax),
        };
      }
    }

    // SORT : tri par ordre croissant et décroissant
    const sort = {};
    if (req.query.sort === "price-desc") {
      sort.product_price = -1; // tri par ordre décroissant
    } else if (req.query.sort === "price-asc") {
      sort.product_price = 1; // tri par ordre croissant
    }

    let limit = 5; // affichage de 5 résultats par page
    let page = 1;

    if (req.query.page) {
      page = req.query.page;
    }

    const skip = (page - 1) * limit; // nb de résultats à afficher en fonction de la page

    const results = await Offer.find(filters)
      .sort(sort)
      .skip(skip) // définition du nb d'éléments à passer par page
      .limit(limit);
    // .select("product_name product_price -_id");

    const count = await Offer.countDocuments(filters); // méthode count

    // res.json(results);
    res.json({ count: count, offers: results });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );
    res.json(offer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
