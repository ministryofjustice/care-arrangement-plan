import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import config from '../config';

const dynamoClient = new DynamoDBClient({
  region: config.dynamo.region,
});

export default dynamoClient;