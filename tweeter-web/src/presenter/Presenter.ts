export interface View {
  displayErrorMessage: (message: string) => void;
}

export interface MessageView extends View {
  deleteMessage: (messageId: string) => void;
  displayInfoMessage: (
    message: string,
    duration: number,
    bootstrapClasses?: string | undefined
  ) => string;
}

export abstract class Presenter<V extends View> {
  private _view: V;

  protected constructor(view: V) {
    this._view = view;
  }

  public get view(): V {
    return this._view;
  }

  protected async doFailureReport(
    operation: () => Promise<void>,
    operationDescription: string,
    finallyOperation?: () => void
  ) {
    try {
      await operation();
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to ${operationDescription} because of exception: ${error}`
      );
    } finally {
      if (finallyOperation) {
        finallyOperation();
      }
    }
  }
}
