const {
  ProductSchema,
  CategorySchema,
  StyleSchema,
  ShippingPolicySchema,
  ReturnPolicySchema,
  OfferSchema,
} = require("../model/productSchema.js");
const formidable = require("formidable"); // to handle file uploads
const fs = require("fs");
const mongoose = require("mongoose");

//post new product
exports.postNewProduct = async (req, res) => {
  const db = mongoose.connection.db;
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'productImages' });

  const form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.maxFieldsSize = 10 * 1024 * 1024; // 10MB
  form.maxFileSize = 10 * 1024 * 1024; // 10MB
  form.multiples = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Form parsing failed.' });
    }

    // Extract and process fields
    const {
      name,
      description_heading,
      description_detail,
      description_specification,
      price,
      brand,
      Material,
      stock,
      category,
      style,
      shippingPolicy,
      returnPolicy,
      discount_type,
      discount_value,
      gender,
      size,
      color,
      section,
    } = fields;

    // Ensure single values are not arrays
    const processedName = Array.isArray(name) ? name[0] : name;
    const processedDescriptionHeading = Array.isArray(description_heading) ? description_heading[0] : description_heading;
    const processedDescriptionDetail = Array.isArray(description_detail) ? description_detail[0] : description_detail;
    const processedBrand = Array.isArray(brand) ? brand[0] : brand;
    const processedMaterial = Array.isArray(Material) ? Material[0] : Material;
    const processedDiscountType = Array.isArray(discount_type) ? discount_type[0] : discount_type;
    const processedGender = Array.isArray(gender) ? gender[0] : gender;
    const processedSection = Array.isArray(section) ? section[0] : section;

    // Process arrays
    const specifications = Array.isArray(description_specification)
      ? description_specification
      : (typeof description_specification === 'string' ? description_specification.split(',') : []);
    const sizeArray = Array.isArray(size) ? size : (typeof size === 'string' ? size.split(',') : []);
    const colorArray = Array.isArray(color) ? color : (typeof color === 'string' ? color.split(',') : []);

    // Handle image files
    const imageFiles = Array.isArray(files.file) ? files.file : [files.file];
    const labels = Array.isArray(fields['file.label']) ? fields['file.label'] : [fields['file.label'] || ''];

    if (imageFiles.length === 0) {
      return res.status(400).json({ error: 'No images uploaded.' });
    }

    const imageDocuments = [];

    const uploadPromises = imageFiles.map((file, index) => {
      return new Promise((resolve, reject) => {
        if (!file || !file.originalFilename) {
          return reject(new Error('File or file name is undefined'));
        }

        const uploadStream = bucket.openUploadStream(file.originalFilename);
        const fileStream = fs.createReadStream(file.filepath);

        fileStream.pipe(uploadStream);

        uploadStream.on('finish', () => {
          const label = labels[index] || file.originalFilename; // Use filename if label is missing

          imageDocuments.push({
            file: {
              fileId: uploadStream.id,
              type: file.mimetype,
              filename: file.originalFilename,
              size: file.size,
              uploadedAt: new Date(),
            },
            label,
          });
          resolve();
        });

        uploadStream.on('error', (error) => {
          console.error('Error uploading image:', error);
          reject(error);
        });
      });
    });

    try {
      await Promise.all(uploadPromises);

      const product = new ProductSchema({
        name: processedName,
        description: {
          heading: processedDescriptionHeading,
          detail: processedDescriptionDetail,
          specification: specifications,
        },
        price: parseFloat(price),
        brand: processedBrand,
        Material: processedMaterial,
        stock: parseInt(stock, 10),
        category,
        style,
        shippingPolicy,
        returnPolicy,
        discount: {
          type: processedDiscountType,
          value: parseFloat(discount_value),
        },
        gender: processedGender,
        size: sizeArray,
        color: colorArray,
        section: processedSection,
        images: imageDocuments,
      });

      const result = await product.save();
      res.json({
        message: 'Product uploaded successfully',
        productId: result._id,
        images: imageDocuments,
      });
    } catch (error) {
      console.error('Failed to insert product:', error);
      res.status(500).json({ error: 'Failed to insert product into the database.' });
    }
  });
};

