import dynamoClient from './dynamoClient';

export interface Arrangement {
  userId: string;
}

export default class ArrangementRepository {
  private readonly client = dynamoClient;
}