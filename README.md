# 💰 Financial Products App

Una aplicación web moderna para la gestión de productos financieros construida con **Angular 20** y arquitectura **SOLID**. Permite realizar operaciones CRUD completas con una interfaz intuitiva, responsive y optimizada para el rendimiento.

## 📋 Descripción del Software

Esta aplicación permite:

- ✅ **Gestión completa de productos financieros** (Crear, Leer, Actualizar, Eliminar)
- 🔍 **Búsqueda y filtrado avanzado** por nombre, descripción e ID
- 📄 **Paginación dinámica** con opciones de 5, 10, 20 registros por página
- 📱 **Diseño responsive** optimizado para desktop, tablet y móvil
- ⚡ **Performance optimizado** con OnPush change detection y trackBy functions
- 🎨 **UI moderna** con skeletons de carga y animaciones suaves
- 🧪 **Cobertura de tests del 74.11%** en branches

## 🚀 Versiones y Tecnologías

### Versiones Principales
- **Angular**: `20.2.0`
- **TypeScript**: `5.9.2`
- **Node.js**: `18+` (recomendado)
- **npm**: `9+`

### Stack Tecnológico
```json
{
  "frontend": "Angular 20",
  "testing": "Jest + jest-preset-angular",
  "forms": "Angular Reactive Forms",
  "http": "Angular HttpClient",
  "styling": "CSS3 + Flexbox/Grid",
  "architecture": "SOLID Principles"
}
```

## 🛠️ Instalación y Configuración

### 1. Prerrequisitos
```bash
# Verificar versiones
node --version  # >= 18.x
npm --version   # >= 9.x
```

### 2. Clonar e Instalar Dependencias
```bash
# Clonar repositorio
git clone <repository-url>
cd financial-products-app

# Instalar dependencias
npm install
```

### 3. Librerías Principales Instaladas
```bash
# Dependencias de producción
@angular/common@^20.2.0
@angular/core@^20.2.0
@angular/forms@^20.2.0
@angular/router@^20.2.0
rxjs@~7.8.0

# Dependencias de desarrollo
jest@^30.0.5
jest-preset-angular@^15.0.0
@types/jest@^30.0.0
```

## 🖥️ Desarrollo Local

### Levantar la Aplicación
```bash
# Servidor de desarrollo
npm start
# o
ng serve

# La app estará disponible en: http://localhost:4200
```

### Comandos Disponibles
```bash
# Desarrollo
npm start                 # Servidor de desarrollo
npm run build            # Build de producción
npm run watch            # Build con watch mode

# Testing
npm test                 # Ejecutar tests
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Tests con reporte de cobertura
```

## 🌐 APIs y Backend

### Endpoint Principal
```
Base URL: http://localhost:3002
API Path: /bp/products
```

### Operaciones API
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/bp/products` | Obtener todos los productos |
| `POST` | `/bp/products` | Crear nuevo producto |
| `PUT` | `/bp/products` | Actualizar producto existente |
| `DELETE` | `/bp/products?id={id}` | Eliminar producto por ID |

### Activar Backend

Para el backend, necesitas tener corriendo el servidor en el puerto `3002`. 

**Opción 1 - Backend Local:**
```bash
# Si tienes el código del backend
cd backend-project
npm install
npm start  # Debe correr en puerto 3002
```

**Opción 2 - Mock Server (Para desarrollo):**
```bash
# Instalar json-server globalmente
npm install -g json-server

# Crear archivo db.json con datos de prueba
echo '{
  "products": [
    {
      "id": "card-001",
      "name": "Tarjeta de Crédito Premium",
      "description": "Tarjeta con beneficios exclusivos",
      "logo": "https://via.placeholder.com/150",
      "date_release": "2024-01-15",
      "date_revision": "2025-01-15"
    }
  ]
}' > db.json

# Ejecutar mock server
json-server --watch db.json --port 3002 --routes routes.json
```

### Configuración CORS
Si experimentas problemas de CORS, configura el backend para permitir:
```javascript
// Headers permitidos
'Access-Control-Allow-Origin': 'http://localhost:4200'
'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
'Access-Control-Allow-Headers': 'Content-Type, Authorization'
```

## 🧪 Testing

### Librería de Testing: **Jest**

Migrado completamente de Karma a **Jest** por mejor performance y facilidad de uso.

### Configuración Jest
```javascript
// jest.config.js
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/main.ts',
    '!src/polyfills.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

### Ejecutar Tests
```bash
# Tests básicos
npm test

# Tests con watch
npm run test:watch

# Tests con cobertura
npm run test:coverage

# Tests específicos
npm test -- product-list.spec.ts
```

### 📊 Cobertura Actual
```
✅ Test Suites: 7 passed, 7 total
✅ Tests: 121 passed, 121 total

📈 Coverage Summary:
| Métrica    | Cobertura | Estado |
|------------|-----------|---------|
| Statements | 81.18%    | ✅ Excelente |
| Branches   | 74.11%    | ✅ Objetivo Superado |
| Functions  | 84.81%    | ✅ Excelente |
| Lines      | 81.71%    | ✅ Excelente |
```

### Tests Implementados
- **ProductList Component**: 121 tests
  - CRUD operations
  - Form validation
  - Pagination logic
  - Filter functionality
  - Modal interactions
  - Error handling
- **Services**: Tests unitarios completos
  - FinancialProductsService
  - PaginationService  
  - FilterService
- **Edge Cases**: Manejo de errores y estados vacíos

## 🏗️ Arquitectura

### Principios SOLID Aplicados
- **S** - Single Responsibility: Cada servicio tiene una responsabilidad específica
- **O** - Open/Closed: Servicios extensibles sin modificar código existente
- **L** - Liskov Substitution: Interfaces bien definidas
- **I** - Interface Segregation: Interfaces específicas por funcionalidad
- **D** - Dependency Inversion: Componente depende de abstracciones

### Estructura del Proyecto
```
src/
├── app/
│   ├── components/
│   │   └── product-list/           # Componente principal
│   ├── services/
│   │   ├── financial-products.service.ts
│   │   ├── pagination.service.ts
│   │   └── filter.service.ts
│   ├── interfaces/
│   │   └── financial-product.interface.ts
│   └── app.routes.ts
├── assets/                         # Recursos estáticos
└── index.html
```

## 🚀 Optimizaciones Implementadas

- **ChangeDetectionStrategy.OnPush**: Control manual de change detection
- **TrackBy Functions**: Optimización de re-renderizado en listas
- **Lazy Loading**: Carga diferida de componentes
- **Skeleton Loading**: Mejor percepción de velocidad
- **Responsive Design**: Mobile-first approach
- **Error Boundaries**: Manejo robusto de errores

## 📝 Scripts Útiles

```bash
# Desarrollo
npm run ng:version          # Ver versión de Angular CLI
npm run ng:update           # Actualizar dependencias
npm run lint               # Ejecutar linter (si está configurado)

# Producción
npm run build:prod         # Build optimizado para producción
npm run analyze           # Analizar bundle size
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la branch (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

---

**Desarrollado con ❤️ usando Angular 20 y arquitectura SOLID**
