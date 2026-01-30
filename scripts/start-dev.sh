#!/bin/bash
cd "$(dirname "$0")/.." || { echo "Ошибка: не удалось перейти в директорию проекта"; exit 1; }
exec pnpm dev
