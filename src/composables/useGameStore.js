import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'rock-breaker-state'

const goalName = ref('')
const durationDays = ref(0)
const tasks = ref([])
const isSetupComplete = ref(false)
const currentHp = ref(0)
const lastActiveDate = ref('')

let taskIdCounter = 0

const maxHp = computed(() => durationDays.value * 5)
const hpPercent = computed(() => (maxHp.value > 0 ? (currentHp.value / maxHp.value) * 100 : 0))
const canAddTask = computed(() => tasks.value.length < 5)
const isVictory = computed(() => isSetupComplete.value && currentHp.value <= 0)

function getTodayDate() {
	return new Date().toISOString().split('T')[0]
}

function saveToStorage() {
	const state = {
		goalName: goalName.value,
		durationDays: durationDays.value,
		tasks: tasks.value,
		isSetupComplete: isSetupComplete.value,
		currentHp: currentHp.value,
		lastActiveDate: lastActiveDate.value,
		taskIdCounter,
	}
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function loadFromStorage() {
	const saved = localStorage.getItem(STORAGE_KEY)
	if (!saved) return false

	try {
		const state = JSON.parse(saved)
		goalName.value = state.goalName || ''
		durationDays.value = state.durationDays || 0
		tasks.value = state.tasks || []
		isSetupComplete.value = state.isSetupComplete || false
		currentHp.value = state.currentHp || 0
		lastActiveDate.value = state.lastActiveDate || ''
		taskIdCounter = state.taskIdCounter || 0

		const today = getTodayDate()
		if (lastActiveDate.value && lastActiveDate.value !== today) {
			startNewDay()
		}
		lastActiveDate.value = today

		return true
	} catch {
		return false
	}
}

function startNewDay() {
	tasks.value.forEach((task) => {
		task.completed = false
	})
	lastActiveDate.value = getTodayDate()
	saveToStorage()
}

function createRock(name, days) {
	goalName.value = name
	durationDays.value = days
	currentHp.value = days * 5
	tasks.value = []
	taskIdCounter = 0
	lastActiveDate.value = getTodayDate()
	isSetupComplete.value = true
}

function addTask(text) {
	if (!canAddTask.value || !text.trim()) return
	tasks.value.push({
		id: ++taskIdCounter,
		text: text.trim(),
		completed: false,
	})
}

function removeTask(id) {
	const index = tasks.value.findIndex((t) => t.id === id)
	if (index !== -1) {
		tasks.value.splice(index, 1)
	}
}

function updateTask(id, newText) {
	const task = tasks.value.find((t) => t.id === id)
	if (task) {
		task.text = newText.trim()
	}
}

function toggleTask(id) {
	const task = tasks.value.find((t) => t.id === id)
	if (!task) return

	if (task.completed) {
		task.completed = false
		healRock()
	} else {
		task.completed = true
		hitRock()
	}
}

function healRock() {
	if (currentHp.value < maxHp.value) {
		currentHp.value++
	}
}

function hitRock() {
	if (currentHp.value > 0) {
		currentHp.value--
	}
}

function restartRock(newName, newDays) {
	goalName.value = newName
	durationDays.value = newDays
	currentHp.value = newDays * 5
	tasks.value.forEach((task) => {
		task.completed = false
	})
	lastActiveDate.value = getTodayDate()
}

function updateRock(newName, newDays) {
	const oldMaxHp = maxHp.value
	const damageDone = oldMaxHp - currentHp.value

	goalName.value = newName
	durationDays.value = newDays

	const newMaxHp = newDays * 5
	currentHp.value = Math.max(0, newMaxHp - damageDone)
}

function resetGame() {
	goalName.value = ''
	durationDays.value = 0
	currentHp.value = 0
	tasks.value = []
	taskIdCounter = 0
	lastActiveDate.value = ''
	isSetupComplete.value = false
	localStorage.removeItem(STORAGE_KEY)
}

function exportData() {
	const state = {
		goalName: goalName.value,
		durationDays: durationDays.value,
		tasks: tasks.value,
		currentHp: currentHp.value,
		lastActiveDate: lastActiveDate.value,
		taskIdCounter,
		exportedAt: new Date().toISOString(),
	}
	const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = `rock-breaker-${getTodayDate()}.json`
	a.click()
	URL.revokeObjectURL(url)
}

function importData(jsonString) {
	try {
		const state = JSON.parse(jsonString)
		goalName.value = state.goalName || ''
		durationDays.value = state.durationDays || 0
		tasks.value = state.tasks || []
		currentHp.value = state.currentHp || 0
		lastActiveDate.value = state.lastActiveDate || getTodayDate()
		taskIdCounter = state.taskIdCounter || 0
		isSetupComplete.value = true
		saveToStorage()
		return true
	} catch {
		return false
	}
}

watch(
	[goalName, durationDays, tasks, isSetupComplete, currentHp, lastActiveDate],
	() => {
		if (isSetupComplete.value) {
			saveToStorage()
		}
	},
	{ deep: true }
)

loadFromStorage()

export function useGameStore() {
	return {
		goalName,
		durationDays,
		tasks,
		currentHp,
		maxHp,
		hpPercent,
		isSetupComplete,
		canAddTask,
		isVictory,
		lastActiveDate,
		createRock,
		restartRock,
		updateRock,
		addTask,
		removeTask,
		updateTask,
		toggleTask,
		hitRock,
		resetGame,
		startNewDay,
		exportData,
		importData,
		loadFromStorage,
	}
}
