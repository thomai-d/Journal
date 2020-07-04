import axios from 'axios';

export interface Document {
      id: string,
      author: string,
      content: string,
      tags: string[],
      created: string
}

export async function queryDocuments(tags: string[]): Promise<Document[]> {
  console.log('QUERY');
  const response = await axios.post<Document[]>('api/document/query', { tags });

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