import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

import config from '../config';

import dynamoClient from './dynamoClient';

export interface Arrangement {
    arrangementId: string;
    userId: string;
    ttl: number;
}

export default class ArrangementRepository {
    private readonly client = dynamoClient;

    async getArrangement(userId: string, arrangementId: string) {
        return this.client.send(
            new GetCommand({
                TableName: config.dynamo.tableName,
                Key: {
                    userId,
                    arrangementId,
                },
            }),
        );
    }

    async createArrangement(arrangement: Arrangement) {
        return this.client.send(
            new PutCommand({
                TableName: config.dynamo.tableName,
                Item: arrangement,
            }),
        );
    }

    async updateArrangement(arrangement: Arrangement) {
        return this.client.send(
            new PutCommand({
                TableName: config.dynamo.tableName,
                Item: arrangement,
            }),
        );
    }
}