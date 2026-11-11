import { ApiClient } from '../api-client';
import type { Message } from './message-data';

interface SendMessageResponse {
  success: boolean;
}

export class MessageService extends ApiClient {
  async send(message: Message): Promise<SendMessageResponse> {
    const response = await this.request.post(this.url('api/message'), { data: message });
    return this.parse<SendMessageResponse>(response, 200);
  }
}
