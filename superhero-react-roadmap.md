# Ruta de trabajo: App de superhéroes con React + API REST

Proyecto de práctica frontend: aplicación React que consume una API REST de superhéroes, con listado paginado, detalle, búsqueda y estilos con **Ant Design**.

---

## APIs disponibles

Puedes usar cualquiera de estas dos:

| API | URL base | Auth | Uso recomendado |
|-----|----------|------|-----------------|
| **Superhero API (oficial)** | `https://superheroapi.com/api/{ACCESS_TOKEN}` | Token (gratis, registro en la web) | Producción, límite de requests |
| **superhero-api (open source)** | `https://akabab.github.io/superhero-api/api` o `https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api` | No | Práctica, `/all.json` y `/id/{id}.json` |

Para practicar sin registro, la opción más simple es **superhero-api** (akabab):
- `GET /all.json` → lista completa de personajes
- `GET /id/{id}.json` → detalle de un personaje
- Búsqueda: filtrar en cliente sobre el array de `/all.json` o implementar búsqueda por nombre en el array.

Si usas **superheroapi.com**:
- Token: registrarse en https://superheroapi.com/ y obtener access token.
- `GET /search/{name}` → búsqueda por nombre.
- `GET /id/{id}` → detalle (y sub-endpoints: powerstats, biography, etc.).

En esta ruta se asume que eliges una API y mantienes la misma base URL y estructura de respuesta en todo el proyecto.

---

## Flujo de ramas sugerido

Cada tarea = una rama desde `main`. Al terminar la tarea: commit, push de la rama y (opcional) Pull Request a `main`.

```
main
  ├── 01-setup-proyecto
  ├── 02-configurar-api-cliente
  ├── 03-listado-heroes
  ├── 04-paginacion
  ├── 05-estilos-listado-antd
  ├── 06-ruta-detalle-heroe
  ├── 07-estilos-detalle-antd
  └── 08-busqueda
```

---

## Tareas detalladas

---

### Tarea 1: Inicialización del proyecto

**Rama:** `01-setup-proyecto`

**Objetivo:** Tener un proyecto React funcional con TypeScript y Ant Design instalado.

**Pasos:**

1. Crear proyecto con Vite (recomendado) o Create React App:
   ```bash
   npm create vite@latest superhero-app -- --template react-ts
   cd superhero-app
   npm install
   ```
2. Instalar Ant Design:
   ```bash
   npm install antd
   ```
3. Crear repositorio en GitHub (ej: `superhero-app`) y conectar el repo local:
   ```bash
   git init
   git remote add origin https://github.com/TU_USUARIO/superhero-app.git
   ```
4. Asegurar que la app arranca:
   ```bash
   npm run dev
   ```
5. Opcional: importar estilos base de Ant Design en `main.tsx` o `App.tsx`:
   ```tsx
   import 'antd/dist/reset.css'; // Ant Design v5
   ```
   (En v6 puede no ser necesario; revisar documentación actual de Ant Design.)
6. Commit y push de la rama:
   ```bash
   git checkout -b 01-setup-proyecto
   git add .
   git commit -m "chore: init React + TypeScript + Ant Design"
   git push -u origin 01-setup-proyecto
   ```

**Criterios de aceptación:**

- [ ] El proyecto arranca con `npm run dev` sin errores.
- [ ] Ant Design está en `package.json` y la app compila.
- [ ] Repositorio en GitHub existe y la rama `01-setup-proyecto` está subida.

**Merge a `main`:** Cuando todo funcione, hacer merge de `01-setup-proyecto` a `main` y seguir desde `main` para la siguiente tarea.

---

### Tarea 2: Configurar cliente API y variables de entorno

**Rama:** `02-configurar-api-cliente`

**Objetivo:** Centralizar la URL base de la API y tener una función/cliente para hacer peticiones HTTP.

**Pasos:**

1. Crear archivo de entorno (ej. `.env` en la raíz):
   - Si usas **superhero-api (akabab):**
     ```
     VITE_API_BASE_URL=https://akabab.github.io/superhero-api/api
     ```
   - Si usas **superheroapi.com:** crear token en la web y:
     ```
     VITE_SUPERHERO_API_TOKEN=tu_token
     VITE_API_BASE_URL=https://superheroapi.com/api
     ```
   - En Vite las variables deben empezar por `VITE_` para exponerse al cliente.
2. Crear carpeta `src/services` (o `src/api`) y un módulo `api.ts` (o `heroesApi.ts`) que:
   - Lea `import.meta.env.VITE_API_BASE_URL` (y si aplica el token).
   - Exporte una función `fetchHeroes()` que devuelva la lista (para akabab: fetch de `/all.json`; para superheroapi.com podrías tener que usar otro endpoint según su doc).
   - Exporte una función `fetchHeroById(id: string | number)` que devuelva el detalle de un héroe.
3. Definir tipos TypeScript para la respuesta (al menos `id`, `name`, `image`, y los campos que vayas a mostrar en listado y detalle). Crear `src/types/hero.ts` o similar.
4. Probar en consola o con un `console.log` en un componente que al montar llame a `fetchHeroes()` y muestre el resultado (sin UI todavía).

