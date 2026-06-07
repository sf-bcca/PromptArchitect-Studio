package com.promptarchitect.app;

import android.app.DownloadManager;
import android.content.Context;
import android.net.Uri;
import android.os.Environment;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.google.ai.edge.litertlm.Engine;
import com.google.ai.edge.litertlm.EngineConfig;
import com.google.ai.edge.litertlm.Conversation;
import com.google.ai.edge.litertlm.ConversationConfig;
import com.google.ai.edge.litertlm.Backend;
import com.google.ai.edge.litertlm.SamplerConfig;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "NativeAI")
public class NativeAIPlugin extends Plugin {

    private final Executor executor = Executors.newSingleThreadExecutor();
    private Engine engine = null;
    private boolean isDownloading = false;
    private int downloadProgress = 0;
    private String downloadError = null;

    private static final String MODEL_FILE_NAME = "gemma-4-E2B-it.litertlm";
    private static final String DEFAULT_MODEL_URL = "https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/resolve/main/gemma-4-E2B-it.litertlm";

    private File getModelFile() {
        File binFile = new File(getContext().getFilesDir(), "gemma-4-E2B-it.bin");
        File targetFile = new File(getContext().getFilesDir(), MODEL_FILE_NAME);
        if (binFile.exists() && !targetFile.exists()) {
            binFile.renameTo(targetFile);
        }
        return targetFile;
    }

    @PluginMethod
    public void isModelAvailable(PluginCall call) {
        File modelFile = getModelFile();
        JSObject ret = new JSObject();
        ret.put("available", modelFile.exists() && modelFile.length() > 100 * 1024 * 1024); // must be at least 100MB to be valid
        ret.put("isDownloading", isDownloading);
        ret.put("downloadProgress", downloadProgress);
        ret.put("error", downloadError);
        ret.put("filePath", modelFile.getAbsolutePath());
        call.resolve(ret);
    }

    @PluginMethod
    public void downloadModel(PluginCall call) {
        if (isDownloading) {
            JSObject ret = new JSObject();
            ret.put("status", "ALREADY_DOWNLOADING");
            ret.put("progress", downloadProgress);
            call.resolve(ret);
            return;
        }

        isDownloading = true;
        downloadProgress = 0;
        downloadError = null;

        JSObject startedRet = new JSObject();
        startedRet.put("status", "STARTED");
        call.resolve(startedRet);

        executor.execute(() -> {
            File outputFile = getModelFile();
            File tempFile = new File(getContext().getCacheDir(), MODEL_FILE_NAME + ".tmp");
            HttpURLConnection connection = null;
            InputStream input = null;
            FileOutputStream output = null;

            try {
                if (tempFile.exists()) {
                    tempFile.delete();
                }

                URL url = new URL(DEFAULT_MODEL_URL);
                connection = (HttpURLConnection) url.openConnection();
                connection.connect();

                if (connection.getResponseCode() != HttpURLConnection.HTTP_OK) {
                    throw new Exception("Server returned HTTP " + connection.getResponseCode() + " " + connection.getResponseMessage());
                }

                long fileLength = connection.getContentLengthLong();
                input = connection.getInputStream();
                output = new FileOutputStream(tempFile);

                byte[] data = new byte[4096];
                long total = 0;
                int count;
                long lastNotifyTime = 0;
                int lastNotifiedProgress = -1;

                while ((count = input.read(data)) != -1) {
                    total += count;
                    output.write(data, 0, count);

                    if (fileLength > 0) {
                        int currentProgress = (int) (total * 100 / fileLength);
                        if (currentProgress != downloadProgress) {
                            downloadProgress = currentProgress;
                        }
                        
                        long now = System.currentTimeMillis();
                        if (downloadProgress != lastNotifiedProgress && now - lastNotifyTime > 500) {
                            JSObject progressObj = new JSObject();
                            progressObj.put("progress", downloadProgress);
                            progressObj.put("status", "DOWNLOADING");
                            notifyListeners("downloadProgress", progressObj);
                            lastNotifyTime = now;
                            lastNotifiedProgress = downloadProgress;
                        }
                    }
                }

                output.close();
                input.close();

                // Rename temp file to actual file
                if (outputFile.exists()) {
                    outputFile.delete();
                }
                if (!tempFile.renameTo(outputFile)) {
                    throw new Exception("Failed to rename temporary model file to target location");
                }

                isDownloading = false;
                downloadProgress = 100;

                // Reset cached engine so it re-initializes with the new model file
                if (engine != null) {
                    try {
                        engine.close();
                    } catch (Exception ignored) {}
                    engine = null;
                }

                JSObject successObj = new JSObject();
                successObj.put("progress", 100);
                successObj.put("status", "COMPLETED");
                notifyListeners("downloadProgress", successObj);

            } catch (Exception e) {
                isDownloading = false;
                downloadError = e.getMessage();
                android.util.Log.e("NativeAI", "Gemma download failed: " + downloadError, e);

                if (tempFile.exists()) {
                    tempFile.delete();
                }

                JSObject errorObj = new JSObject();
                errorObj.put("progress", downloadProgress);
                errorObj.put("status", "FAILED");
                errorObj.put("error", downloadError);
                notifyListeners("downloadProgress", errorObj);
            } finally {
                try {
                    if (output != null) output.close();
                    if (input != null) input.close();
                } catch (Exception ignored) {}
                if (connection != null) connection.disconnect();
            }
        });
    }

    @PluginMethod
    public void generateResponse(PluginCall call) {
        String prompt = call.getString("prompt");
        if (prompt == null || prompt.isEmpty()) {
            call.reject("Prompt is empty");
            return;
        }

        File modelFile = getModelFile();
        if (!modelFile.exists()) {
            call.reject("Gemma 4 model file not found. Please download it first.");
            return;
        }

        executor.execute(() -> {
            try {
                if (engine == null) {
                    Backend cpuBackend = new Backend.CPU();
                    EngineConfig config = new EngineConfig(
                        modelFile.getAbsolutePath(),
                        cpuBackend,
                        cpuBackend,
                        null,
                        2048,
                        2048,
                        ""
                    );
                    engine = new Engine(config);
                    engine.initialize();
                }

                ConversationConfig conversationConfig = new ConversationConfig(
                    null, // systemInstruction
                    new ArrayList<>(), // initialMessages
                    new ArrayList<>(), // tools
                    new SamplerConfig(40, 0.95, 0.7, 2048), // samplerConfig
                    true, // automaticToolCalling
                    null, // channels
                    new HashMap<>(), // extraContext
                    null // loraConfig
                );

                try (Conversation conversation = engine.createConversation(conversationConfig)) {
                    com.google.ai.edge.litertlm.Message responseMessage = conversation.sendMessage(prompt, new HashMap<>());
                    String response = getMessageText(responseMessage);
                    JSObject ret = new JSObject();
                    ret.put("result", response);
                    call.resolve(ret);
                }
            } catch (Exception e) {
                android.util.Log.e("NativeAI", "Gemma generation failed", e);
                call.reject("On-device Gemma inference failed: " + e.getMessage(), e);
            }
        });
    }

    private String getMessageText(com.google.ai.edge.litertlm.Message message) {
        if (message == null || message.getContents() == null) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        for (com.google.ai.edge.litertlm.Content part : message.getContents().getContents()) {
            if (part instanceof com.google.ai.edge.litertlm.Content.Text) {
                sb.append(((com.google.ai.edge.litertlm.Content.Text) part).getText());
            }
        }
        return sb.toString();
    }
}
