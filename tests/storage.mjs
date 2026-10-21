import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
export const sqlite=new DatabaseSync(':memory:');sqlite.exec(fs.readFileSync('drizzle/0000_tan_dark_beast.sql','utf8'));
export const objects=new Map();let failNext=false,failAfter=false;
export const env={ADMIN_PASSWORD:'qa-secret-only',OWNER_EMAIL:'owner@qa.invalid',DB:{prepare(sql){let args=[];const statement=sqlite.prepare(sql);return {bind(...values){args=values;return this},async first(){return statement.get(...args)||null},async all(){return {results:statement.all(...args)}},async run(){if(failNext){failNext=false;throw Error('forced database error')}const result=statement.run(...args);if(failAfter){failAfter=false;throw Error('simulated lost acknowledgement')}return result}}}},BUCKET:{async put(key,bytes,metadata){objects.set(key,{body:bytes,httpMetadata:metadata.httpMetadata})},async get(key){return objects.get(key)},async delete(key){objects.delete(key)}}};
export function failInsert(){failNext=true}

export function failAfterCommit(){failAfter=true}
