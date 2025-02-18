package br.com.publisoft.quickfoods

import android.content.Intent
import android.net.Uri
import android.util.Log
import android.widget.Toast
import com.facebook.react.bridge.*
import java.lang.Exception

class PrinterModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val SHOW_FEEDBACK_SCREEN = "SHOW_FEEDBACK_SCREEN"
        const val PRINTABLE_CONTENT = "PRINTABLE_CONTENT"
        
        const val TAG = "PrinterModule"
        private const val RETURN_SCHEME = "br.com.publisoft.quickfoods"
    }

    override fun getName(): String {
        return "PrinterModule"
    }

    @ReactMethod
    fun startPrinter(
            showFeedback: Boolean,
            printableContent: String,
    ) {
        // Construir a URI
        val uriBuilder = Uri.Builder()
        uriBuilder.authority("print")
        uriBuilder.scheme("printer-app")

        // Adicionar parâmetros à URI
        
        uriBuilder.appendQueryParameter(SHOW_FEEDBACK_SCREEN, if (showFeedback) "true" else "false")
        uriBuilder.appendQueryParameter(RETURN_SCHEME, RETURN_SCHEME)
        uriBuilder.appendQueryParameter(PRINTABLE_CONTENT, printableContent)
        
        // Criar o Intent
        val intent = Intent(Intent.ACTION_VIEW)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        intent.data = uriBuilder.build()

        // Verificar se o contexto está disponível
        if (reactApplicationContext == null) {
            Log.e(TAG, "React application context is not available.")
            return
        }

        // Iniciar a atividade
        try {
            reactApplicationContext.startActivity(intent)
            Log.v(TAG, "toUri(scheme = ${intent.data})")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start payment activity: ${e.message}")
        }
    }
}