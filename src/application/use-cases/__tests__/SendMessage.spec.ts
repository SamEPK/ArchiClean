import { SendMessage } from '../SendMessage';
import { InMemoryMessageRepository } from '@infrastructure/repositories/in-memory/InMemoryMessageRepository';

describe('SendMessage', () => {
  it('creates conversation and saves message', async () => {
    const repo = new InMemoryMessageRepository();
    const useCase = new SendMessage(repo);
    await useCase.execute({
      conversationId: 'conv1',
      senderId: 'user1',
      content: 'hello',
      senderRole: 'client',
    });
    const messages = await repo.listMessages('conv1');
    expect(messages.length).toBe(1);
  });

  it('auto-assigns to first advisor responder', async () => {
    const repo = new InMemoryMessageRepository();
    const useCase = new SendMessage(repo);

    // client opens conversation
    await useCase.execute({
      conversationId: 'conv1',
      senderId: 'client1',
      content: 'hi',
      senderRole: 'client',
    });

    // first advisor responds -> assignment happens
    await useCase.execute({
      conversationId: 'conv1',
      senderId: 'advisorA',
      content: 'hello',
      senderRole: 'advisor',
    });

    const conv = await repo.findConversationById('conv1');
    expect(conv?.advisorId).toBe('advisorA');
    expect(conv?.firstResponderId).toBe('advisorA');
    expect(conv?.status).toBe('assigned');

    // second advisor tries -> should not override
    await useCase.execute({
      conversationId: 'conv1',
      senderId: 'advisorB',
      content: 'taking over',
      senderRole: 'advisor',
    });

    const convAfter = await repo.findConversationById('conv1');
    expect(convAfter?.advisorId).toBe('advisorA');
  });
});
