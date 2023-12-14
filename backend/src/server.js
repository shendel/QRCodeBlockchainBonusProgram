const express = require("express");
const app = express();
const port = 3100;

app.use('/claim/:address', async(req, res) => {
  const { address } = req.params
  res.json({ answer: 'ok', address });
})


app.listen(port, () => {
  console.log(`Backend started at http://localhost:${port}`);
});
