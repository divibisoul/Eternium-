import type { ActiveOperation } from "../../../types";
import {
  operationStatusBarModule,
  type OperationDisplayProjection,
  type OperationProjectionPublisher,
} from "./OperationStatusBarModule";

/**
 * The progress card deliberately reuses OperationStatusBarModule's
 * normalization. There is one operation-progress calculation, not two.
 */
export class OperationProgressCardModule {
  readonly id = "L5.OperationProgressCardModule";
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

  renderOperation(operation: ActiveOperation): OperationDisplayProjection | null {
    if (!this.active) return null;
    return operationStatusBarModule.project(operation);
  }

  async publish(operation: ActiveOperation): Promise<OperationDisplayProjection | null> {
    const projection = this.renderOperation(operation);
    if (!projection) return null;
    await this.publisher?.("operation.statusbar.updated", projection);
    return projection;
  }
}
 
export const operationProgressCardModule = new OperationProgressCardModule();
