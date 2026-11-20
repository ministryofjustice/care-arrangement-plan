import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import config from '../config';

const client = new DynamoDBClient({
  region: config.dynamo.region,
});

const dynamoClient = DynamoDBDocumentClient.from(client);

export default dynamoClient;