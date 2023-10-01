# Proyecto completo en: https://drive.google.com/drive/folders/19Ji5if7wJIb12_lfBV44kQqVbQsK1Z7L

# Guía de Instalación de la DApp
### Esta guía te proporcionará los pasos necesarios para clonar, instalar y utilizar correctamente la DApp del proyecto (Aplicación Descentralizada) desarrollada con React y Truffle. Asegúrate de seguir los pasos a continuación para configurar y desplegar el proyecto sobre una consola cmd.

## Instalación
1. Clonar el Repositorio
### Primero, clona el repositorio desde GitHub y abre una consola en la carpeta local del repositorio:

git clone <TF-DDRC-160923>
cd <TF-DDRC-160923>

2. Instalar Truffle
### Instala Truffle en la carpeta del repositorio ejecutando el siguiente comando:
npm install -g truffle

3. Instalar Dependencias del Proyecto Truffle
### Para instalar las dependencias del proyecto Truffle, ve a la carpeta client:
cd client
### Luego, ejecuta:
npm install

4. Instalar Dependencias del Proyecto React
### Asegúrate de estar en la carpeta client y ejecuta el siguiente comando para instalar las dependencias del proyecto React:
npm install

## Despliegue en un Servidor Local
### Para desplegar la DApp en un servidor local y verla en tu navegador, asegúrate de estar en la carpeta client y ejecuta:
npm start
### Esto iniciará la aplicación React y podrás acceder a ella en tu navegador visitando http://localhost:3000.

## Modificar Contratos
### Si decides modificar los contratos inteligentes, sigue estos pasos para compilar y actualizar los archivos JSON en la carpeta client/contracts:
1. Compilar Contratos con Truffle
### Compila los contratos inteligentes utilizando Truffle en la carpeta raíz del proyecto:
truffle migrate --network development

2. Reemplazar Archivos JSON
### Los archivos JSON generados durante la compilación se encuentran en la carpeta build del proyecto Truffle. Reemplaza los archivos JSON de los contratos actualizados en la carpeta client/contracts.

## Despliegue en una Red Pública
### Si deseas desplegar los contratos en una red pública, sigue estos pasos:
1. Iniciar Truffle Dashboard
### Ejecuta el siguiente comando en la consola para iniciar Truffle Dashboard:
truffle dashboard

2. Conectar MetaMask
### Conecta tu billetera MetaMask a la red deseada para costear las comisiones de despliegue.

3. Desplegar Contratos
### En la interfaz gráfica de Truffle Dashboard, instancia los contratos inteligentes utilizando el siguiente comando:
truffle migrate --network <nombre_de_red>
### Asegúrate de aprobar las transacciones en la interfaz gráfica que se despliega.

¡Listo! Tu DApp desarrollada con React y Truffle está lista para ser utilizada en una red pública. Siéntete libre de explorar y personalizar tu DApp según tus necesidades.

Recuerda que debes tener una billetera con suficiente saldo ETH para cubrir las comisiones de despliegue en la red pública.
