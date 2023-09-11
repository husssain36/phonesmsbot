const express = require("express");
const app = express();
require("dotenv").config();

const port = process.env.PORT;
const api_key = process.env.GRIZZLY_API_KEY;

app.get("/", (req, res) => {
  res.send("Grizzly Api");
});

app.get("/select-country", async (req, res) => {
  // utils/countryCodes.js
});

app.get("/select-service", async (req, res) => {
  //   // utils/serviceCodes.js
});

app.get("/available-numbers/:country/:service", async (req, res) => {
  let country = req.query.country;
  let service = req.query.service;
  const api = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${api_key}&action=getNumber&service=${service}&country=${country}`;
  try {
    const response = await axios.post(api);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/get-prices/:country/:service", async (req, res) => {
  let country = req.query.country;
  let service = req.query.service;
  const api = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${api_key}&action=getPrices&country=${country}`;
  try {
    const response = await axios.post(api);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/set-status/:id/:status/:forward", async (req, res) => {
  const { id, status, forward } = req.params;
  const url = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${api_key}&action=setStatus&status=${status}&id=${id}&forward=${forward}`;

  try {
    const response = await axios.post(url);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/get-status/:id", async (req, res) => {
  const { id } = req.params;
  const url = `https://api.grizzlysms.com/stubs/handler_api.php?api_key=${api_key}&action=getStatus&id=${id}`;

  try {
    const response = await axios.get(url);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}/ `);
});
