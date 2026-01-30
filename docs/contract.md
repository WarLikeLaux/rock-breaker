# 📜 Code Contract

## Запреты

- ❌ `as Type` — unsafe assertion
- ❌ `any`
- ❌ `!` — non-null assertion
- ❌ Комментарии в коде
- ❌ Inline-стили в Vue

## Обязательно

- ✅ Early return для невалидных случаев
- ✅ Optional chaining (`?.`, `??`)
- ✅ try/catch для async операций
- ✅ Guard clauses перед работой с данными
- ✅ Проверка границ массивов перед доступом

## Тесты

- Покрываем бизнес-логику, не фреймворк
- Не тестируем геттеры, сеттеры, computed-обёртки
- Приоритет: функции с условиями, валидация, расчёты
- Названия на русском, описывают что проверяется
- Структура: Arrange → Act → Assert
- Одна проверка на тест
- Моки: только localStorage

## Проверка

```bash
pnpm lint && pnpm test
```

Сдача без прохождения — запрещена.

## См. также

- `docs/styleguide.md` — правила текста
- `docs/codestyleguide.md` — стиль кода
