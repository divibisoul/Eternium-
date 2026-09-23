import type { ActiveOperation } from "../../../types";

export type OperationDisplayProjection = {
  id: string;
  type: ActiveOperation["type"];
  status: ActiveOperation["status"];
  message: string;
  progressPercent: number | null;
  progressObserved: boolean;
  totalSteps: number | null;
  progress: number | null;
};

export type OperationProjectionPublisher = (
  event: "operation.statusbar.updated",
  payload: OperationDisplayProjection,
) => void | Promise<void>;

export function projectOperation(
  operation: ActiveOperation,
): OperationDisplayProjection {
  const progress =
    Number.isFinite(operation.progress) ? Number(operation.progress) : null;
  const totalSteps =
    Number.isFinite(operation.totalSteps) && operation.totalSteps > 0
      ? Number(operation.totalSteps)
      : null;

  const progressPercent =
    progress !== null && totalSteps !== null
      ? Math.min(100, Math.max(0, (progress / totalSteps) * 100))
      : null;

  return {
    id: operation.id,
    type: operation.type,
    status: operation.status,
    message: operation.message,
    progressPercent,
    progressObserved: progressPercent !== null,
    totalSteps,
    progress,
  };
}

export class OperationStatusBarModule {
  readonly id = "L5.OperationStatusBarModule";
  private active = false;
  private readonly publisher?: OperationProjectionPublisher;

  constructor(publisher?: OperationProjectionPublisher) {
    this.publisher = publisher;
  }

  activate(): void {
    this.active = true;
  }

  deactivate(): void {
    this.active = false;
  }

  isActive(): boolean {
    return this.active;
  }

  project(operation: ActiveOperation): OperationDisplayProjection | null {
    if (!this.active) return null;
    return projectOperation(operation);
  }

  async publish(operation: ActiveOperation): Promise<OperationDisplayProjection | null> {
    const projection = this.project(operation);
    if (!projection) return null;
    await this.publisher?.("operation.statusbar.updated", projection);
    return projection;
  }
}

export const operationStatusBarModule = new OperationStatusBarModule();
