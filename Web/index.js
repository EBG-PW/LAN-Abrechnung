const app = require('./src/app');

console.log("All Systems Running!")

process.on('message', function (packet) {
  const { data } = packet;
  console.log(` Got Data:`, data)
})

setTimeout(() => {
  const port = process.env.PORT || 5000;
  app.listen(parseInt(port, 10), () => {
    console.log(`Listening on port ${port}`);
  });
}, 250);
