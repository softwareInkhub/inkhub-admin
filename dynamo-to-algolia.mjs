import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
// NOTE: This script is now ESM. Run it with: node dynamo-to-algolia.mjs

import { algoliasearch } from 'algoliasearch';
import AWS from 'aws-sdk';

const DYNAMO_REGION = process.env.AWS_REGION || 'us-east-1';
const DYNAMO_TABLE = 'shopify_inkhub_get_orders';
const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
const ALGOLIA_INDEX = process.env.ALGOLIA_INDEX;
const BATCH_SIZE = 1000;

AWS.config.update({
  region: DYNAMO_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function fetchAllRecords(limit) {
  let items = [];
  let params = { TableName: DYNAMO_TABLE };
  let data;
  do {
    data = await dynamoDB.scan(params).promise();
    items = items.concat(data.Items);
    console.log(`Fetched ${items.length} records so far...`);
    if (limit && items.length >= limit) {
      items = items.slice(0, limit); // Only keep up to the limit
      break;
    }
    params.ExclusiveStartKey = data.LastEvaluatedKey;
  } while (typeof data.LastEvaluatedKey !== 'undefined');
  return items;
}

function mapOrderSummary(records) {
  return records.map(record => {
    const base = record.Item ? record.Item : record;
    const first_name = base.customer?.first_name || '';
    const last_name = base.customer?.last_name || '';
    return {
      objectID: base.id || record.id,
      order_number: base.order_number,
      first_name,
      last_name,
      full_name: `${first_name} ${last_name}`.trim(),
      phone: base.customer?.phone || '',
      total: base.total_price,
      status: base.financial_status,
      fulfillment: base.fulfillment_status,
      items: Array.isArray(base.line_items) ? base.line_items.length : 0,
      created: base.created_at,
      updated: base.updated_at,
    };
  });
}

const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);

async function pushToAlgolia(records, batchSize = BATCH_SIZE) {
  for (let i = 0; i < records.length; i += batchSize) {
    let batch = records.slice(i, i + batchSize);
    // Filter out any undefined, null, non-object, missing objectID, or too-large records
    batch = batch.filter(obj =>
      obj &&
      typeof obj === 'object' &&
      typeof obj.objectID === 'string' &&
      obj.objectID.trim() !== '' &&
      Buffer.byteLength(JSON.stringify(obj), 'utf8') <= 10000
    );
    if (batch.length === 0) continue;
    // Debug logging
    console.log('First batch record:', JSON.stringify(batch[0], null, 2));
    console.log('Batch is array:', Array.isArray(batch));
    console.log('All records are plain objects:', batch.every(obj => obj && typeof obj === 'object' && !Array.isArray(obj)));
    console.log('Uploading batch:', batch.length, 'records');
    await algoliaClient.saveObjects({ indexName: ALGOLIA_INDEX, objects: batch });
    console.log(`Uploaded batch ${i / batchSize + 1} (${batch.length} records)`);
  }
}

try {
  console.log('Fetching data from DynamoDB...');
  const records = await fetchAllRecords();
  console.log(`Mapping order summaries for ${records.length} records...`);
  const summaries = mapOrderSummary(records);
  console.log('Pushing data to Algolia...');
  await pushToAlgolia(summaries);
  console.log('Migration complete!');
} catch (err) {
  console.error('Error during migration:', err);
} 