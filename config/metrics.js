module.exports = {
    "plugserver_metrics": {
        'TotalCurrentPower': {
            'type': 'gauge',
            'help': 'The total current power of the plugserver',
            'metric': 'power_total_current_power_watts'
        },
        'OpenWebSockets': {
            'type': 'gauge',
            'help': 'The total number of open websockets',
            'metric': 'power_open_websockets'
        },
        'InMessagesCounter': {
            'type': 'counter',
            'help': 'The total number of incoming messages',
            'metric': 'power_incoming_messages'
        },
        'OutMessagesCounter': {
            'type': 'counter',
            'help': 'The total number of outgoing messages',
            'metric': 'power_outgoing_messages'
        },
        'LastInMessagesCounter': {
            'type': 'counter',
            'help': 'The total number of incoming messages',
            'metric': 'power_last_incoming_messages'
        },
        'LastOutMessagesCounter': {
            'type': 'counter',
            'help': 'The total number of outgoing messages',
            'metric': 'power_last_outgoing_messages'
        },
        'InMessagesPerSecond': {
            'type': 'gauge',
            'help': 'The total number of incoming messages per second',
            'metric': 'power_incoming_messages_per_second'
        },
        'OutMessagesPerSecond': {
            'type': 'gauge',
            'help': 'The total number of outgoing messages per second',
            'metric': 'power_outgoing_messages_per_second'
        },
        'CalculatedMessagesCounterinS': {
            'type': 'counter',
            'help': 'The total number of calculated messages',
            'metric': 'power_calculated_messages'
        },
        'LastCalculatedMessagesCounterinS': {
            'type': 'counter',
            'help': 'The total number of calculated messages',
            'metric': 'power_last_calculated_messages'
        },
    },
}