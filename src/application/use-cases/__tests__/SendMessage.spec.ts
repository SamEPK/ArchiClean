import { SendMessage } from '../SendMessage';
import { InMemoryMessageRepository } from '@infrastructure/repositories/in-memory/InMemoryMessageRepository';

describe('SendMessage', () => {
  it('creates conversation and saves message', async () => {
    const repo = new InMemoryMessageRepository();
    const useCase = new SendMessage(repo);
    await useCase.execute('conv1', 'user1', 'hello');
    const messages = await repo.listMessages('conv1');
    expect(messages.length).toBe(1);
  });
});
