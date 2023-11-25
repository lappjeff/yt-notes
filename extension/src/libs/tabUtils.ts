import browser from "webextension-polyfill";
import { Message } from "../models/message.model";

export async function getActiveTab(): Promise<browser.Tabs.Tab> {
  const tab = (
    await browser.tabs.query({
      currentWindow: true,
      active: true,
    })
  )[0];

  return tab;
}

export async function sendMessage<T = any>(
  message: Message,
  tabId: number
): Promise<T> {
  const data = await browser.tabs.sendMessage(tabId, message);

  return data as T;
}
