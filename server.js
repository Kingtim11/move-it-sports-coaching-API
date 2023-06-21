require("dotenv").config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const app = express();
// Enable CORS
app.use(cors());
app.use(express.json());

const OAuth2_client = new OAuth2(process.env.CLIENTID, process.env.CLIENTSECRET);
OAuth2_client.setCredentials({ refresh_token : process.env.REFRESHTOKEN });


// Define the email sending route
app.post('/send-email', (req, res) => {
    const { postName, postEmail, postContent } = req.body; // Destructure the properties from req.body
    const accessToken = OAuth2_client.getAccessToken();

    // Nodemailer configuration
    const transporter = nodemailer.createTransport({
        service: process.env.SERVICE,
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL, // Gmail address
          clientId: process.env.CLIENTID,
          clientSecret: process.env.CLIENTSECRET,
          refreshToken: process.env.REFRESHTOKEN,
          accessToken: accessToken
          //pass: process.env.KEY, // Gmail password or app-specific password
        },
      });
  
    // Email sending options
    const mailOptions = {
      to: process.env.EMAIL, // Recipient email address
      subject: '***TEST*** New Enquiry from Website', // Email subject
      text: `Name: ${postName}\nEmail: ${postEmail}\nContent: ${postContent}`, // Email body
    };
  
    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send('An error occurred while sending the email.');
      } else {
        console.log('Email sent:', info.response);
        res.send('Email sent successfully');
      }
    });
  });
  
  app.get('/', (req,res) => { res.send(`Server is running.`) })
// Start the server
app.listen(process.env.PORT || 8080, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});