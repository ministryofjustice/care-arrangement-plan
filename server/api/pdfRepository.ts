import {
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

import config from '../config';

import dynamoClient from './dynamoClient';

export interface Pdf {
  planId: string;
  pdfId: string;
  s3Key: string;
  version: number;
  generatedDate: string;
}

export default class PdfRepository {
  private readonly client = dynamoClient;

  async getPdf(planId: string, pdfId: string) {
    return this.client.send(
      new GetCommand({
        TableName: config.dynamo.tableName,
        Key: {
          planId,
          pdfId,
        },
      }),
    );
  }

  async getPdfsByPlanId(planId: string) {
    return this.client.send(
      new QueryCommand({
        TableName: config.dynamo.tableName,
        KeyConditionExpression:
          'planId = :planId',
        ExpressionAttributeValues: {
          ':planId': planId,
        },
      }),
    );
  }

  async createPdf(pdf: Pdf) {
    return this.client.send(
      new PutCommand({
        TableName: config.dynamo.tableName,
        Item: pdf,
      }),
    );
  }

  async updatePdf(pdf: Pdf) {
    return this.client.send(
      new PutCommand({
        TableName: config.dynamo.tableName,
        Item: pdf,
      }),
    );
  }
}