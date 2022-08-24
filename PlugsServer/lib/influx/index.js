const Influxdb = require('influxdb-v2');

const db = new Influxdb({
	host: process.env.Influx_Host,
	protocol: process.env.Influx_Protocol,
	port: process.env.Influx_Port,
	token: process.env.Influx_Token
});

/**
 * Write one Datapoint to influxdb
 * @param {String|Number} measurement 
 * @param {String|Number} value 
 * @param {String} host 
 */
const writeDatapoint = async (measurement, value, host) => {
	console.log(`Writing Datapoint to InfluxDB: ${measurement} of ${host}`);
	await db.write(
		{
			precision: 's',
			bucket: process.env.bucket,
			org: process.env.orga
		}, [{
			measurement: measurement,
			tags: { host: host },
			fields: value
		}]
	)
}

module.exports = {
	writeDatapoint
}