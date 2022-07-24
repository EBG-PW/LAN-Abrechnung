const app = require('./src/app');

console.log("All Systems Running!")

process.on('message', function (packet) {
  const { data } = packet;
  console.log(` Got Data:`, data)
})

setTimeout(() => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    /* eslint-disable no-console */
    console.log(`Listening: ${process.env.IP}:${port}`);
    /* eslint-enable no-console */
  });
}, 250);