// POST new Category
exports.postNewCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newCategory = new CategorySchema({ name, description });
    await newCategory.save();
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// POST new Style
exports.postNewStyle = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newStyle = new StyleSchema({ name, description });
    await newStyle.save();
    res.status(201).json({
      success: true,
      message: "Style created successfully",
      style: newStyle,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// POST new Shipping Policy
exports.postNewShippingPolicy = async (req, res) => {
  try {
    const { method, cost, estimatedDelivery, regions, handlingTime } = req.body;
    const newShippingPolicy = new ShippingPolicySchema({
      method,
      cost,
      estimatedDelivery,
      regions,
      handlingTime,
    });
    await newShippingPolicy.save();
    res.status(201).json({
      success: true,
      message: "Shipping policy created successfully",
      shippingPolicy: newShippingPolicy,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// POST new Return Policy
exports.postNewReturnPolicy = async (req, res) => {
  try {
    const { window, conditions, process, shippingFee } = req.body;
    const newReturnPolicy = new ReturnPolicySchema({
      window,
      conditions,
      process,
      shippingFee,
    });
    await newReturnPolicy.save();
    res.status(201).json({
      success: true,
      message: "Return policy created successfully",
      returnPolicy: newReturnPolicy,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// POST new Offer
exports.postNewOffer = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      applicableTo,
      buyQuantity,
      getQuantity,
      discount,
    } = req.body;

    const newOffer = new OfferSchema({
      title,
      description,
      startDate,
      endDate,
      applicableTo,
      buyQuantity,
      getQuantity,
      discount,
    });

    await newOffer.save();
    res.status(201).json({
      success: true,
      message: "Offer created successfully",
      offer: newOffer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

exports.getAllOffers = async (req, res) => {
  try {
    const offers = await OfferSchema.find();
    res.status(200).json({ success: true, offers });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};


// Get all Categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await CategorySchema.find();
    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Get all Styles
exports.getAllStyles = async (req, res) => {
  try {
    const styles = await StyleSchema.find();
    res.status(200).json({ success: true, styles });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Get all Shipping Policies
exports.getAllShippingPolicies = async (req, res) => {
  try {
    const shippingPolicies = await ShippingPolicySchema.find();
    res.status(200).json({ success: true, shippingPolicies });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Get all Return Policies
exports.getAllReturnPolicies = async (req, res) => {
  try {
    const returnPolicies = await ReturnPolicySchema.find();
    res.status(200).json({ success: true, returnPolicies });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Get all Products
exports.getAllProducts = async (req, res) => {
  const db = mongoose.connection.db;
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "productImages" });

  try {
    // Fetch all products
    const products = await ProductSchema.find().populate(
      "category style shippingPolicy returnPolicy"
    );

    // Helper function to convert image fileId to Base64
    const getImageData = async (fileId, mimeType) => {
      return new Promise((resolve, reject) => {
        if (!fileId) {
          console.error('File ID is undefined');
          return reject(new Error('File ID is undefined'));
        }

        const downloadStream = bucket.openDownloadStream(fileId);
        let imageData = "";

        downloadStream.on("data", (chunk) => {
          imageData += chunk.toString("base64");
        });

        downloadStream.on("end", () => {
          console.log(`Image Data URL: data:${mimeType};base64,${imageData}`);
          resolve(`data:${mimeType};base64,${imageData}`);
        });

        downloadStream.on("error", (error) => {
          console.error("Error retrieving image:", error);
          reject(error);
        });
      });
    };

    // Map over products to add Base64 image data
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const imagePromises = product.images.map(async (image) => {
          try {
            const imageDataURL = await getImageData(image.file.fileId, image.file.type);
            return {
              ...image.toObject(),
              data: imageDataURL,
            };
          } catch (error) {
            console.error('Error retrieving image data:', error);
            return { ...image.toObject(), data: null };
          }
        });

        const imagesWithData = await Promise.all(imagePromises);

        return {
          ...product.toObject(),
          images: imagesWithData,
        };
      })
    );

    res.status(200).json({ success: true, products: productsWithImages });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};



// get products by page
exports.getProductsByPage = async (req, res) => {
  try {
    // Log query parameters and request headers
    console.log("Query Params:", req.query);
    console.log("Request Headers:", req.headers);

    // Get page number from query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = 3;

    // Validate page number
    if (page <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid page number.' });
    }

    // Calculate pagination indexes
    const startIndex = (page - 1) * limit;
    const totalProducts = await ProductSchema.countDocuments();
    const products = await ProductSchema.find()
      .populate("category style shippingPolicy returnPolicy")
      .skip(startIndex)
      .limit(limit);

    // Process products to include base64 images
    const productsWithBase64Images = await Promise.all(
      products.map(async (product) => {
        console.log("Product Images:", product.images); // Log image data
        const db = mongoose.connection.db;
        const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "productImages" });

        const imagesWithBase64 = await Promise.all(
          product.images.map(async (image) => {
            console.log("Image FileId:", image.fileId); // Log fileId
            if (!image.fileId) {
              console.warn("Image fileId is missing for product:", product._id);
              return {
                ...image.toObject(),
                data: null, // or handle this case as needed
              };
            }

            return new Promise((resolve, reject) => {
              const downloadStream = bucket.openDownloadStream(image.fileId);
              let imageData = "";

              downloadStream.on("data", (chunk) => {
                imageData += chunk.toString("base64");
              });

              downloadStream.on("end", () => {
                resolve({
                  ...image.toObject(),
                  data: `data:${image.mimetype};base64,${imageData}`,
                });
              });

              downloadStream.on("error", (error) => {
                console.error("Error retrieving image:", error);
                reject(error);
              });
            });
          })
        );

        return {
          ...product.toObject(),
          images: imagesWithBase64,
        };
      })
    );

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limit);

    // Send response
    res.status(200).json({
      success: true,
      products: productsWithBase64Images,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        limit,
      },
    });
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};


exports.getProductById = async (req, res) => {
  const db = mongoose.connection.db;
  const bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: "productImages",
  });

  try {
    const productId = req.params.id;
    const product = await ProductSchema.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Function to get Base64 image data with MIME type
    const getImageDataURL = (fileId, mimeType) => {
      return new Promise((resolve, reject) => {
        console.log(`Fetching image with fileId: ${fileId}, mimeType: ${mimeType}`);
        const downloadStream = bucket.openDownloadStream(fileId);
        let imageData = "";

        downloadStream.on("data", (chunk) => {
          imageData += chunk.toString("base64");
        });

        downloadStream.on("end", () => {
          console.log(`Received image data for fileId: ${fileId}`);
          if (imageData) {
            resolve(`data:${mimeType};base64,${imageData}`);
          } else {
            reject(new Error("No data received from stream"));
          }
        });

        downloadStream.on("error", (error) => {
          console.error("Error retrieving image:", error);
          reject(error);
        });
      });
    };

    // Map over images to include Base64 data
    const imagesWithBase64 = await Promise.all(
      product.images.map(async (image) => {
        try {
          const imageDataURL = await getImageDataURL(
            image.fileId,
            image.mimetype
          );
          return {
            ...image.toObject(),
            data: imageDataURL,
          };
        } catch (error) {
          console.error(`Error processing image ${image.filename}:`, error);
          return {
            ...image.toObject(),
            data: null, // Handle image processing errors gracefully
          };
        }
      })
    );

    res.json({
      success: true,
      product: {
        ...product.toObject(),
        images: imagesWithBase64,
      },
    });
  } catch (error) {
    console.error("Error retrieving product:", error);
    res.status(500).json({ error: "Failed to retrieve product." });
  }
};


exports.getProductByName = async (req, res) => {
  const db = mongoose.connection.db;
  const bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: "productImages",
  });

  try {
    const productName = req.params.name.trim(); // Trim spaces from the product name

    // Search for product by name
    const product = await ProductSchema.findOne({ name: productName }).populate(
      "category style shippingPolicy returnPolicy"
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Retrieve images as Base64
    const imagesWithBase64 = await Promise.all(
      product.images.map(async (image) => {
        return new Promise((resolve, reject) => {
          const downloadStream = bucket.openDownloadStream(image.fileId);
          let imageData = "";

          downloadStream.on("data", (chunk) => {
            imageData += chunk.toString("base64");
          });

          downloadStream.on("end", () => {
            resolve({
              ...image.toObject(),
              data: `data:${image.mimetype};base64,${imageData}`,
            });
          });

          downloadStream.on("error", (error) => {
            console.error("Error retrieving image:", error);
            reject(error);
          });
        });
      })
    );

    res.json({
      success: true,
      product: {
        ...product.toObject(),
        images: imagesWithBase64,
      },
    });
  } catch (error) {
    console.error("Error retrieving product:", error);
    res.status(500).json({ error: "Failed to retrieve product." });
  }
};

// Get all Offers



//updating products and other models

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCategory = await CategorySchema.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );

    if (!updatedCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await CategorySchema.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Update Style
exports.updateStyle = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStyle = await StyleSchema.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedStyle) {
      return res
        .status(404)
        .json({ success: false, message: "Style not found." });
    }

    res.status(200).json({
      success: true,
      message: "Style updated successfully",
      style: updatedStyle,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Delete Style
exports.deleteStyle = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStyle = await StyleSchema.findByIdAndDelete(id);

    if (!deletedStyle) {
      return res
        .status(404)
        .json({ success: false, message: "Style not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Style deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Update Shipping Policy
exports.updateShippingPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedShippingPolicy = await ShippingPolicySchema.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updatedShippingPolicy) {
      return res
        .status(404)
        .json({ success: false, message: "Shipping policy not found." });
    }

    res.status(200).json({
      success: true,
      message: "Shipping policy updated successfully",
      shippingPolicy: updatedShippingPolicy,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Delete Shipping Policy
exports.deleteShippingPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedShippingPolicy = await ShippingPolicySchema.findByIdAndDelete(
      id
    );

    if (!deletedShippingPolicy) {
      return res
        .status(404)
        .json({ success: false, message: "Shipping policy not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Shipping policy deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Update Return Policy
exports.updateReturnPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedReturnPolicy = await ReturnPolicySchema.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updatedReturnPolicy) {
      return res
        .status(404)
        .json({ success: false, message: "Return policy not found." });
    }

    res.status(200).json({
      success: true,
      message: "Return policy updated successfully",
      returnPolicy: updatedReturnPolicy,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Delete Return Policy
exports.deleteReturnPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReturnPolicy = await ReturnPolicySchema.findByIdAndDelete(id);

    if (!deletedReturnPolicy) {
      return res
        .status(404)
        .json({ success: false, message: "Return policy not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Return policy deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Update Product

exports.updateProduct = async (req, res) => {
  const db = mongoose.connection.db;
  const bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: "productImages",
  });

  const form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.maxFieldsSize = 10 * 1024 * 1024; // 10MB
  form.maxFileSize = 10 * 1024 * 1024; // 10MB
  form.multiples = true;

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Form parsing failed." });

    const productId = req.params.id;

    // Process fields to ensure single values are not arrays
    const {
      name,
      description,
      price,
      brand,
      Material,
      stock,
      category,
      style,
      shippingPolicy,
      returnPolicy,
      discount,
      gender,
      size,
      color,
      section,
      updatedImageFileId,
    } = fields;

    const processedName = Array.isArray(name) ? name[0] : name;
    const processedDescription = Array.isArray(description) ? description[0] : description;
    const processedBrand = Array.isArray(brand) ? brand[0] : brand;
    const processedMaterial = Array.isArray(Material) ? Material[0] : Material;
    const processedDiscount = Array.isArray(discount) ? discount[0] : discount;
    const processedGender = Array.isArray(gender) ? gender[0] : gender;
    const processedSection = Array.isArray(section) ? section[0] : section;

    // Process arrays
    const sizeArray = Array.isArray(size) ? size : (typeof size === 'string' ? size.split(',') : []);
    const colorArray = Array.isArray(color) ? color : (typeof color === 'string' ? color.split(',') : []);

    const updateData = {
      name: processedName,
      description: processedDescription,
      price: isNaN(parseFloat(price)) ? undefined : parseFloat(price),
      brand: processedBrand,
      Material: processedMaterial,
      stock: isNaN(parseInt(stock, 10)) ? undefined : parseInt(stock, 10),
      category,
      style,
      shippingPolicy,
      returnPolicy,
      discount: isNaN(parseFloat(processedDiscount)) ? undefined : parseFloat(processedDiscount),
      gender: processedGender,
      size: sizeArray,
      color: colorArray,
      section: processedSection,
    };

    try {
      let imageFiles = files.file;
      if (!Array.isArray(imageFiles)) imageFiles = [imageFiles];

      // Handle image updates
      if (imageFiles.length > 0 || updatedImageFileId) {
        const product = await ProductSchema.findById(productId);

        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }

        // Remove old image if `updatedImageFileId` is provided
        if (updatedImageFileId) {
          product.images = product.images.filter(
            (image) => image.file.fileId.toString() !== updatedImageFileId
          );
        }

        // Upload new images
        const imageDocuments = [];
        const uploadPromises = imageFiles.map(
          (file) =>
            new Promise((resolve, reject) => {
              const uploadStream = bucket.openUploadStream(file.originalFilename, {
                contentType: file.mimetype,
              });
              const fileStream = fs.createReadStream(file.filepath);

              fileStream.pipe(uploadStream);

              uploadStream.on("finish", () => {
                imageDocuments.push({
                  file: {
                    fileId: uploadStream.id,
                    filename: file.originalFilename,
                    mimetype: file.mimetype,
                    size: file.size,
                    uploadedAt: new Date(),
                  },
                  label: file.originalFilename,
                });
                resolve();
              });

              uploadStream.on("error", (error) => {
                console.error("Error uploading image:", error);
                reject(error);
              });
            })
        );

        await Promise.all(uploadPromises);

        product.images = [...product.images, ...imageDocuments];

        updateData.images = product.images;
      }

      // Update product with new data
      const result = await ProductSchema.findByIdAndUpdate(
        productId,
        updateData,
        {
          new: true,
        }
      );

      if (!result) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json({ message: "Product updated successfully", product: result });
    } catch (error) {
      console.error("Failed to update product:", error);
      res.status(500).json({ error: "Failed to update product." });
    }
  });
};



// Delete Product
exports.deleteProduct = async (req, res) => {
  const db = mongoose.connection.db;
  const bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: "productImages",
  });

  try {
    const productId = req.params.id;
    const product = await ProductSchema.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete associated images
    await Promise.all(
      product.images.map((image) => {
        return new Promise((resolve, reject) => {
          if (image.fileId) {
            bucket.delete(image.fileId, (err) => {
              if (err) {
                console.error("Error deleting image:", err);
                reject(err);
              } else {
                resolve();
              }
            });
          } else {
            console.warn("Skipping deletion: File ID is undefined for image", image);
            resolve(); // Skip this image and proceed with others
          }
        });
      })
    );

    // Delete the product
    await ProductSchema.findByIdAndDelete(productId);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Failed to delete product:", error);
    res.status(500).json({ error: "Failed to delete product." });
  }
};


// Update Offer
exports.updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOffer = await OfferSchema.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedOffer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found." });
    }

    res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      offer: updatedOffer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Delete Offer
exports.deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOffer = await OfferSchema.findByIdAndDelete(id);

    if (!deletedOffer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Offer deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

exports.getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await ProductSchema.find({ category }).populate(
      "category style shippingPolicy returnPolicy"
    );
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Get products by color
exports.getProductsByColor = async (req, res) => {
  const { color } = req.params;
  try {
    const products = await ProductSchema.find({ color }).populate(
      "category style shippingPolicy returnPolicy"
    );
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Get products by size
exports.getProductsBySize = async (req, res) => {
  const { size } = req.params;
  try {
    const products = await ProductSchema.find({ size }).populate(
      "category style shippingPolicy returnPolicy"
    );
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
