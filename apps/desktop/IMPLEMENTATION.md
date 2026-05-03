# Implementación de Gestión de Estado Global

## Resumen

Se ha implementado una solución de gestión de estado global para la aplicación desktop de Dynamic Mock Server usando Zustand con persistencia en localStorage. La implementación está diseñada para trabajar con la arquitectura cliente-servidor de Tauri.

## ⚠️ Importante: Arquitectura Tauri

**Los paquetes `@dynamic-mock-server/core` y `@dynamic-mock-server/config` NO pueden ejecutarse en el navegador** porque dependen de módulos de Node.js (`fs`, `http`, `path`, etc.).

**Solución**: El store frontend solo maneja datos (paths, configuración en JSON), mientras que las instancias de Core y Config deben ejecutarse en el backend de Tauri.

Ver [TAURI_ARCHITECTURE.md](./TAURI_ARCHITECTURE.md) para detalles completos sobre la arquitectura.

## Archivos Creados/Modificados

### 1. Store Principal

**Archivo**: [apps/desktop/src/stores/app-store.ts](apps/desktop/src/stores/app-store.ts)

Store de Zustand que maneja:

- **Estado persistente**: La ruta del proyecto se guarda en localStorage
- **Solo datos serializables**: No almacena instancias de objetos, solo JSON
- **Preparado para Tauri IPC**: Diseñado para comunicarse con el backend vía Tauri commands

**Nota**: Core y Config NO están en este store. Vivirán en el backend de Tauri.

### 2. Componente FolderSelector Actualizado

**Archivo**: [apps/desktop/src/components/ui/folder-selector/folder-selector.tsx](apps/desktop/src/components/ui/folder-selector/folder-selector.tsx)

Cambios realizados:

- Integración con el store global
- Persistencia automática de la ruta seleccionada
- Inicialización automática de Config y Core al seleccionar carpeta
- Indicadores de carga y estado
- Manejo de errores mejorado

### 3. Archivos de Soporte

- **[apps/desktop/src/stores/index.ts](apps/desktop/src/stores/index.ts)**: Exportaciones del store
- **[apps/desktop/src/stores/app-store.examples.tsx](apps/desktop/src/stores/app-store.examples.tsx)**: Ejemplos de uso
- **[apps/desktop/src/types/config.types.ts](apps/desktop/src/types/config.types.ts)**: Tipos de configuración

### 4. Documentación de Arquitectura

- **[apps/desktop/TAURI_ARCHITECTURE.md](apps/desktop/TAURI_ARCHITECTURE.md)**: Guía completa de la arquitectura Tauri/package.json)
- Agregada dependencia: `@dynamic-mock-server/config`

## Características Implementadas

### ✅ Persistencia en LocalStorage

```typescript
const useAppStore = create<AppState & AppActions>()(
  persist(
    // ... store implementation
    {
      name: "app-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ projectPath: state.projectPath }),
    },
  ),
);
```

### ✅ Gestión de Estado del Proyecto

Cuando se selecciona una carpeta:

1. Se guarda la ruta en localStorage
2. Se actualiza el estado de la aplicación
3. **(TODO)** Se envía un comando Tauri para cargar la configuración en el backend

### ✅ Tipos Compartidos

Los tipos de configuración están definidos en el frontend para evitar importar código de Node.js:

- `apps/desktop/src/types/config.types.ts`

### ❌ Pendiente: Integración con Tauri Backend

Necesita implementarse:

- Comandos Tauri para cargar configuración
- Comandos Tauri para iniciar/detener servidor
- Comunicación IPC entre frontend y backend

## Uso en Otros Componentes

### Acceder al Estado

```typescript
import { useAppStore } from "@/stores";

function MyComponent() {
  const projectPath = useAppStore((state) => state.projectPath);
  const core = useAppStore((state) => state.core);
  const config = useAppStore((state) => state.config);

  // ...
}
```

### Iniciar/Detener el Servidor

```typescript
const core = useAppStore((state) => state.core);

// Iniciar
if (core) {
  await core.init();
  await core.start();
}

// Detener
if (core) {
  await core.stop();
}
```

nfig = useAppStore((state) => state.config);

// ...
}

````