**Criterios de aceptación:**

- [ ] Existe `.env` con la URL base (y token si aplica). `.env` debe estar en `.gitignore`.
- [ ] Existe un servicio que expone `fetchHeroes` y `fetchHeroById` usando la URL base.
- [ ] Hay tipos TypeScript para el héroe (listado y detalle).
- [ ] La petición de lista (y opcionalmente de detalle) funciona sin errores de CORS en el navegador.

**Rama:** crear desde `main`, implementar, commit, push y PR.

---

### Tarea 3: Mostrar listado de héroes en la UI

**Rama:** `03-listado-heroes`

**Objetivo:** Pantalla principal que muestra la lista de héroes consumiendo la API.

**Pasos:**

1. Crear un estado en el componente principal (o en un componente `HeroList`) para la lista de héroes y el estado de carga/error.
2. En `useEffect`, llamar a `fetchHeroes()` al montar; guardar resultado en el estado y manejar loading y error.
3. Renderizar la lista: por ahora puede ser un `<ul>` con nombres o una lista simple. Mostrar un mensaje de “Cargando…” y otro para “Error al cargar” si aplica.
4. Mostrar al menos: nombre del héroe y, si la API lo devuelve, imagen en miniatura.

**Criterios de aceptación:**

- [ ] Al cargar la app se hace la petición a la API y se muestra la lista de héroes.
- [ ] Se muestra estado de carga mientras llega la respuesta.
- [ ] Se muestra un mensaje o estado de error si la petición falla.
- [ ] Cada ítem muestra nombre y (si aplica) imagen.

**Rama:** desde `main`, implementar, commit, push, PR.

---

### Tarea 4: Paginación del listado

**Rama:** `04-paginacion`

**Objetivo:** Paginar la lista de héroes (en cliente, ya que `/all.json` devuelve todo).

**Pasos:**

1. Definir constantes: `PAGE_SIZE` (ej. 20) y estado para `currentPage` (empezar en 1).
2. Calcular el subconjunto de héroes a mostrar:
   - `startIndex = (currentPage - 1) * PAGE_SIZE`
   - `endIndex = startIndex + PAGE_SIZE`
   - `paginatedHeroes = heroes.slice(startIndex, endIndex)`
3. Renderizar solo `paginatedHeroes` en la lista.
4. Añadir controles de paginación: botones “Anterior” y “Siguiente” (y deshabilitar “Anterior” en página 1 y “Siguiente” en la última). Opcional: mostrar “Página X de Y”.
5. Al hacer clic en “Siguiente” o “Anterior”, actualizar `currentPage` y que la lista se actualice.

**Criterios de aceptación:**

- [ ] Solo se muestran los héroes de la página actual (ej. 20 por página).
- [ ] Los botones de paginación cambian la página y la lista se actualiza correctamente.
- [ ] No se pueden ir a páginas inexistentes (botones deshabilitados o lógica que lo impida).

**Rama:** desde `main`, implementar, commit, push, PR.

---

### Tarea 5: Estilos del listado con Ant Design

**Rama:** `05-estilos-listado-antd`

**Objetivo:** Usar componentes de Ant Design para el listado y que se vea ordenado y responsive.

**Pasos:**

1. Sustituir la lista manual por componentes de Ant Design, por ejemplo:
   - `List` + `List.Item` para la lista, o
   - `Row` + `Col` + `Card` para una cuadrícula de tarjetas (recomendado para héroes con imagen y nombre).
2. Usar `Card` por héroe: imagen (`Card.cover` o `<img>`), `Card.Meta` con título (nombre) y opcionalmente subtítulo (ej. “Alignment” o “Publisher” si la API lo trae).
3. Aplicar `Grid` (Row/Col) para que en pantallas grandes haya varias columnas y en móvil una o dos.
4. Mostrar estado de carga con `Spin` de Ant Design y mensaje de error con `Alert`.
5. Revisar que la paginación siga funcionando con el nuevo layout.

**Criterios de aceptación:**

- [ ] El listado usa componentes de Ant Design (List/Card/Grid).
- [ ] El diseño es responsive (más columnas en desktop, menos en móvil).
- [ ] Loading con `Spin` y error con `Alert`.
- [ ] La paginación sigue operativa.

**Rama:** desde `main`, implementar, commit, push, PR.

---

### Tarea 6: Ruta y pantalla de detalle de héroe

**Rama:** `06-ruta-detalle-heroe`

**Objetivo:** Al hacer clic en un héroe, navegar a una ruta de detalle y mostrar datos del personaje.

**Pasos:**

1. Instalar React Router (si no está):
   ```bash
   npm install react-router-dom
   ```
2. Configurar el router en la app (ej. en `main.tsx` o `App.tsx`): rutas como `/` (listado) y `/hero/:id` (detalle).
3. En el listado, hacer que cada tarjeta/ítem sea clicable: usar `Link` o `useNavigate` con `id` del héroe hacia `/hero/:id`.
4. Crear componente `HeroDetail` (o similar) que:
   - Lea el `id` de la URL con `useParams()`.
   - En `useEffect`, llame a `fetchHeroById(id)` y guarde el resultado en estado (y loading/error).
   - Renderice los datos del héroe: nombre, imagen, y los campos que quieras (powerstats, biography, etc. según la API).
