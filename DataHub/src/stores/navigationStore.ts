// DATEI: src/stores/navigationStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export interface TabSession {
  id: string;
  icon: string;
  path: string;
  breadcrumbs: { title: string; to?: string | object; disabled?: boolean }[];
  showNewButton: boolean;
}

export const useNavigationStore = defineStore('navigation', () => {
  const router = useRouter();

  // --- STATE ---
  const tabs = ref<TabSession[]>([
    {
      id: 'tab-1',
      icon: 'mdi-monitor-dashboard',
      path: '/',
      breadcrumbs: [{ title: 'Navigation', disabled: true }],
      showNewButton: false
    }
  ]);

  const activeTabId = ref<string>('tab-1');
  const onNewButtonClick = ref<(() => void) | null>(null);

  // --- GETTERS ---
  const activeTab = computed(() => 
    tabs.value.find(t => t.id === activeTabId.value) || tabs.value[0]
  );
  
  const breadcrumbs = computed(() => activeTab.value ? activeTab.value.breadcrumbs : []);
  const showNewButton = computed(() => activeTab.value ? activeTab.value.showNewButton : false);

  // --- ACTIONS ---
  function switchTab(id: string) {
    const targetTab = tabs.value.find(t => t.id === id);
    if (targetTab) {
      activeTabId.value = id;
      onNewButtonClick.value = null;
      router.push(targetTab.path);
    }
  }

  /**
   * NEU: Schließt einen Tab anhand seiner ID.
   */
  function closeTab(id: string) {
    // 1. Index finden
    const index = tabs.value.findIndex(t => t.id === id);
    if (index === -1) return;

    // Sonderfall: Wenn es der letzte verbleibende Tab ist
    if (tabs.value.length === 1) {
      // Wir löschen ihn nicht, sondern setzen ihn auf Startseite zurück
      const t = tabs.value[0];
      t.path = '/';
      t.icon = 'mdi-monitor-dashboard';
      t.breadcrumbs = [{ title: 'Navigation', disabled: true }];
      t.showNewButton = false;
      router.push('/');
      return;
    }

    // 2. Tab entfernen
    tabs.value.splice(index, 1);

    // 3. Wenn wir den AKTIVEN Tab geschlossen haben, müssen wir woanders hinspringen
    if (id === activeTabId.value) {
      // Wir versuchen, zum Tab links davon zu gehen. 
      // Wenn wir Index 0 geschlossen haben, gehen wir zum neuen Index 0.
      const newIndex = Math.max(0, index - 1);
      const newTab = tabs.value[newIndex];
      if (newTab) {
        switchTab(newTab.id);
      }
    }
  }

  function setContext(icon: string, crumbs: any[], enableNewBtn = false) {
    const tab = activeTab.value;
    if (tab) {
      tab.icon = icon;
      tab.breadcrumbs = crumbs;
      tab.showNewButton = enableNewBtn;
      onNewButtonClick.value = null;
    }
  }

  function updateActiveTabPath(newPath: string) {
    const tab = activeTab.value;
    if (tab) tab.path = newPath;
  }

  function setNewAction(callback: () => void) {
    onNewButtonClick.value = callback;
  }

  function addTab(targetPath?: string) {
    if (tabs.value.length >= 8) return;

    const newId = `tab-${Date.now()}`;
    
    // Wenn ein Pfad übergeben wurde, nutzen wir den, sonst Startseite
    const initialPath = targetPath || '/';
    
    // Kleiner Trick: Wenn wir direkt in ein Projekt springen, setzen wir ein generisches Icon,
    // das korrekte Icon (Becherglas) wird dann von der Seite selbst (onMounted) gesetzt.
    const initialIcon = targetPath ? 'mdi-loading' : 'mdi-monitor-dashboard';

    const newTab: TabSession = {
      id: newId,
      icon: initialIcon,
      path: initialPath,
      breadcrumbs: [{ title: 'Laden...', disabled: true }],
      showNewButton: false
    };

    tabs.value.push(newTab);
    switchTab(newId);
  }

  return { 
    tabs, 
    activeTabId, 
    addTab, 
    switchTab, 
    closeTab, // <-- Exportiert
    setContext, 
    updateActiveTabPath,
    breadcrumbs, 
    showNewButton, 
    onNewButtonClick, 
    setNewAction 
  };
});