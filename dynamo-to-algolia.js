// NOTE: This script is now ESM. Run it with: node dynamo-to-algolia.mjs

import AWS from 'aws-sdk';
import algoliasearch from 'algoliasearch';

const DYNAMO_REGION = process.env.AWS_REGION || 'us-east-1';
const DYNAMO_TABLE = 'shopify_inkhub_get_products';
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

async function fetchAllRecords() {
  let items = [];
  let params = { TableName: DYNAMO_TABLE };
  let data;
  do {
    data = await dynamoDB.scan(params).promise();
    items = items.concat(data.Items);
    params.ExclusiveStartKey = data.LastEvaluatedKey;
    console.log(`Fetched ${items.length} records so far...`);
  } while (typeof data.LastEvaluatedKey !== 'undefined');
  return items;
}

function addFullName(records) {
  return records.map(record => {
    const first = record.customer?.first_name || '';
    const last = record.customer?.last_name || '';
    return {
      ...record,
      full_name: `${first} ${last}`.trim(),
      objectID: record.id
    };
  });
}

const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const algoliaIndex = algoliaClient.initIndex(ALGOLIA_INDEX);

async function pushToAlgolia(records, batchSize = BATCH_SIZE) {
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await algoliaIndex.saveObjects(batch);
    console.log(`Uploaded batch ${i / batchSize + 1} (${batch.length} records)`);
  }
}

try {
  console.log('Fetching data from DynamoDB...');
  const records = await fetchAllRecords();
  console.log('Adding full_name to each record...');
  const recordsWithFullName = addFullName(records);
  console.log('Pushing data to Algolia...');
  await pushToAlgolia(recordsWithFullName);
  console.log('Migration complete!');
} catch (err) {
  console.error('Error during migration:', err);
} 