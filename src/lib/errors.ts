export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends AppError {
  constructor(resouce: string, id: string) {
    super(404, `Resource ${resouce} ${id} not found`);
  }
}
