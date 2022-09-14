const Influxdb = require('influxdb-v2');
const { log } = require('../../../Web/lib/logger');

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
	log.info(`Writing Datapoint to InfluxDB: ${measurement} of ${host}`);
	await db.write(
		{
			precision: 's',
			bucket: process.env.Infux_Bucket,
			org: process.env.Influx_Orga
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