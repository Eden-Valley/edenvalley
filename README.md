# Eden Valley Genesis

## Configuration des variables d'environnement

Pour que l'application puisse se connecter à la base de données Neon PostgreSQL, vous devez créer un fichier `.env.local` à la racine du projet avec le contenu suivant :

```env
VITE_DATABASE_URL=votre_chaine_de_connexion_neon
```

L'application utilise une chaîne de repli par défaut pour le développement, mais il est fortement recommandé d'utiliser des variables d'environnement pour la production.

## Storytelling & Diagnostic

Si le contenu de storytelling (sections Pain, Relief, Revelation) ne s'affiche pas sur les pages de résultats ou de financement :

1. Vérifiez les logs de la console. Des messages `[Storytelling Diagnostic]` affichent l'état des données récupérées depuis le système de traduction.
2. Assurez-vous que les fichiers de traduction dans `src/i18n/translations.ts` contiennent bien les clés attendues (ex: `thinker.pain1`, `funder.revelation`).
3. Le système utilise un `IntersectionObserver` pour révéler le contenu au scroll. Vérifiez que la classe `.visible` est bien ajoutée aux éléments `.scroll-reveal`.

## Tests

Pour lancer les tests unitaires :

```bash
npm test
```

Des tests ont été ajoutés pour vérifier que :
- Le storytelling est rendu correctement quand les données sont présentes.
- Le nouveau logo (traits croisés) est affiché dans la navigation.

