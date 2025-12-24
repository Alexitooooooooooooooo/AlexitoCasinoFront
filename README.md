# 🎰 AlexitoCasino Frontend

Bienvenido al repositorio frontend de **AlexitoCasino**, una plataforma de casino online moderna y dinámica construida con **Nuxt 3**.

## 🚀 Tecnologías Principales

Este proyecto utiliza un stack tecnológico de vanguardia para garantizar rendimiento y experiencia de usuario:

-   **[Nuxt 3](https://nuxt.com/)**: El framework híbrido de Vue.js.
-   **[Vue 3](https://vuejs.org/)**: Motor reactivo con Composition API.
-   **[Tailwind CSS](https://tailwindcss.com/)**: Estilizado rápido y responsivo (diseño *dark mode* premium).
-   **[PrimeVue](https://primevue.org/)**: Componentes de UI robustos.
-   **[PixiJS](https://pixijs.com/)**: Motor gráfico 2D de alto rendimiento para los juegos de Slot.
-   **[Laravel Sanctum](https://laravel.com/docs/sanctum)**: Integración para autenticación segura (cliente).
-   **Boxicons**: Librería de iconos vectoriales.

## 🎮 Características Destacadas

### Motor de Slots (PixiJS)
El sistema cuenta con un motor de juegos (`SlotGame.vue`) altamente configurable:
-   **Animaciones fluídas**: Giros de carretes y efectos visuales con WebGL.
-   **Tablas de Pago Dinámicas**: Cálculo automático de premios basado en configuración del backend.
-   **Visualización de Líneas**: Renderizado en tiempo real de las líneas ganadoras sobre los carretes.
-   **Interfaz Adaptable**: Controles y paneles de ayuda optimizados para móvil y escritorio.

### Gestión de Usuario
-   **Autenticación**: Login, Registro y protección de rutas.
-   **Billetera**: Visualización de saldo en tiempo real y transacciones.
-   **Historial**: Registro de jugadas y apuestas.

## 🛠️ Instalación y Desarrollo

Asegúrate de tener [Node.js](https://nodejs.org/) instalado.

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```
2.  **Configurar variables de entorno**:
    ```bash
    cp .env.example .env
    ```
    Edita el archivo `.env` y agrega tus variables de entorno, en este caso es la ruta NUXT_PUBLIC_SANCTUM_BASE_URL donde debes tener la dirección del backend.
    
3.  **Iniciar servidor de desarrollo**:
    ```bash
    npm run dev
    ```
    Visita `http://localhost:3000` en tu navegador.

4.  **Construir para producción**:
    ```bash
    npm run build
    ```

## 📂 Estructura del Proyecto

-   `/app`: Código fuente principal.
    -   `/components`: Componentes reutilizables (Juegos, UI, Layouts).
    -   `/pages`: Rutas y vistas de la aplicación.
    -   `/assets`: Estilos globales y recursos estáticos.
    -   `/composables`: Lógica compartida (Hooks de Vue).

---
*Desarrollado por Alexito* 🎲
