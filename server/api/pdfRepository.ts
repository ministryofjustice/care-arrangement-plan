import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

import config from '../config';

import dynamoClient from './dynamoClient';

export interface Pdf {
  userId: string;
  pdfId: string;
}

export default class PdfRepository {
  private readonly client = dynamoClient;

  async getPdf(userId: string, pdfId: string) {
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

  async createPdf(pdf: Pdf) {
    return this.client.send(
      new PutCommand({
        TableName: config.dynamo.tableName,
        Item: pdf,
      }),
    );
  }
}