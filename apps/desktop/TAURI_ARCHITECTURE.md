# Arquitectura Tauri para Dynamic Mock Server

## Problema Identificado

Al intentar usar los paquetes `@dynamic-mock-server/core` y `@dynamic-mock-server/config` directamente en el frontend de React, encontramos errores de compilación porque estos paquetes dependen de módulos de Node.js (`fs`, `path`, `http`, etc.) que no están disponibles en el navegador.

## Solución: Arquitectura Cliente-Servidor con Tauri

Tauri funciona con una arquitectura de dos capas:

```
┌─────────────────────────────────────────┐
│         Frontend (Browser/React)        │
│  - UI Components                        │
│  - Zustand Store (solo datos)          │
│  - Tauri Commands (invoke)             │
└─────────────────┬───────────────────────┘
                  │
                  │ IPC (Inter-Process Communication)
                  │
┌─────────────────▼───────────────────────┐
│         Backend (Rust + Node.js)        │
│  - Core Instance                        │
│  - Config Instance                      │
│  - Server (Fastify)                     │
│  - File System Access                   │
└─────────────────────────────────────────┘
```

## Implementación Actual

### Frontend (✅ Implementado)

**Archivo**: `apps/desktop/src/stores/app-store.ts`

El store de Zustand ahora solo maneja:

- `projectPath`: La ruta del proyecto (persistida en localStorage)
- `config`: Los datos de configuración (JSON plano)
- `isLoading`: Estado de carga
- `error`: Mensajes de error

**NO maneja**:

- Instancias de `Core` o `Config` (estas viven en el backend)
- Operaciones del sistema de archivos
- El servidor HTTP

### Backend (❌ Pendiente de Implementar)

Se necesita crear comandos de Tauri en Rust que:

1. **Inicialicen el servidor Node.js** con Core y Config
2. **Expongan funciones** para comunicarse con el frontend

## Próximos Pasos

### 1. Crear Comandos de Tauri (Rust)

Archivo: `apps/desktop/src-tauri/src/lib.rs` (o similar)

```rust
use tauri::command;

#[command]
async fn load_config(path: String) -> Result<ConfigType, String> {
    // TODO: Llamar a Node.js para cargar la configuración
    // usando @dynamic-mock-server/config
}

#[command]
async fn start_server() -> Result<(), String> {
    // TODO: Iniciar el servidor usando @dynamic-mock-server/core
}

#[command]
async fn stop_server() -> Result<(), String> {
    // TODO: Detener el servidor
}

#[command]
async fn reload_config() -> Result<ConfigType, String> {
    // TODO: Recargar la configuración
}
```

### 2. Integrar Node.js con Tauri

Hay varias opciones:

#### Opción A: Usar un Proceso Child de Node.js

Tauri puede ejecutar Node.js como un proceso hijo y comunicarse vía stdio/HTTP.

```rust
use std::process::Command;

fn start_node_server() {
    Command::new("node")
        .arg("path/to/server.js")
        .spawn()
        .expect("Failed to start Node.js server");
}
```

#### Opción B: Usar un Sidecar

Empaquetar un binario de Node.js con la aplicación.

```json
// tauri.conf.json
{
  "tauri": {
    "bundle": {
      "externalBin": ["binaries/node"]
    }
  }
}
```

#### Opción C: Servidor HTTP Local (Recomendado)

El Core ya tiene un servidor Fastify. Tauri puede comunicarse con él vía HTTP.

1. El backend de Tauri inicia el servidor de Core
2. El frontend hace peticiones HTTP al `localhost:3000` (o puerto configurado)
3. No necesita Tauri commands para todas las operaciones

### 3. Actualizar el Frontend para Usar Tauri Commands

```typescript
import { invoke } from "@tauri-apps/api/core";
import type { ConfigType } from "@/types/config.types";

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      // ...

      setProjectPath: async (path: string | null) => {
        try {
          set({ isLoading: true, error: null });

          if (!path) {
            await invoke("stop_server");
            set({ projectPath: null, config: null, isLoading: false });
            return;
          }

          // Cargar configuración desde Tauri backend
          const config = await invoke<ConfigType>("load_config", { path });

          set({
            projectPath: path,
            config,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // handle error
        }
      },

      startServer: async () => {
        await invoke("start_server");
      },

      stopServer: async () => {
        await invoke("stop_server");
      },
    }),
    // ...
  ),
);
```

## Alternativa Simple: Servidor Node.js Independiente

Si no quieres integrar Node.js en Tauri, puedes:

1. **Ejecutar el servidor Core por separado** como una app Node.js normal
2. **La app Tauri solo es una UI** que se conecta al servidor vía HTTP
3. **No necesitas** pasar la configuración por Tauri commands

### Ventajas

- Separación clara de responsabilidades
- Más fácil de desarrollar y debugear
- No necesitas manejar IPC complejo

### Desventajas

- Dos procesos separados
- El usuario necesita iniciar ambos

## Recomendación

Para el caso de Dynamic Mock Server, recomiendo:

### **Fase 1 (Desarrollo Actual)**: Servidor Independiente

- Core corre como servidor Node.js separado
- Tauri app es solo la UI
- Comunicación vía HTTP
- Más simple para empezar

### **Fase 2 (Futura)**: Integración Completa

- Tauri maneja el ciclo de vida del servidor Core
- Comunicación vía Tauri commands o HTTP local
- Una sola aplicación empaquetada

## Estado Actual de la Implementación

### ✅ Completado

1. Store de Zustand con persistencia en localStorage
2. Tipos de configuración definidos para el frontend
3. Componente FolderSelector actualizado
4. Arquitectura diseñada para separar frontend/backend

### ❌ Pendiente

1. Implementar comandos de Tauri para comunicarse con Node.js
2. Decidir estrategia de integración (Sidecar, Child Process, o HTTP)
3. Crear servidor Node.js wrapper para Core (si es necesario)
4. Implementar funciones de start/stop del servidor desde la UI

## Referencias

- [Tauri Commands](https://tauri.app/v1/guides/features/command/)
- [Tauri Sidecar](https://tauri.app/v1/guides/building/sidecar/)
- [Tauri IPC](https://tauri.app/v1/api/js/modules/tauri/)
