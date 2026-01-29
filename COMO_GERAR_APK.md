# Gerando o APK do Smart Tech (FleetOps)

Este projeto já está configurado com o **Capacitor** para gerar aplicativos Android nativos.

## Pré-requisitos
- **Android Studio** instalado (com Android SDK configurado).

## Passo a Passo para Gerar o APK

O código web já foi compilado e sincronizado com a pasta Android. Para gerar o arquivo instalável:

1. Abra o **Android Studio**.
2. Selecione **"Open"** (Abrir Projeto).
3. Navegue até a pasta do projeto e selecione a subpasta chamada `android`.
   - Caminho: `Desktop\Prefeitura\android`
4. Espere o Android Studio sincronizar o projeto (pode demorar alguns minutos na primeira vez baixando dependências).
5. No menu superior, vá em **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
6. Quando terminar, uma notificação aparecerá no canto inferior direito. Clique em **"locate"** para abrir a pasta onde o arquivo `.apk` foi gerado.

## Testando no Celular (Emulador ou USB)
Se quiser apenas testar sem gerar o arquivo:
1. Conecte seu celular via USB (com Depuração USB ativada).
2. Clique no botão **"Play" (Run)** verde no topo do Android Studio.

## Comandos Úteis (Terminal)
Se mudar algo no código do site (React), rode sempre estes comandos para atualizar a versão mobile:

```powershell
npm run build
npx cap sync
```

Depois é só gerar o APK novamente no Android Studio.
