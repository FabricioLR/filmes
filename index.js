const express = require("express")
const path = require("path")
const axios = require("axios")
const crypto = require('crypto');

const keyBase64 = "MDEyMzQ1Njc4OTEyMzQ1Ng==";
const ivBase64  = "MjAxNTAzMDEyMDEyMzQ1Ng==";

function getAlgorithm(keyBase64) {
    var key = Buffer.from(keyBase64, 'base64');
    switch (key.length) {
        case 16:
            return 'aes-128-cbc';
        case 32:
            return 'aes-256-cbc';

    }

    throw new Error('Invalid key length: ' + key.length);
}

function encrypt(plainText, keyBase64, ivBase64) {

    const key = Buffer.from(keyBase64, 'base64');
    const iv  = Buffer.from(ivBase64, 'base64');

    const cipher  = crypto.createCipheriv(getAlgorithm(keyBase64), key, iv.slice(0, 16));
    let encrypted = cipher.update(plainText, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

function decrypt(messagebase64, keyBase64, ivBase64) {

    const key = Buffer.from(keyBase64, 'base64');
    const iv  = Buffer.from(ivBase64, 'base64');

    const decipher = crypto.createDecipheriv(getAlgorithm(keyBase64), key, iv.slice(0, 16));
    let decrypted  = decipher.update(messagebase64, 'base64');
    decrypted += decipher.final();
    return decrypted;
}


const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(express.static(path.join("public")))

app.post("/search", async (request, response) => {
    const {page, name} = request.body

    console.log(request.body)

    if (!page || !name){
        return response.status(400).send({ error: "Invalid parameters" })
    }

    const data = await axios.post("https://qcam.f0r2.com/api/search/result", { pn: page, kw: name }, {
        headers: {
            "Accept-Encoding": "gzip",
            "androidid": "7ecbdb184b0aae83",
            "app_id": "netcine",
            "app_language": "pt",
            "channel_code": "cinema_sh_6000",
            "Connection": "Keep-Alive",
            "Content-Type": "application/x-www-form-urlencoded",
            "cur_time": "1721475322404",
            "device_id": "7ecbdb184b0aae83",
            "en_al": "1",
            "gaid": "456a055d-164e-45ca-948d-080b658e113f",
            "Host": "qcam.f0r2.com",
            "is_display": "GMT-04:00",
            "is_language": "pt",
            "is_vvv": "1",
            "log-header": "I am the log request header.",
            "mob_mfr": "samsung",
            "mobmodel": "SM-N976N",
            "package_name": "com.playtok.lspazya",
            "sign": "725C77B91F8AA27BA3486D46D21736B1",
            "sys_platform": "2",
            "sysrelease": "9",
            "token": "gAAAAABmml0dgldlDEptDMF_QjzlWzfU-nL21JRrYpwEbTbF5EUjiBHvRaxDO2cZHnfr0xn--BqzwnwQpsE51Y4UMMX6Mi_CgaCUepj-MMsmpJtm6ulL9QjEyHHYM6_Wh-uS3CFoGE0n7WDclKRtL_XeXh1yT-eTk-zfN3Ow_9h2ikgi-RXx_rvNYj2W5W0FqUTCIDXfvHS3ZDXd5UVYKo8-QNX9ZTGJPAGAQA_C4Kdnyy2rNLEr34hjS3AxrnzvYXGnQOONyiPh",
            "User-Agent": "okhttp/4.10.0",
            "version": "30000",
        }
    })

    var decodedData = decrypt(data.data, keyBase64, ivBase64);

    return response.status(200).send(JSON.parse(decodedData))
})

app.listen(process.env.PORT || 4000, () => {
    console.log("Server is running")
})