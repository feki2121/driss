# Données dynamiques et administration

Les pages utilisent l'API Next.js et les modèles définis dans `prisma/schema.prisma`.
En développement, les commandes `db:push` et `db:generate` utilisent
`prisma/schema.dev.prisma`.

## Initialisation locale

1. En local, `schema.dev.prisma` utilise SQLite dans `prisma/dev.db`.
   En production, configurez `DATABASE_URL` pour PostgreSQL, générez le client
   avec `pnpm db:generate:prod` et définissez `ADMIN_SESSION_SECRET` dans
   l'environnement. Ce secret doit faire au moins 32 caractères et rester privé.
2. Créez les tables et le client Prisma avec `pnpm db:push` puis
   `pnpm db:generate`.
3. Créez ou réinitialisez l'administrateur en définissant `ADMIN_EMAIL` et
   `ADMIN_PASSWORD` (12 caractères minimum), puis lancez `pnpm admin:create`.
4. Démarrez l'application avec `pnpm dev`.

Le compte admin est stocké dans `Admin` avec un hash scrypt. La session est un
cookie signé, `HttpOnly`, `SameSite=Lax` et de durée limitée. Il n'existe pas
d'identifiants de démonstration ni de création publique de comptes.

## API

- `GET /api/products` et `GET /api/products/:id` : produits actifs ; un
  administrateur connecté peut aussi consulter les produits inactifs.
- `POST /api/products`, `PATCH /api/products/:id`, `DELETE /api/products/:id` :
  gestion admin des produits.
- `GET /api/categories`, `POST /api/categories`,
  `PATCH /api/categories/:id`, `DELETE /api/categories/:id` : catégories.
- `POST /api/orders` : création publique d'une commande, avec prix et stock
  recalculés côté serveur. Les commandes et le stock sont écrits atomiquement.
- `GET /api/orders`, `PATCH /api/orders/:id`, `DELETE /api/orders/:id` :
  consultation et gestion admin des commandes. `GET /api/orders/:id` lit une
  commande précise et est également réservé à l'administrateur.
- `GET /api/settings`, `PUT /api/settings` : paramètres publics et mise à jour
  admin.
- `GET /api/admin/session`, `POST /api/admin/session`,
  `DELETE /api/admin/session` : vérification, connexion et déconnexion admin.
