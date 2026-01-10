export class TransferConversationCommand {
  constructor(
    public readonly conversationId: string,
    public readonly fromAdvisorId: string,
    public readonly toAdvisorId: string,
  ) {}
}
