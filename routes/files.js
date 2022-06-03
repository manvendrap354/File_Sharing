const router=require(`express`).Router()
const multer= require(`multer`)
const path = require('path');
const File = require('../models/file');
const { v4: uuidv4 } = require('uuid');
const SendmailTransport = require('nodemailer/lib/sendmail-transport');

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/') ,
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
              cb(null, uniqueName)
    } ,
});
// math random- generates a number between 0 and 1 (0 inclusive);
// extname- file extension

let upload = multer({ 
    storage: storage,
    limits:{ fileSize: 1000000 * 100 },// limit < 100mb   (in bytes);
}).single('myfile'); 

router.post('/', (req,res)=>{
        //Validating request
        upload(req, res, async (err) => {
            if (err) {
              return res.status(500).send({ error: err.message });
            }

        // Store file
        const file = new File({
            filename: req.file.filename,
            uuid: uuidv4(),
            path: req.file.path,
            size: req.file.size
        });

        const response = await file.save();
        res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
      })
})

router.post('/send', async (req, res) => {
    const { uuid, emailTo, emailFrom,} = req.body;
    if(!uuid || !emailTo || !emailFrom) {
        return res.status(422).send({ error: 'All fields are required except expiry.'});
    }

    // Get data from db 
      try{
      const file = await File.findOne({ uuid: uuid });

      // check if file already sent once
      if(file.sender) {
        return res.status(422).send({ error: 'Email already sent once.'});
      }
      file.sender = emailFrom;
      file.receiver = emailTo;
      const response = await file.save();

      // send mail
      const sendMail= require('../services/emailService')
      sendMail({
        from: emailFrom,
        to: emailTo,
        subject: 'File Sharing',
        text: `${emailFrom} shared a file with you.`,
        html: require('../services/emailTemplate')({
                  emailFrom: emailFrom, 
                  downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}` ,
                  size: parseInt(file.size/1000) + ' KB',
                  expires: '24 hours'
        })
      }).then(()=> {
            return res.send({success: true})
      }).catch(err => {
        return res.status(500).json({error: 'Error in email sending.'});
      })
    } catch(err) {
      return res.status(500).send({ error: 'Something went wrong.'});
    }
});


module.exports= router