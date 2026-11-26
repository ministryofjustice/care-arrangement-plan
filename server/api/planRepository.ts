import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

import config from '../config';

import dynamoClient from './dynamoClient';

export interface Plan {
  arrangementId: string;
  planId: string;
  status: string;
  createdDate: string;
  updatedDate: string;
  ttl: number;
  numberOfChildren: number;
  namesOfChildren: string[];
  initialAdultName: string;
  secondaryAdultName: string;
  livingAndVisiting: object;
  handoverAndHolidays: object;
  education: object;
  childHealth: object;
  specialDays: object;
  otherThings: object;
  decisionMaking: object;
}

export default class PlanRepository {
  private readonly client = dynamoClient;

  async getPlan(arrangementId: string, planId: string) {
    return this.client.send(
      new GetCommand({
        TableName: config.dynamo.tableName,
        Key: {
          arrangementId,
          planId,
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

  async updatePlan(plan: Plan) {
    return this.client.send(
      new PutCommand({
        TableName: config.dynamo.tableName,
        Item: plan,
      }),
    );
  }

}