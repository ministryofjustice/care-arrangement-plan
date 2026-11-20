import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

import config from '../config';

import dynamoClient from './dynamoClient';

export interface Plan {
  userId: string;
  pdfId: string;
}

export default class PlanRepository {
  private readonly client = dynamoClient;

  async getPlan(userId: string, pdfId: string) {
    return this.client.send(
      new GetCommand({
        TableName: config.dynamo.tableName,
        Key: {
          userId,
          pdfId,
        },
      }),
    );
  }

  async createPlan(plan: Plan) {
    return this.client.send(
      new PutCommand({
        TableName: config.dynamo.tableName,
        Item: plan,
      }),
    );
  }
}