const File = require("../model/file");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { sendEmail } = require("../services/emailService");
const { Template } = require("../services/emailTemplate");

let storage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

let upload = multer({
  storage,
  limits: { fileSize: 1000000 * 100 },
}).single("myFile");

exports.fileReceive = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).send({ err: "Ooops!!!" });
    }
    if (!req.file) {
      return res.status(500).json({
        success: false,
        message: "Unable to Upload at this time!",
      });
    }

    const file = await File.create({
      filename: req.file.filename,
      uuid: uuidv4(),
      path: req.file.path,
      size: req.file.size,
    });
    const response = await file.save();
    res.json({
      message: "Uploaded Successfully",
      file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
    });
    // http://localhost:4000/files/uyewyoweroiwquiowuiouqeiouq
  });
};

exports.getFile = async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.id });

    if (!file) {
      return res.render("download", { error: "Link has been expired!!!" });
    }

    return res.render("download", {
      uuid: file.uuid,
      fileName: file.filename,
      fileSize: file.size,
      downloadLink: `${process.env.APP_BASE_URL}/api/v1/files/downloads/${file.uuid}`,
    });
  } catch (error) {
    return res.render("download", { error: "Something went wrong." });
  }
};

exports.Downloads = async (req, res) => {
  const file = await File.findOne({ uuid: req.params.id });
  if (!file) {
    return res.render("download", { error: "Link has been expired!!" });
  }
  const filePath = `${__dirname}/../${file.path}`;
  console.log(filePath);
  res.download(filePath);
};

exports.sendFiles = async (req, res) => {
  try {
    const { id, emailFrom, emailTo } = req.body;
    if (!id || !emailFrom || !emailTo) {
      return res
        .status(422)
        .send({ error: "All fields are required except expiry." });
    }

    const file = await File.findOne({ uuid: id });

    if (file.sender) {
      return res.status(422).send({ error: "Email already sent once." });
    }

    file.sender = emailFrom;
    file.receiver = emailTo;
    const response = await file.save();

    // Send Email
    sendEmail({
      from: emailFrom,
      to: emailTo,
      subject: "File Sharing Made Easy",
      text: `${emailFrom} shared a file with you!!`,
      html: Template({
        emailFrom: emailFrom,
        downloadLink: `${process.env.APP_BASE_URL}/api/v1/files/downloads${file.uuid}`,
        size: file.size / 1000 + "KB",
        expires: "24 hours",
      }),
    });
    return res.send({success: true, message: "File Send to the receiver!!"})
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: error.message,
    });
  }
};
