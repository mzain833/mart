
// import getCloudinary from "../../config/cloudinary.js";

// const CLOUDINARY_FOLDER = "nexamart/products";

// const uploadSingleImage = (file) => {
//   if (!file?.buffer?.length) {
//     throw new Error("Invalid image file buffer.");
//   }

//   const cloudinary = getCloudinary();

//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       {
//         folder: CLOUDINARY_FOLDER,
//         resource_type: "image",
//         quality: "auto",
//         fetch_format: "auto",
//       },
//       (error, result) => {
//         if (error) {
//           console.error("CLOUDINARY ERROR DETAILS:", {
//             message: error.message,
//             http_code: error.http_code,
//             name: error.name,
//             response: error.error,
//           });

//           return reject(error);
//         }

//         if (!result?.secure_url || !result?.public_id) {
//           return reject(
//             new Error("Cloudinary returned an invalid upload response.")
//           );
//         }

//         resolve({
//           url: result.secure_url,
//           publicId: result.public_id,
//         });
//       }
//     );

//     stream.on("error", reject);
//     stream.end(file.buffer);
//   });
// };

// const deleteProductImages = async (images = []) => {
//   const validImages = images.filter(
//     (image) => image?.publicId
//   );

//   if (!validImages.length) return;

//   const cloudinary = getCloudinary();

//   const results = await Promise.allSettled(
//     validImages.map((image) =>
//       cloudinary.uploader.destroy(image.publicId, {
//         resource_type: "image",
//         invalidate: true,
//       })
//     )
//   );

//   results.forEach((result) => {
//     if (result.status === "rejected") {
//       console.error(
//         "Cloudinary image cleanup failed:",
//         result.reason?.message
//       );
//     }
//   });
// };

// const uploadProductImages = async (files = []) => {
//   const uploadedImages = [];

//   try {
//     for (const file of files) {
//       const image = await uploadSingleImage(file);
//       uploadedImages.push(image);
//     }

//     return uploadedImages;
//   } catch (error) {
//     try {
//       await deleteProductImages(uploadedImages);
//     } catch (cleanupError) {
//       console.error(
//         "Cloudinary rollback failed:",
//         cleanupError.message
//       );
//     }

//     throw error;
//   }
// };

// const imageService = {
//   uploadProductImages,
//   deleteProductImages,
// };

// export default imageService;
 



import getCloudinary from "../../config/cloudinary.js";

const CLOUDINARY_FOLDER = "nexamart/products";

const uploadSingleImage = (file) => {
  if (!file?.buffer?.length) {
    throw new Error("Invalid image file buffer.");
  }

  const cloudinaryClient = getCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinaryClient.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        resource_type: "image",
        quality: "auto",
        fetch_format: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload failed:", {
            message: error.message,
            httpCode: error.http_code,
          });

          return reject(error);
        }

        if (!result?.secure_url || !result?.public_id) {
          return reject(
            new Error("Invalid Cloudinary upload response.")
          );
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.on("error", reject);
    stream.end(file.buffer);
  });
};

const deleteProductImages = async (images = []) => {
  const publicIds = [
    ...new Set(
      images
        .map((image) => image?.publicId)
        .filter(
          (publicId) =>
            typeof publicId === "string" &&
            publicId.trim().length > 0
        )
    ),
  ];

  if (!publicIds.length) {
    return { deleted: 0, failed: 0 };
  }

  const cloudinaryClient = getCloudinary();

  const results = await Promise.allSettled(
    publicIds.map((publicId) =>
      cloudinaryClient.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true,
      })
    )
  );

  let deleted = 0;
  let failed = 0;

  results.forEach((result, index) => {
    if (
      result.status === "fulfilled" &&
      ["ok", "not found"].includes(result.value?.result)
    ) {
      deleted += 1;
      return;
    }

    failed += 1;

    console.error("Cloudinary image cleanup failed:", {
      publicId: publicIds[index],
      error:
        result.status === "rejected"
          ? result.reason?.message
          : result.value?.result,
    });
  });

  return { deleted, failed };
};

const uploadProductImages = async (files = []) => {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("At least one image file is required.");
  }

  const uploadedImages = [];

  try {
    for (const file of files) {
      const image = await uploadSingleImage(file);
      uploadedImages.push(image);
    }

    return uploadedImages;
  } catch (error) {
    const rollback = await deleteProductImages(uploadedImages);

    if (rollback.failed > 0) {
      console.error("Cloudinary upload rollback incomplete:", rollback);
    }

    throw error;
  }
};

const imageService = {
  uploadProductImages,
  deleteProductImages,
};

export default imageService;
