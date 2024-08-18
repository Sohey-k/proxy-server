const express = require("express")
const app = express()
const { createProxyMiddleware } = require("http-proxy-middleware")
const rateLimit = require("express-rate-limit")
require("dotenv").config()
const url = require("url")


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000,
})

// CORSを許可するミドルウェアを追加
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});


app.use(limiter)

app.get("/", (req, res) => {
    res.send("This is my proxy server")
})

app.use("/weather-data", (req, res, next) => {
    const city = url.parse(req.url).query
    createProxyMiddleware({
        target: `${process.env.BASE_API_URL_WEATHERAPI}${city}&aqi=no`,
        changeOrigin: true,
        pathRewrite: {
            [`^"/weather-data`]: "",
        },
    })(req, res, next)
})

app.use("/corona-tracker-country-data", (req, res, next) => {
    const city = url.parse(req.url).query
    createProxyMiddleware({
        target: `${process.env.BASE_API_URL_CORONA_COUNTRY}/${city}`,
        changeOrigin: true,
        pathRewrite: {
            [`^/corona-tracker-country-data`]: "",
        },
    })(req, res, next)
})

app.use("/corona-tracker-world-data", (req, res, next) => {
    createProxyMiddleware({
        target: process.env.BASE_API_URL_CORONA_WORLD,
        changeOrigin: true,
        pathRewrite: {
            [`^/corona-tracker-world-data`]: "",
        },
    })(req, res, next)
})

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

module.exports = app
