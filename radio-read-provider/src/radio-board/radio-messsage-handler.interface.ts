export interface RadioMesssageHandler {
  proceedRadioMessage(radioMessageFragment: string): Promise<void>;
}
