export class ReplyToConversationCommand {
  constructor(
    public readonly conversationId: string,
    public readonly advisorId: string,
    public readonly content: string,
  ) {}
}