### Iniciar/Detener el Servidor (Pendiente)
```typescript
import { invoke } from "@tauri-apps/api/core";

// TODO: Implementar estos comandos en el backend de Tauri
await invoke("start_server");
await invoke("stop_server");   ↓
Config.loadConfig() busca archivo de configuración
    ↓
Store crea Core instance con Config
    ↓
Estado actualizado: { projectPath, config, core }
    ↓
Path guardado en localStorage
    ↓
Componentes reaccionan a cambios de estado
````

## Compatibilidad con Tauri

La solución es 100% compatible con Tauri:

- ✅ Usa localStorage (disponible en webview de Tauri)
- ✅ No depende de APIs de Node.js
- ✅ Compatible con el sistema de archivos a través de Tauri plugins
- ✅ Config package usa cosmiconfig que funciona en entorno Tauri

## Archivos de Configuración Soportados

El sistema busccompatible con Tauri:

- ✅ Usa localStorage (disponible en webview de Tauri)
- ✅ Solo almacena datos serializables (JSON)
- ✅ No importa código de Node.js en el frontend
- ❌ Requiere implementar comandos Tauri para backend (pendiente)
  FolderSelector llama setProjectPath(path)
  ↓
  Store guarda path en localStorage
  ↓
  Estado actualizado: { projectPath }
  ↓

### 1. Implementar Backend de Tauri

- Crear comandos Tauri en Rust para:
  - `load_config(path: String) -> ConfigType`
  - `start_server() -> Result<(), String>`
  - `stop_server() -> Result<(), String>`
  - `reload_config() -> ConfigType`

### 2. Integrar Node.js con Tauri

Opciones:

- **Opción A**: Ejecutar Core en un proceso hijo de Node.js
- **Opción B**: Usar un sidecar con Node.js empaquetado
- **Opción C** (Recomendado): Servidor HTTP local - Core corre independientemente, Tauri solo gestiona el ciclo de vida

### 3. Actualizar Frontend

- Conectar `setProjectPath()` con `invoke("load_config")`
- Crear controles de UI para start/stop server
- Implementar manejo de errores del backend
- Mostrar estado del servidor en tiempo real

### 4. Testing

- Probar persistencia entre sesiones
- Verificar comunicación IPC
- Testear cambio de proyectos
- Validar manejo de errores

Ver [TAURI_ARCHITECTURE.md](./TAURI_ARCHITECTURE.md) para detalles de implementación.
Componentes reaccionan a cambios de estado

```stado de la Implementación

### ✅ Completado

1. ✅ Store de Zustand con persistencia en localStorage
2. ✅ Tipos de configuración definidos para el frontend
3. ✅ Componente FolderSelector actualizado
4. ✅ Arquitectura diseñada para separar frontend/backend
5. ✅ Documentación completa
6. ✅ Build exitoso de la aplicación

### ❌ Pendiente

1. ❌ Implementar comandos de Tauri (Rust backend)
2. ❌ Decidir estrategia de integración con Node.js
3. ❌ Conectar frontend con backend vía Tauri IPC
4. ❌ Implementar funciones de start/stop del servidor desde la UI
5. ❌ Sistema de notificaciones (reemplazar `alert()`)

## Documentación Completa

- **[TAURI_ARCHITECTURE.md](./TAURI_ARCHITECTURE.md)** - Arquitectura y decisiones técnicas
- **[stores/README.md](src/stores/README.md)** - Documentación del store
- **[stores/app-store.examples.tsx](src/stores/app-store.examples.tsx)** - Ejemplos de uso
                  │
┌─────────────────▼───────────────────────┐
│      Backend (Tauri/Rust + Node.js)     │
│  - Core Instance                        │
│  - Config Instance                      │
│  - Server (Fastify)                     │
│  - File System Access                   │
└─────────────────────────────────────────┘
## Ejemplos de Uso

Consulta [apps/desktop/src/stores/app-store.examples.tsx](apps/desktop/src/stores/app-store.examples.tsx) para ver ejemplos completos de:
- Visualización de configuración
- Controles de servidor
- Recarga de configuración
- Observadores de cambios
- Estado de la aplicación
- Botón de reset

## Documentación Completa

Para más detalles, consulta [apps/desktop/src/stores/README.md](apps/desktop/src/stores/README.md)
```
