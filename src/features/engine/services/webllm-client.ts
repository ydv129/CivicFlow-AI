import { CreateMLCEngine, MLCEngine, InitProgressReport } from "@mlc-ai/web-llm";

export type EngineStatusCallback = (report: InitProgressReport) => void;

export class WebLlmClientManager {
  private engine: MLCEngine | null = null;
  private initPromise: Promise<MLCEngine> | null = null;
  private readonly modelId: string = "gemma-2b-it-q4f16_1-MLC";
  private abortRequested: boolean = false;

  /**
   * Initializes the WebGPU context and downloads or loads the cached model weights.
   * Utilizes an initialization promise to avoid race conditions and duplicate load cycles.
   */
  public async initializeEngine(onProgress: EngineStatusCallback): Promise<MLCEngine> {
    if (this.engine) {
      return this.engine;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window === "undefined" || !(navigator as any).gpu) {
      throw new Error("WebGPU is not supported by this browser. Please use a compatible browser.");
    }

    this.initPromise = (async () => {
      try {
        const engine = await CreateMLCEngine(this.modelId, {
          initProgressCallback: (report) => {
            onProgress(report);
          },
          logLevel: "WARN",
        });
        this.engine = engine;
        return engine;
      } catch (error) {
        this.engine = null;
        this.initPromise = null;
        throw new Error(`WebGPU Engine initialization failed: ${(error as Error).message}`);
      }
    })();

    return this.initPromise;
  }

  /**
   * Signals the active streaming inference to stop after the current token.
   * The partial output accumulated so far will be returned to the caller.
   */
  public abortGeneration(): void {
    this.abortRequested = true;
  }

  /**
   * Streams analytical outputs from the local model based on user prompts.
   * Employs a self-healing block that intercepts model loading/disposal errors,
   * reinstantiates the engine, and transparently retries the inference.
   * Respects the abortRequested flag to support mid-stream cancellation.
   */
  public async generateStreamingOutput(
    systemPrompt: string,
    userPrompt: string,
    onTokenCallback: (tokenText: string) => void
  ): Promise<string> {
    if (!this.engine) {
      throw new Error("WebLLM Engine is uninitialized. Call initializeEngine first.");
    }

    // Reset abort flag at the start of every new generation
    this.abortRequested = false;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt }
    ];

    const executeInference = async (engineInstance: MLCEngine) => {
      const responseStream = await engineInstance.chat.completions.create({
        messages,
        temperature: 0.2, // Low temperature for high analytical accuracy
        top_p: 0.95,
        stream: true,
      });

      let completeOutput = "";
      for await (const chunk of responseStream) {
        // Honour abort signal — return partial output cleanly without throwing
        if (this.abortRequested) {
          this.abortRequested = false;
          return completeOutput;
        }
        const delta = chunk.choices[0]?.delta?.content || "";
        completeOutput += delta;
        onTokenCallback(completeOutput);
      }

      return completeOutput;
    };

    try {
      return await executeInference(this.engine);
    } catch (error) {
      const errorMsg = (error as Error).message || "";
      if (
        errorMsg.includes("Model not loaded") ||
        errorMsg.includes("reload") ||
        errorMsg.includes("disposed") ||
        errorMsg.includes("unload")
      ) {
        try {
          // Tear down broken state
          this.engine = null;
          this.initPromise = null;
          // Re-initialize engine and reload model weights
          const freshEngine = await this.initializeEngine(() => {});
          // Retry the inference execution
          return await executeInference(freshEngine);
        } catch (recreateError) {
          throw new Error(`Inference execution failed after self-healing retry: ${(recreateError as Error).message}`);
        }
      }
      throw new Error(`Inference execution failed: ${errorMsg}`);
    }
  }

  /**
   * Explicitly unloads the model from VRAM and releases GPU resources.
   */
  public async terminateEngine(): Promise<void> {
    if (this.engine) {
      await this.engine.unload();
      this.engine = null;
    }
    this.initPromise = null;
  }
}

export const webLlmClientManager = new WebLlmClientManager();