5. Incluir un enlace o botón “Volver al listado” que navegue a `/`.

**Criterios de aceptación:**

- [ ] Desde el listado se puede hacer clic en un héroe y se navega a `/hero/:id`.
- [ ] La pantalla de detalle muestra datos del héroe obtenidos con `fetchHeroById(id)`.
- [ ] Hay estado de carga y manejo de error en el detalle.
- [ ] Se puede volver al listado desde el detalle.

**Rama:** desde `main`, implementar, commit, push, PR.

---

### Tarea 7: Estilos del detalle con Ant Design

**Rama:** `07-estilos-detalle-antd`

**Objetivo:** Maquetar la pantalla de detalle con Ant Design para que sea clara y legible.

**Pasos:**

1. Usar `Card` o `Descriptions` para organizar la información del héroe (nombre, imagen, estadísticas, biografía, etc.).
2. Mostrar la imagen principal con buen tamaño (ej. `Image` de Ant Design o `<img>` dentro de un layout).
3. Usar `Typography` (Title, Paragraph) para títulos y textos.
4. Si la API trae powerstats (fuerza, inteligencia, etc.), mostrarlos con `Progress` o una pequeña lista con `Tag`/badges.
5. Mantener el botón/enlace “Volver al listado” con estilo consistente (ej. `Button`).
6. Asegurar que en móvil el detalle se vea bien (layout responsive).

**Criterios de aceptación:**

- [ ] El detalle usa componentes de Ant Design (Card, Descriptions, Typography, Progress/Tag, etc.).
- [ ] La información está organizada y es fácil de leer.
- [ ] El diseño es responsive.
- [ ] “Volver al listado” está visible y funciona.

**Rama:** desde `main`, implementar, commit, push, PR.

---

### Tarea 8: Búsqueda de héroes

**Rama:** `08-busqueda`

**Objetivo:** Poder filtrar/buscar héroes por nombre (y opcionalmente por otros campos).

**Pasos:**

1. Añadir un campo de búsqueda en la parte superior del listado (Input de Ant Design). Si usas superheroapi.com con endpoint `/search/{name}`, puedes buscar en la API; si usas `/all.json`, filtrar en cliente.
2. **Si buscas en cliente (akabab):**
   - Estado `searchQuery` (string).
   - Lista filtrada: `heroes.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()))`.
   - Aplicar la paginación sobre la lista filtrada (no sobre la lista completa).
3. **Si buscas en API (superheroapi.com):**
   - Al escribir y (opcional) al pulsar “Buscar” o con debounce, llamar al endpoint de búsqueda y mostrar resultados; decidir si la paginación es en cliente sobre esos resultados o si la API devuelve pocos y no hace falta.
4. Mostrar mensaje cuando no hay resultados: “No se encontraron héroes”.
5. Considerar limpiar la búsqueda al volver al listado o mantener el criterio; documentar el comportamiento en un comentario o en el PR.

**Criterios de aceptación:**

- [ ] Hay un input de búsqueda visible en el listado.
- [ ] Al escribir (o al enviar búsqueda), la lista se filtra por nombre (o por lo definido).
- [ ] Si no hay resultados, se muestra un mensaje claro.
- [ ] La paginación sigue funcionando sobre los resultados filtrados (cuando aplique).

**Rama:** desde `main`, implementar, commit, push, PR.

---

## Resumen de ramas y PRs

| Orden | Rama                  | Descripción breve                    |
|-------|------------------------|--------------------------------------|
| 1     | `01-setup-proyecto`   | React + TS + Ant Design + repo       |
| 2     | `02-configurar-api-cliente` | API client + env + tipos        |
| 3     | `03-listado-heroes`   | Listado desde API + loading/error    |
| 4     | `04-paginacion`       | Paginación en cliente                |
| 5     | `05-estilos-listado-antd` | Listado con Ant Design (Card/Grid)  |
| 6     | `06-ruta-detalle-heroe`   | React Router + pantalla detalle  |
| 7     | `07-estilos-detalle-antd` | Detalle con Ant Design           |
| 8     | `08-busqueda`         | Búsqueda por nombre                  |

---

## Consejos

- Hacer una tarea por vez y mergear a `main` antes de pasar a la siguiente (o mantener ramas actualizadas con `main`).
- Escribir mensajes de commit claros (ej. “feat: add hero list with API”).
- En cada PR puede revisar contigo el código antes de mergear.
- Si la API oficial (superheroapi.com) tiene límite de requests, usar la de akabab para desarrollo o cachear respuestas en estado/localStorage para no pasarse del límite.

Si quieres, el siguiente paso puede ser generar el esqueleto del proyecto (comando de creación + estructura de carpetas y un `api.ts` y `hero.ts` de ejemplo) para que pueda empezar por la Tarea 2 con todo listo.
