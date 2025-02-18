package br.com.publisoft.quickfoods

import android.content.Intent
import android.net.Uri
import android.util.Log
import android.widget.Toast
import com.facebook.react.bridge.*
import java.lang.Exception

class PaymentModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val AMOUNT = "amount"
        const val ORDER_ID = "order_id"
        const val EDITABLE_AMOUNT = "editable_amount"
        const val TRANSACTION_TYPE = "transaction_type"
        const val INSTALLMENT_TYPE = "installment_type"
        const val INSTALLMENT_COUNT = "installment_count"
        const val TAG = "PaymentModule"
        private const val RETURN_SCHEME = "return_scheme"
    }

    override fun getName(): String {
        return "PaymentModule"
    }

    /**
     * Inicia o pagamento via deep link.
     *
     * Todos os parâmetros são recebidos do JavaScript.
     * Você pode adicionar um parâmetro opcional para o retorno (returnScheme) para maior flexibilidade.
     */
    @ReactMethod
    fun startPayment(
        amount: String,
        orderId: String?,
        editableAmount: Boolean,
        transactionType: String?,
        installmentType: String?,
        installmentCount: String?,
        returnScheme: String? // Parâmetro opcional para definir o esquema de retorno
    ) {
        // Valida os parâmetros obrigatórios
        if (amount.isBlank()) {
            Log.e(TAG, "Amount is required.")
            return
        }

        if (transactionType.isNullOrBlank()) {
            Log.e(TAG, "Transaction type is required.")
            return
        }

        // Define o esquema de retorno (padrão caso não seja passado)
        val actualReturnScheme = returnScheme?.takeIf { it.isNotBlank() } ?: "br.com.publisoft.quickfoods"

        // Constrói a URI para o deep link
        val uriBuilder = Uri.Builder().apply {
            authority("pay")
            scheme("payment-app")
            appendQueryParameter(RETURN_SCHEME, actualReturnScheme)
            appendQueryParameter(AMOUNT, amount)
            appendQueryParameter(EDITABLE_AMOUNT, if (editableAmount) "1" else "0")
            appendQueryParameter(TRANSACTION_TYPE, transactionType)
            
            if (!installmentType.isNullOrBlank()) {
                appendQueryParameter(INSTALLMENT_TYPE, installmentType)
            }
            if (!installmentCount.isNullOrBlank()) {
                appendQueryParameter(INSTALLMENT_COUNT, installmentCount)
            }
            if (!orderId.isNullOrBlank()) {
                appendQueryParameter(ORDER_ID, orderId)
            }
        }

        // Cria o Intent com a URI construída
        val intent = Intent(Intent.ACTION_VIEW).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            data = uriBuilder.build()
        }

        // Tenta iniciar a Activity com o deep link
        try {
            reactApplicationContext.startActivity(intent)
            Log.v(TAG, "DeepLink URI: ${intent.data.toString()}")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start payment activity: ${e.message}")
        }
    }
}
