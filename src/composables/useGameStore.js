import { ref, computed } from 'vue'

const goalName = ref('')
const durationDays = ref(0)
const tasks = ref([])
const isSetupComplete = ref(false)

const currentHp = computed(() => durationDays.value * 5)
const maxHp = computed(() => durationDays.value * 5)

function createRock(name, days) {
	goalName.value = name
	durationDays.value = days
	tasks.value = []
	isSetupComplete.value = true
}

function resetGame() {
	goalName.value = ''
	durationDays.value = 0
	tasks.value = []
	isSetupComplete.value = false
}

export function useGameStore() {
	return {
		goalName,
		durationDays,
		tasks,
		currentHp,
		maxHp,
		isSetupComplete,
		createRock,
		resetGame,
	}
}
