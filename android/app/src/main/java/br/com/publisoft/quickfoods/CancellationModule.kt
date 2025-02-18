package br.com.publisoft.quickfoods

import android.content.Intent
import android.net.Uri
import android.util.Log
import com.facebook.react.bridge.*

class CancellationModule(reactContext: ReactApplicationContext) :
        ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val AMOUNT = "amount"
        const val ATK = "atk"
        const val EDITABLE_AMOUNT = "editable_amount"
        const val TAG = "CancellationModule"
        private const val RETURN_SCHEME = "returnscheme"
    }

    override fun getName(): String {
        return "CancellationModule"
    }

    @ReactMethod
    fun startCancellation(
            amount: String?,
            atk: String?,
            editableAmount: Boolean,
            returnScheme: String
    ) {
        // Verificar se o campo obrigatório foi fornecido
        if (returnScheme.isBlank()) {
            Log.e(TAG, "Return scheme is required.")
            return
        }

        // Construir a URI
        val uriBuilder = Uri.Builder()
        uriBuilder.authority("cancel")
        uriBuilder.scheme("cancel-app")
        uriBuilder.appendQueryParameter(RETURN_SCHEME, "br.com.publisoft.quickfoods")

        // Adicionar parâmetros opcionais à URI
        amount?.takeIf { it.isNotBlank() }?.let {
            uriBuilder.appendQueryParameter(AMOUNT, it)
        }

        atk?.takeIf { it.isNotBlank() }?.let {
            uriBuilder.appendQueryParameter(ATK, it)
        }

        uriBuilder.appendQueryParameter(EDITABLE_AMOUNT, if (editableAmount) "true" else "false")

        // Criar o Intent
        val intent = Intent(Intent.ACTION_VIEW)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        intent.data = uriBuilder.build()

        // Iniciar a atividade
        try {
            reactApplicationContext.startActivity(intent)
            Log.v(TAG, "toUri(scheme = ${intent.data})")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start cancellation activity: ${e.message}")
        }
    }
}
