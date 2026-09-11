import type { NextFunction, Request, RequestHandler, Response } from "express";
import multer, { MulterError } from "multer";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

class InvalidAvatarTypeError extends Error {}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      callback(new InvalidAvatarTypeError("INVALID_FILE_TYPE"));
      return;
    }
    callback(null, true);
  },
});

export const avatarUpload: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  upload.single("avatar")(req, res, (err: unknown) => {
    if (err instanceof MulterError && err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ error: "le fichier dépasse 5 Mo" });
      return;
    }

    if (err instanceof InvalidAvatarTypeError) {
      res
        .status(400)
        .json({ error: "format non supporté (JPG, PNG ou WEBP uniquement)" });
      return;
    }

    if (err != null) {
      next(err);
      return;
    }

    next();
  });
};
