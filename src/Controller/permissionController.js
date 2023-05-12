const { redisClient } = require("../middleware/redisClient");
const Permissions = require("../Models/Permission");

const cacheKey = "PERMISSION";

const getAllPermissions = async (req, res, next) => {
  try {
    const cache = await redisClient.get(cacheKey);
    let cacheObj = "";
    let cacheLength = 0;
    if (cache != null) {
      cacheObj = JSON.parse(cache);
      cacheLength = Object.keys(cacheObj).length;
    } else {
      cacheLength = 0;
      cacheObj = "";
    }
    Permissions.find({})
      .then(
        (permisssions) => {
          if (permisssions === "") {
            res.status(404).json({
              success: false,
              message: "permissions not found",
            });
            return;
          }
          if (permisssions.length > cacheLength) {
            redisClient.set("PERMISSION", JSON.stringify(permisssions));
            res.status(200).json({
              success: true,
              message: "permissions found",
              data: permisssions,
            });
          }
          if (permisssions.length < cacheLength) {
            redisClient.del(cacheKey);
            redisClient.set(cacheKey, JSON.stringify(permisssions));
            res.status(200).json({
              success: true,
              message: "permissions found",
              data: JSON.parse(cache),
            });
          }
          let permissionTitleCheck = true;
          if (permisssions.length === cacheLength) {
            // eslint-disable-next-line no-restricted-syntax, guard-for-in
            for (const _id in permisssions) {
              // eslint-disable-next-line no-prototype-builtins
              if (permisssions.hasOwnProperty(_id)) {
                // Check if the user exists in cache object
                // eslint-disable-next-line no-prototype-builtins
                if (cacheObj.hasOwnProperty(_id)) {
                  const permissionTitle = permisssions[_id].title;
                  const cacheTitle = cacheObj[_id].title;
                  // Compare the email values
                  if (permissionTitle !== cacheTitle) {
                    permissionTitleCheck = false;
                  }
                }
              }
            }
            if (permissionTitleCheck === false) {
              redisClient.del(cacheKey);
              redisClient.set(cacheKey, JSON.stringify(permisssions));
              res.status(200).json({
                success: true,
                message: "Users found",
                data: permisssions,
              });
            } else {
              res.status(200).json({
                success: true,
                message: "Users found",
                data: JSON.parse(cache),
              });
            }
          }
        },
        (err) => next(err)
      )
      .catch(() => next(new Error("Couldn't retrieve permission")));
  } catch (err) {
    next(new Error("Permission not retrieved"));
  }
};
const createPermission = (req, res, next) => {
  if (req.body.title === "") {
    res.status(404).json({
      success: false,
      message: "title must not be empty",
    });
    return;
  }
  const newPermission = new Permissions({
    title: req.body.title,
    route: req.body.route,
  });
  Permissions.create(newPermission)
    .then(
      (permission) => {
        res.status(201).json({
          success: true,
          message: "Permission created",
          data: permission,
        });
      },
      (err) => next(err)
    )
    .catch(() => next(new Error("Couldn't Create Permission")));
};

const updatePermission = (req, res, next) => {
  if (req.body.title === "") {
    res.status(404).json({
      success: false,
      message: "title must not be empty",
    });
    return;
  }
  Permissions.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  )
    .then(
      () => {
        redisClient.del(cacheKey);
        const allPermissions = Permissions.find({});
        redisClient.set(cacheKey, JSON.stringify(allPermissions));
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, message: "Permission updated" });
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};
const deletePermission = async (req, res, next) => {
  const permission = await Permissions.findById(req.params.id);
  if (!permission) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({ success: true, message: "permission is already deleted" });
  }
  Permissions.findByIdAndDelete(req.params.id)
    .then(
      () => {
        redisClient.del(cacheKey);
        const allPermissions = Permissions.find({});
        redisClient.set(cacheKey, JSON.stringify(allPermissions));
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, message: "Permission deleted" });
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};
module.exports = {
  getAllPermissions,
  createPermission,
  deletePermission,
  updatePermission,
};
