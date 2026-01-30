<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  close: [];
  back: [];
}>();

const openSection = ref<string | null>(null);

function toggleSection(id: string): void {
  openSection.value = openSection.value === id ? null : id;
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center"
    @click.self="emit('close')">
    <div class="w-full max-w-sm bg-slate-800 rounded-t-2xl sm:rounded-2xl p-6 space-y-3 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <button @click="emit('back')"
            class="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h3 class="text-lg font-bold text-white">Справка</h3>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-white text-2xl">&times;</button>
      </div>

      <div class="space-y-2">

        <button @click="toggleSection('idea')"
          class="w-full flex items-center justify-between px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors text-left">
          <span class="text-sm font-medium text-white">💡 Идея</span>
          <span class="text-slate-400 text-xs transition-transform"
            :class="{ 'rotate-180': openSection === 'idea' }">▼</span>
        </button>
        <div v-if="openSection === 'idea'"
          class="px-4 py-3 bg-slate-700/30 rounded-xl text-sm text-slate-300 space-y-2">
          <p>Ты ставишь цель и каждый день делаешь <strong class="text-white">5 маленьких шагов</strong> к ней. Каждый шаг - удар по скале.</p>
          <p>Не нужно покорять гору за день. Достаточно <strong class="text-amber-400">5 ударов</strong> - и ты молодец.</p>
        </div>

        <button @click="toggleSection('basics')"
          class="w-full flex items-center justify-between px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors text-left">
          <span class="text-sm font-medium text-white">🪨 Скала и HP</span>
          <span class="text-slate-400 text-xs transition-transform"
            :class="{ 'rotate-180': openSection === 'basics' }">▼</span>
        </button>
        <div v-if="openSection === 'basics'"
          class="px-4 py-3 bg-slate-700/30 rounded-xl text-sm text-slate-300 space-y-2">
          <p><strong class="text-white">Скала</strong> - твоя цель. У неё есть здоровье (HP), которое рассчитывается как <strong class="text-white">5 HP за каждый день</strong> срока.</p>
          <p>Создай до <strong class="text-white">5 задач</strong> - ежедневных привычек. Выполнил задачу - нанёс 1 удар (-1 HP).</p>
          <p>Скала меняет вид по мере разрушения:</p>
          <div class="grid grid-cols-2 gap-1 text-xs mt-1">
            <span>🪨 75-100% - Непокорённая</span>
            <span>⛰️ 50-75% - Треснула</span>
            <span>🏔️ 25-50% - Крошится</span>
            <span>💥 1-25% - Почти всё!</span>
          </div>
          <p>Когда HP упадёт до нуля - <strong class="text-amber-400">победа</strong> ✨</p>
        </div>

        <button @click="toggleSection('tasks')"
          class="w-full flex items-center justify-between px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors text-left">
          <span class="text-sm font-medium text-white">⚔️ Экипировка</span>
          <span class="text-slate-400 text-xs transition-transform"
            :class="{ 'rotate-180': openSection === 'tasks' }">▼</span>
        </button>
        <div v-if="openSection === 'tasks'"
          class="px-4 py-3 bg-slate-700/30 rounded-xl text-sm text-slate-300 space-y-2">
          <p>Задачи - это твоя экипировка. Максимум <strong class="text-white">5 штук</strong> на одну скалу.</p>
          <p>Нажми на задачу, чтобы отметить выполнение. Нажми на текст, чтобы отредактировать.</p>
          <p>Нажми на иконку слева от задачи, чтобы сменить тип или настроить повторения.</p>
          <p>Кнопка <strong class="text-white">-</strong> справа отменяет одно выполнение, если ошибся.</p>
        </div>

        <button @click="toggleSection('taskTypes')"
          class="w-full flex items-center justify-between px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors text-left">
          <span class="text-sm font-medium text-white">⛏️ Типы задач</span>
          <span class="text-slate-400 text-xs transition-transform"
            :class="{ 'rotate-180': openSection === 'taskTypes' }">▼</span>
        </button>
        <div v-if="openSection === 'taskTypes'"
          class="px-4 py-3 bg-slate-700/30 rounded-xl text-sm text-slate-300 space-y-3">
          <div>
            <p class="text-white font-medium">⛏️ Привычка</p>
            <p>Постоянная задача. Текст сохраняется каждый день. Это основа - то, что ты делаешь регулярно.</p>
          </div>
          <div>
            <p class="text-purple-300 font-medium">🃏 Разовая (Джокер)</p>
            <p>Слот для текучки. Каждое утро очищается - вписывай новое дело на сегодня. Подходит для задач, которые не повторяются.</p>
          </div>
          <div>
            <p class="text-amber-300 font-medium">⏳ На день (Подмена)</p>
            <p>Временно заменяет привычку на один день. Завтра вернётся исходная задача. Доступна только для привычек с текстом.</p>
          </div>
        </div>

        <button @click="toggleSection('executions')"
          class="w-full flex items-center justify-between px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors text-left">
          <span class="text-sm font-medium text-white">🔁 Повторения</span>
          <span class="text-slate-400 text-xs transition-transform"
            :class="{ 'rotate-180': openSection === 'executions' }">▼</span>
        </button>
        <div v-if="openSection === 'executions'"
          class="px-4 py-3 bg-slate-700/30 rounded-xl text-sm text-slate-300 space-y-2">
          <p>Привычка может требовать <strong class="text-white">2 или 3 выполнения</strong> в день.</p>
          <p>Настрой через меню типа задачи: нажми на иконку слева и выбери 1x, 2x или 3x.</p>
          <p>Каждый клик отмечает одно выполнение. На кнопке видно прогресс (например, 1/3).</p>
          <p>Урон по скале наносится только при <strong class="text-amber-400">полном</strong> выполнении всех повторений.</p>
          <p class="text-slate-400 text-xs">Недоступно для разовых задач (🃏).</p>
        </div>

        <button @click="toggleSection('sideQuests')"
          class="w-full flex items-center justify-between px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors text-left">
          <span class="text-sm font-medium text-white">🗺️ Сайд-квесты</span>
          <span class="text-slate-400 text-xs transition-transform"
            :class="{ 'rotate-180': openSection === 'sideQuests' }">▼</span>
        </button>
        <div v-if="openSection === 'sideQuests'"
          class="px-4 py-3 bg-slate-700/30 rounded-xl text-sm text-slate-300 space-y-2">
          <p>Дополнительные цели - хобби, второстепенные проекты. Каждый сайд-квест - <strong class="text-white">отдельная скала</strong> со своими 5 задачами.</p>
          <p><strong class="text-white">Десктоп:</strong> сайд-квесты видны на боковых панелях. Нажми на карточку, чтобы переключиться.</p>
          <p><strong class="text-white">Мобильные:</strong> открой меню через иконку 🔒 в правом верхнем углу.</p>
          <p>В настройках можно <strong class="text-amber-400">повысить</strong> сайд-квест до основной цели (⭐) или удалить его (🗑️).</p>
          <p>При нажатии "Новый день" ты автоматически вернёшься к основной скале.</p>
        </div>

        <button @click="toggleSection('hardMode')"
          class="w-full flex items-center justify-between px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors text-left">
          <span class="text-sm font-medium text-white">🔥 Хардмод</span>
          <span class="text-slate-400 text-xs transition-transform"
            :class="{ 'rotate-180': openSection === 'hardMode' }">▼</span>
        </button>
        <div v-if="openSection === 'hardMode'"
          class="px-4 py-3 bg-slate-700/30 rounded-xl text-sm text-slate-300 space-y-2">
          <p>Включи в настройках, чтобы <strong class="text-white">заблокировать сайд-квесты</strong> до выполнения всех 5 задач основной скалы.</p>
          <p>Сайд-квесты покроются туманом и станут недоступны. Выполни дневную норму - туман рассеется.</p>
          <p>Принцип "сделал дело - гуляй смело".</p>
          <p class="text-slate-400 text-xs">По умолчанию выключен - сайд-квесты доступны всегда.</p>
        </div>

        <button @click="toggleSection('focusMode')"
          class="w-full flex items-center justify-between px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors text-left">
          <span class="text-sm font-medium text-white">🎯 Фокус-режим</span>
          <span class="text-slate-400 text-xs transition-transform"
            :class="{ 'rotate-180': openSection === 'focusMode' }">▼</span>
        </button>
        <div v-if="openSection === 'focusMode'"
          class="px-4 py-3 bg-slate-700/30 rounded-xl text-sm text-slate-300 space-y-2">
          <p>Показывает <strong class="text-white">одну задачу</strong> за раз в случайном порядке. Остальные скрыты, скала затемнена.</p>
          <p>Выполни текущую - появится следующая. Кнопка <strong class="text-white">🎲 Другую задачу</strong> переключит на случайную.</p>
          <p>Помогает при параличе выбора: не нужно думать, что делать - приложение само предложит.</p>
          <p class="text-slate-400 text-xs">Включается в настройках или кнопкой в списке задач.</p>
        </div>

        <button @click="toggleSection('newDay')"
          class="w-full flex items-center justify-between px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors text-left">
          <span class="text-sm font-medium text-white">🌅 Новый день</span>
          <span class="text-slate-400 text-xs transition-transform"
            :class="{ 'rotate-180': openSection === 'newDay' }">▼</span>
        </button>
        <div v-if="openSection === 'newDay'"
          class="px-4 py-3 bg-slate-700/30 rounded-xl text-sm text-slate-300 space-y-2">
          <p>Новый день наступает <strong class="text-white">автоматически</strong> при открытии приложения, если время перешло границу дня.</p>
          <p>Также можно нажать <strong class="text-white">🌅 Новый день</strong> в настройках вручную (с подтверждением).</p>
          <p>Что произойдёт:</p>
          <ul class="list-disc list-inside space-y-1 ml-1">
            <li>Все галочки сбросятся</li>
            <li>Разовые задачи (🃏) очистятся</li>
            <li>Подмены (⏳) вернут исходные привычки</li>
            <li>Счётчики повторений обнулятся</li>
            <li>Активная скала переключится на основную</li>
          </ul>
          <p>HP скалы <strong class="text-amber-400">не восстанавливается</strong> - прогресс сохраняется.</p>
          <p class="mt-2"><strong class="text-white">🕐 Начало дня</strong> - в настройках можно выбрать, во сколько начинается новый день. По умолчанию - полночь (00:00). Если поставить 05:00, то до 5 утра будет считаться "вчера".</p>
        </div>

        <button @click="toggleSection('victory')"
          class="w-full flex items-center justify-between px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors text-left">
          <span class="text-sm font-medium text-white">🎉 Победа</span>
          <span class="text-slate-400 text-xs transition-transform"
            :class="{ 'rotate-180': openSection === 'victory' }">▼</span>
        </button>
        <div v-if="openSection === 'victory'"
          class="px-4 py-3 bg-slate-700/30 rounded-xl text-sm text-slate-300 space-y-2">
          <p>Когда HP основной скалы достигнет нуля - ты победил!</p>
          <p>После победы можно:</p>
          <ul class="list-disc list-inside space-y-1 ml-1">
            <li><strong class="text-white">Повторить скалу</strong> - заново с теми же задачами</li>
            <li><strong class="text-white">Выбрать сайд-квест</strong> - если есть, сделать его основным</li>
            <li><strong class="text-white">Создать новую скалу</strong> - начать с чистого листа</li>
          </ul>
        </div>

        <button @click="toggleSection('data')"
          class="w-full flex items-center justify-between px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors text-left">
          <span class="text-sm font-medium text-white">💾 Данные</span>
          <span class="text-slate-400 text-xs transition-transform"
            :class="{ 'rotate-180': openSection === 'data' }">▼</span>
        </button>
        <div v-if="openSection === 'data'"
          class="px-4 py-3 bg-slate-700/30 rounded-xl text-sm text-slate-300 space-y-2">
          <p>Весь прогресс сохраняется в браузере автоматически.</p>
          <p><strong class="text-white">📤 Экспорт</strong> - скачай резервную копию в JSON.</p>
          <p><strong class="text-white">📥 Импорт</strong> - загрузи сохранение из файла.</p>
          <p><strong class="text-white">📦 Пресеты</strong> - готовые наборы целей для быстрого старта.</p>
          <p class="text-red-400/80 text-xs">⚠️ Сброс удалит все данные без возможности восстановления.</p>
        </div>

        <button @click="toggleSection('rock')"
          class="w-full flex items-center justify-between px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors text-left">
          <span class="text-sm font-medium text-white">🎮 Интерактив</span>
          <span class="text-slate-400 text-xs transition-transform"
            :class="{ 'rotate-180': openSection === 'rock' }">▼</span>
        </button>
        <div v-if="openSection === 'rock'"
          class="px-4 py-3 bg-slate-700/30 rounded-xl text-sm text-slate-300 space-y-2">
          <p>Нажми на скалу - она покачнётся и скажет что-нибудь забавное. HP не тратится.</p>
          <p>Звуки можно включить/выключить в настройках (🔊).</p>
          <p>Подсказки при наведении тоже настраиваются (💡).</p>
        </div>

      </div>
    </div>
  </div>
</template>
