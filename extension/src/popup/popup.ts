import { byId, createElement, on } from "../libs/htmlUtils";
import { getActiveTab, sendMessage } from "../libs/tabUtils";
import { Input } from "../models/dom.model";
import { VideoPayload } from "../models/message.model";
import { VideoNote } from "../models/storage.model";

class Popup {
  private videoData!: VideoNote;
  private storage = browser.storage.sync;
  private saveBtn!: HTMLButtonElement;

  get titleValid(): boolean {
    return this.videoData?.title?.length > 0;
  }

  get descriptionValid(): boolean {
    return this.videoData?.description?.length > 0;
  }

  get canSave(): boolean {
    return this.titleValid && this.descriptionValid;
  }

  public constructor() {
    this.initPopup();
    this.getVideoData();
    this.syncData();
  }

  private initPopup(): void {
    const container = byId("popup-content");

    const titleInput = createElement<HTMLInputElement>(
      document,
      container,
      "input",
      {
        name: Input.TITLE,
        placeholder: "Note name",
        type: "text",
        className: "form-control mb-2",
      }
    );

    const descriptionInput = createElement<HTMLTextAreaElement>(
      document,
      container,
      "textarea",
      {
        name: Input.DESCRIPTION,
        placeholder: "Note description",
        rows: 6,
        className: "form-control",
      }
    );

    const inputs = [titleInput, descriptionInput];

    for (let input of inputs) {
      this.handleInput(input);
    }

    const buttonContainer = createElement(document, container, "div", {
      className: "d-flex w-100 justify-content-between mt-2 px-0",
    });

    const closeBtn = createElement(document, buttonContainer, "button", {
      textContent: "Close",
      type: "button",
      className: "btn btn-danger btn-md",
    });

    const syncBtn = createElement(document, buttonContainer, "button", {
      textContent: "Sync",
      type: "button",
      className: "btn btn-secondary btn-md",
    });

    const saveBtn = createElement<HTMLButtonElement>(
      document,
      buttonContainer,
      "button",
      {
        textContent: "Save",
        type: "button",
        className: "btn btn-success btn-md",
        disabled: !this.canSave,
      }
    );

    this.saveBtn = saveBtn;

    on(saveBtn, "click", async () => {
      try {
        if (!this.videoData) return;

        await this.saveNote(this.videoData);

        this.closePopup();
      } catch (error) {
        console.error(error);
      }
    });

    on(closeBtn, "click", this.closePopup);

    on(syncBtn, "click", async () => await this.syncData());
  }

  private closePopup() {
    window.close();
  }

  private async getVideoData(): Promise<void> {
    const activeTab = await getActiveTab();

    const {
      timestamp: startTime,
      videoId: id,
      url,
    } = await this.requestVideoData(activeTab.id);

    this.videoData = {
      startTime,
      id,
      url,
      title: "",
      description: "",
    };
  }

  private handleInput(el: HTMLInputElement | HTMLTextAreaElement) {
    on(el, "input", (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;

      this.videoData = { ...this.videoData, [target.name]: target.value };

      this.saveBtn.disabled = !this.canSave;
    });
  }

  private async syncData() {
    const webAppTab = (await browser.tabs.query({ title: "React App" }))[0];

    if (!webAppTab) return;

    const data = await this.storage.get();

    await sendMessage({ type: "sync_data", payload: data }, webAppTab.id);
  }

  async requestVideoData(tabId: number): Promise<VideoPayload> {
    const videoData = sendMessage<VideoPayload>(
      { type: "request_video_metadata" },
      tabId
    );

    return videoData;
  }

  async saveNote(video: VideoNote): Promise<void> {
    const existingNotes: { [videoId: string]: VideoNote[] } =
      await this.storage.get(video.id);

    await this.storage.set({
      [video.id]: [video, ...(existingNotes[video.id] || [])],
    });

    await this.syncData();
  }
}

// init popup
new Popup();
