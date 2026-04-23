require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const app = express();

app.use(cors());
app.use(express.json());

console.log("--- CHEQUEO DE INICIO ---");
console.log("MONGO_URI existe:", !!process.env.mongo);
console.log("CORREO existe:", !!process.env.CORREO);
console.log("PASS existe:", !!process.env.contrasenaCorreo);

const transporter = nodemailer.createTransport({
    service: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: process.env.CORREO,
        pass: process.env.contrasenaCorreo
    }
});

// Verifica la conexión apenas prendas el server
transporter.verify((error) => {
    if (error) {
        console.log("❌ Error de credenciales local:", error.message);
    } else {
        console.log("✅ Nodemailer está listo en local");
    }
});

mongoose.connect(process.env.mongo)
    .then(() => console.log("Mongo conectado"))
    .catch(err => console.log(err));


const usuarioSchema = new mongoose.Schema({
    nombre: String,
    apellido: String,
    email: String,
    password: String,
    cuenta: String,
    verificado: {
        type: Boolean,
        default: false
    }
});

const Usuario = mongoose.model("Usuario", usuarioSchema);

app.post("/registro", async (req, res) => {
    const { email, password, nombre, apellido } = req.body;
    console.log(email, nombre, apellido);

    try {
        const hash = await bcrypt.hash(password, 10);

        const usuario = await Usuario.findOne({ email });

        if (usuario) {
            return res.status(400).json({ error: "Usuario ya existe" });
        }else{
            const nuevoUsuario = new Usuario({
            nombre,
            apellido,
            email,
            password: hash,
            cuenta: "Alumno"
        });

        await nuevoUsuario.save();

        const token = jwt.sign(
        { id: nuevoUsuario._id },
        process.env.tokenSecret,
        { expiresIn: "1d" }
    );

    const link = `${process.env.URL}/verificar/${token}`;

    await transporter.sendMail({
        from: process.env.CORREO,
        to: email,
        subject: "Verifica tu cuenta",
        html: `
            <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:10px; text-align:center;">

                <h2>¡Gracias por registrarte en el observatorio laboral!</h2>

                <p style="font-size:16px; color:#555;">
                    Apreciamos tu interés por formar parte de nuestro proyecto.
                </p>

                <p style="font-size:16px; color:#555;">
                    Para completar tu registro y activar tu cuenta, haz clic en el botón de abajo:
                </p>

                <div style="margin:30px 0;">
                    <a href="${link}" 
                    style="background:rgb(211, 167, 54); color:white; padding:12px 25px; text-decoration:none; border-radius:5px; font-size:16px;">
                    Activar Cuenta
                    </a>
                </div>

                <p style="font-size:14px; color:#777;">
                    Si tú no realizaste este registro, puedes ignorar este correo.
                </p>

            </div>
        `
    });

    console.log("Correo enviado correctamente a:", email);
    res.json({ mensaje: "Usuario creado. Revisa tu correo." });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error al guardar usuario" });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no existe" });
        }

        const esValida = await bcrypt.compare(password, usuario.password);

        if (!esValida) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        if (!usuario.verificado) {
            return res.status(401).json({
                error: "Debes verificar tu correo"
            });
        }

        const token = jwt.sign(
            {
                id: usuario._id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                cuenta: usuario.cuenta
            },
            process.env.tokenSecret,
            { expiresIn: "1h" }
        );

        res.json({ token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error en login" });
    }
});

app.listen(process.env.port, () => {
    console.log(`Servidor en ${process.env.URL}`);
});

function verificarToken(req, res, next) {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ error: "No autorizado" });
    }

    try {
        const decoded = jwt.verify(token, process.env.tokenSecret);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido" });
    }
}

app.get("/perfil", verificarToken, (req, res) => {
    res.json({
        usuario: req.usuario,
        cuenta: req.usuario.cuenta
    });
});

app.get("/usuarios", verificarToken, async (req, res) => {
    try {
        const usuarios = await Usuario.find();

        res.json({ usuarios });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

app.get("/verificar/:token", async (req, res) => {

    try {
        const data = jwt.verify(
            req.params.token,
            process.env.tokenSecret
        );

        await Usuario.findByIdAndUpdate(data.id, {
            verificado: true
        });

        res.redirect("https://tu-proyecto-en-vercel.vercel.app/html/login.html?msg=verificado");

    } catch (error) {
        res.send("Link inválido o expirado");
    }

});

app.delete("/usuarios/:id", verificarToken, async (req, res) => {
    try {
        if (req.usuario.cuenta !== "Admin") {
            return res.status(403).json({ error: "No tienes permisos de administrador" });
        }

        const id = req.params.id;
        const usuarioEliminado = await Usuario.findByIdAndDelete(id);

        if (!usuarioEliminado) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error al eliminar el usuario" });
    }
});