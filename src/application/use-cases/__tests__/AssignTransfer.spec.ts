import { AssignConversation } from '../AssignConversation';
import { TransferConversation } from '../TransferConversation';
import { InMemoryMessageRepository } from '@infrastructure/repositories/in-memory/InMemoryMessageRepository';
import { Conversation } from '@domain/entities/Conversation';

describe('Assign & Transfer Conversation', () => {
  it('assigns a conversation to advisor and transfers it', async () => {
    const repo = new InMemoryMessageRepository();
    const conv = new Conversation({ id: 'conv1', clientId: 'client1' });
    await repo.createConversation(conv);

    const assign = new AssignConversation(repo);
    await assign.execute('conv1', 'adv1');

    const afterAssign = await repo.findConversationById('conv1');
    expect(afterAssign?.advisorId).toBe('adv1');

    const transfer = new TransferConversation(repo);
    await transfer.execute('conv1', 'adv1', 'adv2');

    const afterTransfer = await repo.findConversationById('conv1');
    expect(afterTransfer?.advisorId).toBe('adv2');
  });
});
