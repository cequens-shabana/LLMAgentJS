// deno test --allow-net lib/redis.test.ts
import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { connect } from 'https://denopkg.com/keroxp/deno-redis/mod.ts';

Deno.test('Redis get should return 1', async () => {
  const client = await connect({
    hostname: '127.0.0.1',
    port: 6379,
  });


  const value = await client.get('persona:1');
  const parsedValue = value ? JSON.parse(value) : null;
  console.log(parsedValue);
  console.log("value: ", parsedValue.id);
  console.log("value.pers_templ: " , parsedValue.pers_templ);
  
  assertEquals(value, '1');

  client.close();
});