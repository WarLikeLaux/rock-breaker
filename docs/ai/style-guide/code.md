# Code Styleguide

## Именование

| Тип             | Стиль           | Пример                     |
| --------------- | --------------- | -------------------------- |
| Переменные      | camelCase       | `currentHp`, `isActive`    |
| Функции         | camelCase       | `calculateDamage`          |
| Константы       | SCREAMING_SNAKE | `MAX_HP`                   |
| Типы/Интерфейсы | PascalCase      | `Task`, `GameState`        |
| Компоненты      | PascalCase      | `TaskList.vue`             |
| Булевы          | is/has/can      | `isCompleted`, `hasErrors` |

## Структура файлов

- 150 строк — мягкий лимит
- 200 строк — рефакторинг обязателен

## Стек

- Vue 3 (Composition API, `<script setup>`)
- Tailwind CSS (никаких inline-стилей)
- TypeScript strict mode
