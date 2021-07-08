import asyncio
import re

import asyncpg as asyncpg
from aiohttp import ClientSession, ClientTimeout

regex = re.compile('{s}([^{]+){m}([^{]+){e}')

conn_string = input('Please enter DBD Connection String: ')


async def setup():
    pool: asyncpg.pool = await asyncpg.create_pool(conn_string,
                                                   max_size=20, min_size=1)
    # client = ClientSession(timeout=ClientTimeout(total=4))

    return pool  # , client


async def get_targets(pool):
    async with pool.acquire() as conn:
        rows = await conn.fetch('SELECT ipaddr from plugs')
        targets = []
        for row in rows:
            targets.append(row[0].compressed)
        return targets


async def job1s(pool, target):
    """This job runs every 1 second and gets the current wattage value to put into the power_history table"""
    try:
        async with ClientSession(timeout=ClientTimeout(total=0.3)) as session:
            async with session.get(f'http://{target}/?m=1') as response:
                y = await response.text()
            response_string: str = y
            match = re.findall(regex, response_string)
            if '>ON<' in response_string:
                current_state = True
            elif '>OFF<' in response_string:
                current_state = False
            # print(match)

            async with pool.acquire() as conn:
                await conn.execute('INSERT INTO power_history(plugid, energy_now, voltage_now) VALUES ((SELECT plugid '
                                   'FROM plugs WHERE ipaddr = $1), $2, $3)', target, int(match[2][1].replace('W', '')),
                                   int(match[0][1].replace('V', '')))

                await conn.execute('INSERT INTO plugs_history(plugid, energy) VALUES ((SELECT plugid '
                                   'FROM plugs WHERE ipaddr = $1), $2)', target, float(match[8][1].replace('kWh', '')))

                await conn.execute('UPDATE plugs SET state = $2 WHERE ipaddr = $1', target, current_state)

                allowed_state = await conn.fetch('SELECT allowed_state from plugs where ipaddr = $1', target)

                if current_state and not allowed_state[0][0]:
                    print(f'Stromdieb!!! bei Steckdose {target}')
                    async with ClientSession(timeout=ClientTimeout(total=0.3)) as session2:
                        async with session.get(f'http://{target}/cm?cmnd=Power%20OFF') as response:
                            c = await response.text()
                            await session2.close()

                    print(c)
        return match[0][1]

    except Exception as e:
        # print(f'Timeout on {target}: {e}')
        pass


def helper(db_pool, target):
    loop.run_until_complete(job1s(db_pool, target))


async def main():
    targets = await get_targets(pool)

    while True:
        for target in targets:
            y = await job1s(pool, target)


if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    pool = loop.run_until_complete(setup())
    loop.run_until_complete(main())
