export interface RadioMessageHandler {
  proceedRadioMessage(radioMessageFragment: string): Promise<void>;
}
