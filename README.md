# Soundlog — Guía del proyecto

## Estructura de archivos

```
soundlog/
├── css/
│   └── styles.css       ← Sistema de diseño completo (variables, componentes)
├── js/
│   └── main.js          ← Lógica de UI + placeholders para Spotify/Apple Music
└── pages/
    ├── index.html       ← Feed principal (home)
    ├── perfil.html      ← Perfil de usuario
    ├── album.html       ← Página de álbum con reseñas  (próximo)
    ├── stats.html       ← Estadísticas del usuario     (próximo)
    ├── foros.html       ← Listado de foros             (próximo)
    └── login.html       ← Login / Registro             (próximo)
```

---

## Stack recomendado para producción

| Capa         | Tecnología                        | Por qué                                    |
|--------------|-----------------------------------|--------------------------------------------|
| Frontend     | Next.js + Tailwind CSS            | SSR, rutas dinámicas, fácil deploy         |
| Auth         | Supabase Auth                     | Gratis, email + OAuth (Spotify)            |
| Base de datos| Supabase (PostgreSQL)             | Gratis hasta 500MB, tiempo real            |
| API música   | Spotify Web API                   | Mejor documentada, gratis                  |
| API metadata | MusicBrainz / Last.fm             | Datos de álbumes, géneros, artistas        |
| Deploy       | Vercel                            | CI/CD automático con GitHub                |

---

## Integración con Spotify

### 1. Crear app en Spotify
- Ir a: https://developer.spotify.com/dashboard
- Crear nueva aplicación
- Guardar `Client ID` y `Client Secret`
- Agregar `http://localhost:3000/callback` a Redirect URIs

### 2. Endpoints que usarás

```
GET /v1/me/player/currently-playing
    → "Escuchando ahora mismo"

GET /v1/me/player/recently-played?limit=20
    → Canciones escuchadas recientemente

GET /v1/me/top/artists?time_range=short_term&limit=5
    → Top artistas de la semana (short_term = ~4 semanas)

GET /v1/me/top/artists?time_range=medium_term&limit=5
    → Top artistas del mes (medium_term = ~6 meses)
```

### 3. Flujo OAuth (PKCE recomendado para frontend)
```
Usuario → Botón "Conectar Spotify"
       → Redirige a accounts.spotify.com/authorize
       → Usuario acepta permisos
       → Redirige a tu /callback con access_token
       → Guardas el token en localStorage o Supabase
       → Llamas a los endpoints de arriba
```

---

## Base de datos (Supabase)

### Tablas principales

```sql
-- Usuarios
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    TEXT UNIQUE NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  bio         TEXT,
  spotify_id  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Álbumes (poblados desde Spotify o MusicBrainz)
CREATE TABLE albums (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id  TEXT UNIQUE,
  mb_id       TEXT,          -- MusicBrainz ID
  title       TEXT NOT NULL,
  artist      TEXT NOT NULL,
  genre       TEXT[],
  year        INT,
  cover_url   TEXT
);

-- Registro de escuchas
CREATE TABLE listens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id),
  album_id   UUID REFERENCES albums(id),
  listened_at TIMESTAMPTZ DEFAULT now()
);

-- Reseñas
CREATE TABLE reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id),
  album_id   UUID REFERENCES albums(id),
  rating     SMALLINT CHECK (rating BETWEEN 1 AND 5),
  text       TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Favoritos
CREATE TABLE favorites (
  user_id    UUID REFERENCES users(id),
  album_id   UUID REFERENCES albums(id),
  type       TEXT CHECK (type IN ('album','artist','song','genre')),
  PRIMARY KEY (user_id, album_id, type)
);

-- Listas
CREATE TABLE lists (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id),
  title      TEXT NOT NULL,
  public     BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Items de listas
CREATE TABLE list_items (
  list_id    UUID REFERENCES lists(id),
  album_id   UUID REFERENCES albums(id),
  position   INT,
  PRIMARY KEY (list_id, album_id)
);

-- Seguidores
CREATE TABLE follows (
  follower_id UUID REFERENCES users(id),
  following_id UUID REFERENCES users(id),
  PRIMARY KEY (follower_id, following_id)
);

-- Foros
CREATE TABLE forums (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT,  -- 'genre', 'artist', 'album', 'general'
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Posts de foros
CREATE TABLE forum_posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id   UUID REFERENCES forums(id),
  user_id    UUID REFERENCES users(id),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Próximos pasos sugeridos

1. **Crear cuenta en Supabase** (gratis) → supabase.com
2. **Crear las tablas** con el SQL de arriba
3. **Registrar la app en Spotify Developer**
4. **Instalar Next.js** → `npx create-next-app@latest soundlog`
5. Migrar este HTML/CSS a componentes React
6. Conectar Supabase Auth para login/registro
7. Implementar OAuth con Spotify

---

## Páginas pendientes de diseñar

- `album.html` — Página de álbum: portada, tracklist, calificación promedio, reseñas
- `stats.html` — Dashboard de estadísticas: heatmap anual, géneros, décadas, racha
- `foros.html` — Lista de foros y vista de hilo de conversación
- `login.html` — Pantalla de login y registro
- `explorar.html` — Descubrimiento: álbumes populares, novedades, recomendados

¡Avísame cuál quieres ver a continuación!
