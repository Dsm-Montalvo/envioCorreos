require('dotenv').config();
const express = require('express');
const bodyParser =require('body-parser');
const nodemailer = require ('nodemailer');
const mysql = require('mysql2');
const path = require('path');
const ejs = require('ejs');
const { emitWarning } = require('process');
const { request } = require('http');

const app =express();
app.use(bodyParser.urlencoded({ extended: true}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuracion de la base de datos

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err)=> {
    if(err) throw err;
    console.log('conectado a la base de datos. ');
});

//configuracion de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

//Ruta para mostrar los correos electronicos 
app.get('/', (req, res) => {
    db.query('SELECT * FROM emails', (err, results) =>{
        if(err) throw err;
        res.render('index', { emails: results});
    });
});

app.post('/send', (req, res) => {
    const { subject, message, emails } = req.body;
    emails.forEach(email => {
        //Renderizar el mensaje usando EJS
        ejs.renderFile(path.join(__dirname, 'views', 'emailTemplate.ejs'), { message }, (err, renderedMessage) => {
            if(err) throw err;

            const mailOptions = {
                from: 'd73279292@gmail.com',
                to: email,
                subject: subject,
                html: renderedMessage //usar el mensaje renderizado
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if(error) {
                    console.log('Error al enviar el correo: ', error);
                } else {
                    console.log('Correo enviado: ' + info.response);
                }
            });
        });
    });
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`servidor corriendo en el puerto ${PORT}`);
});