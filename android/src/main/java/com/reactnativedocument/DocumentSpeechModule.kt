package com.reactnativedocument

import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.Locale

class DocumentSpeechModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val utteranceId = "rnd-utterance"
    private var ready = false
    private var tts: TextToSpeech? = null
    private var currentText: String = ""
    private var spokenChars: Int = 0
    private var baseOffset: Int = 0

    init {
        tts = TextToSpeech(reactContext) { status ->
            ready = status == TextToSpeech.SUCCESS
        }
        tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(id: String?) {}

            override fun onRangeStart(id: String?, start: Int, end: Int, frame: Int) {
                spokenChars = baseOffset + start
                val body = Arguments.createMap()
                body.putInt("charIndex", baseOffset + start)
                body.putInt("charLength", end - start)
                emit("DocumentSpeech.boundary", body)
            }

            override fun onDone(id: String?) {
                emit("DocumentSpeech.done", null)
            }

            @Deprecated("deprecated in API level 21")
            override fun onError(id: String?) {
                val body = Arguments.createMap()
                body.putString("message", "speech error")
                emit("DocumentSpeech.error", body)
            }
        })
    }

    override fun getName(): String = "DocumentSpeech"

    private fun emit(event: String, body: com.facebook.react.bridge.WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(event, body)
    }

    @ReactMethod
    fun speak(text: String, options: ReadableMap) {
        val engine = tts ?: return
        if (options.hasKey("language")) {
            engine.language = Locale.forLanguageTag(options.getString("language") ?: "es")
        }
        if (options.hasKey("rate")) {
            engine.setSpeechRate(options.getDouble("rate").toFloat())
        }
        if (options.hasKey("pitch")) {
            engine.setPitch(options.getDouble("pitch").toFloat())
        }
        currentText = text
        baseOffset = 0
        spokenChars = 0
        engine.stop()
        val params = Bundle()
        params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, utteranceId)
        engine.speak(text, TextToSpeech.QUEUE_FLUSH, params, utteranceId)
    }

    @ReactMethod
    fun stop() {
        tts?.stop()
        baseOffset = 0
        spokenChars = 0
    }

    @ReactMethod
    fun pause() {
        tts?.stop()
    }

    @ReactMethod
    fun resume() {
        val engine = tts ?: return
        if (spokenChars <= 0 || spokenChars >= currentText.length) {
            return
        }
        baseOffset = spokenChars
        val params = Bundle()
        params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, utteranceId)
        engine.speak(currentText.substring(spokenChars), TextToSpeech.QUEUE_FLUSH, params, utteranceId)
    }

    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}

    override fun onCatalystInstanceDestroy() {
        tts?.shutdown()
        tts = null
    }
}
