export class AssignConversationCommand {
  constructor(
    public readonly conversationId: string,
    public readonly advisorId: string,
  ) {}
}
