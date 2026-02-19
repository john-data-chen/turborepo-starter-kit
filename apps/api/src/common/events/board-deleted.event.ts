export class BoardDeletedEvent {
  constructor(
    public readonly boardId: string,
    public readonly userId: string
  ) {}
}
