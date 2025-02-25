
---

# Configuração de Assinatura de APK - Expo Bare Workflow

Este documento fornece instruções detalhadas para configurar a assinatura do seu APK (release) usando os esquemas de assinatura v1 e v2 em um projeto React Native com Expo Bare Workflow. Aqui você encontrará os passos desde a configuração do arquivo `build.gradle` até a geração e verificação do APK assinado.

---

## 1. Pré-Requisitos

- **Projeto Expo Bare Workflow:**  
  Certifique-se de que seu projeto utiliza o Bare Workflow, com acesso aos diretórios nativos (por exemplo, a pasta `android`).

- **Android SDK e Build Tools:**  
  Tenha o Android SDK instalado e as build tools configuradas. Neste exemplo, utilizamos a versão `35.0.0`.

- **Keystore:**  
  Você precisará de um arquivo keystore (por exemplo, `seu_arquivo.jks`) e das credenciais correspondentes:
  - **storeFile:** Caminho para o arquivo keystore.
  - **storePassword:** Senha do keystore.
  - **keyAlias:** Nome do alias da chave.
  - **keyPassword:** Senha da chave.

---

## 2. Configuração do `build.gradle`

### 2.1. Localizando o Arquivo

Abra o arquivo `android/app/build.gradle`.

### 2.2. Configurando a Assinatura (signingConfigs)

Dentro do bloco `android { ... }`, localize ou adicione o bloco `signingConfigs` e configure a seção `release` conforme abaixo:

```gradle
android {
    ...
    signingConfigs {
        release {
            // Substitua pelos caminhos e credenciais corretas do seu keystore
            storeFile file("caminho/para/seu/keystore.jks")
            storePassword "suaStorePassword"
            keyAlias "seuKeyAlias"
            keyPassword "suaKeyPassword"

            // Habilita os esquemas de assinatura:
            enableV1Signing true  // Habilita o esquema v1 (JAR signing)
            enableV2Signing true  // Habilita o esquema v2 (APK Signature Scheme v2)
        }
    }
    ...
}
```

> **Nota:**  
> Nas versões recentes do Android Gradle Plugin, use as propriedades `enableV1Signing` e `enableV2Signing` em vez dos antigos `v1SigningEnabled` e `v2SigningEnabled`.

### 2.3. Configurando os BuildTypes

No mesmo arquivo, localize o bloco `buildTypes` e configure a seção `release` para utilizar o `signingConfig` definido:

```gradle
android {
    ...
    buildTypes {
        release {
            signingConfig signingConfigs.release

            // Outras configurações do release, se necessário:
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
    ...
}
```

---

## 3. Gerando a APK Assinada

### 3.1. Executando o Pré-build com Expo

No terminal, na pasta raiz do seu projeto, execute:

```bash
npx expo prebuild
```

Esse comando garante que os arquivos nativos sejam atualizados conforme as configurações definidas (incluindo as propriedades do `app.json` e plugins, como `expo-build-properties`).

### 3.2. Gerando a APK com o Gradle

Após o pré-build, navegue até o diretório `android` e execute o comando do Gradle para montar a versão release do APK:

- **No Windows:**

  ```bash
  gradlew.bat assembleRelease
  ```

- **No macOS/Linux:**

  ```bash
  ./gradlew assembleRelease
  ```

### 3.3. Localização do APK Gerado

Após a conclusão da compilação, o APK estará localizado em:

```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 4. Verificando a Assinatura do APK

Para confirmar se o APK foi assinado corretamente, utilize a ferramenta **apksigner** do Android SDK.

### 4.1. Abrindo o Prompt/Terminal

Navegue até o diretório dos build-tools. No Windows, por exemplo, pode ser:

```
C:\Users\<seuUsuário>\AppData\Local\Android\Sdk\build-tools\35.0.0
```

### 4.2. Executando o Comando de Verificação

Utilize o seguinte comando, substituindo o caminho pelo local do seu APK:

```bash
apksigner.bat verify --print-certs --verbose "C:\caminho\para\seu\app-release.apk"
```

### 4.3. Interpretando a Saída

A saída mostrará quais esquemas de assinatura foram aplicados. Por exemplo:

- **Verified using v1 scheme:** Indica se o esquema v1 (JAR signing) está presente.
- **Verified using v2 scheme:** Indica se o esquema v2 (APK Signature Scheme v2) foi aplicado.

> **Observação:**  
> Em projetos com `targetSdkVersion` 35, o Android exige o uso do esquema v2. Assim, mesmo que ambos os esquemas estejam configurados, a verificação pode enfatizar que o v2 é o obrigatório.

---

## 5. Considerações Finais

- **Compatibilidade:**  
  - O esquema v1 é importante para compatibilidade com dispositivos mais antigos, mas o v2 é obrigatório para dispositivos modernos (Android 7.0+).
  - Para publicação na Play Store e compatibilidade com a maioria dos dispositivos, é recomendado manter o v2 habilitado.

- **Atualizações:**  
  - Mantenha seu Android Gradle Plugin e Build Tools atualizados, pois as propriedades de configuração podem mudar com o tempo.
  - Verifique também as configurações do seu `app.json` e dos plugins do Expo (como `expo-build-properties`) para garantir que as versões de compileSdkVersion, targetSdkVersion e buildToolsVersion estejam de acordo com suas necessidades.

- **Depuração:**  
  Caso encontre erros (por exemplo, relacionados a métodos como `v1SigningEnabled`), revise a documentação da versão do Android Gradle Plugin e ajuste as propriedades para `enableV1Signing` e `enableV2Signing`.

---

Este guia completo deve ajudar a configurar, gerar e verificar a assinatura dos APKs do seu projeto Expo Bare Workflow, garantindo que seu aplicativo esteja devidamente preparado para distribuição.

---