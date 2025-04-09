const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const app = express();
app.use(express.json());
app.use(cors());

// Configurar credenciales
mercadopago.configure({
    access_token: process.env.ACCESS_TOKEN
});

// Ruta que crea una preferencia de pago
app.post("/crear-preferencia", async (req, res) => {
    try {
        const { titulo, precio } = req.body;

        const preference = {
            items: [
                {
                    title: titulo,
                    unit_price: precio,
                    quantity: 1,
                    currency_id: "UYU"
                }
            ],
            back_urls: {
                success: "http://localhost:5500/public/html/success.html",
                failure: "http://localhost:5500/public/html/failure.html",
                pending: "http://localhost:5500/public/html/pending.html"
            },
            auto_return: "approved",
            installments: 12
        };

        const response = await mercadopago.preferences.create(preference);
        res.json({ init_point: response.body.init_point });
    } catch (error) {
        console.error("Error al crear preferencia:", error);
        res.status(500).json({ error: "No se pudo crear la preferencia" });
    }
});

app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});
