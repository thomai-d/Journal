import axios from 'axios';

export type NumberDict = { [key: string]: number };

export interface Document {
      id: string,
      author: string,
      content: string,
      tags: string[],
      values: NumberDict,
      created: string
}

export async function queryDocuments(filter: string): Promise<Document[]> {
  const response = await axios.post<Document[]>('api/document/query', { filter });

  if (response.status === 200) {
    return response.data;
  }
 
  throw new Error('Query documents failed');
}

export async function addDocument(content: string): Promise<void> {
  const response = await axios.post<Document[]>('api/document', { content });
  if (response.status === 201) {
    return;
  }
 
  throw new Error(`Add document failed with code ${response.status}`);
}