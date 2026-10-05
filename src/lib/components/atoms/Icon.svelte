<script lang="ts">
  import {
    AlertTriangle,
    Archive,
    ArrowLeft,
    ArrowRight,
    AtSign,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Cloud,
    CloudCheck,
    Copy,
    FileText,
    History,
    Inbox,
    KeyRound,
    LayoutDashboard,
    Mail,
    MailOpen,
    MailPlus,
    MailWarning,
    Menu,
    Moon,
    PanelLeftClose,
    PanelLeftOpen,
    RefreshCw,
    RotateCcw,
    Search,
    SearchX,
    Settings2,
    Star,
    Sun,
    Trash2,
    Unlock,
    User,
    UserMinus,
    UserPlus,
    UserX,
    Users,
    X,
    Eye,
    EyeOff,
    Loader,
    LogIn,
    LogOut,
    Lock
  } from 'lucide-svelte';

  // lucide-svelte 1.x ships component declarations that clash with Svelte 5's
  // generic component type, so the map is typed loosely on purpose.
  type AnyComponent = typeof Cloud;

  const registry: Record<string, AnyComponent> = {
    dashboard: LayoutDashboard,
    group: Users,
    settings_input_component: Settings2,
    insights: LayoutDashboard,
    light_mode: Sun,
    dark_mode: Moon,
    logout: LogOut,
    login: LogIn,
    menu: Menu,
    menu_open: PanelLeftOpen,
    refresh: RefreshCw,
    person_add: UserPlus,
    person_off: UserX,
    person_remove: UserMinus,
    person: User,
    content_copy: Copy,
    lock_reset: RotateCcw,
    vpn_key: KeyRound,
    lock: Lock,
    lock_open: Unlock,
    visibility: Eye,
    visibility_off: EyeOff,
    hourglass_empty: Loader,
    arrow_forward: ArrowRight,
    arrow_back: ArrowLeft,
    cloud: Cloud,
    cloud_done: CloudCheck,
    star: Star,
    star_outline: Star,
    star_border: Star,
    chevron_left: ChevronLeft,
    chevron_right: ChevronRight,
    mail: Mail,
    mark_email_unread: MailWarning,
    mark_email_read: MailOpen,
    drafts: FileText,
    inbox: Inbox,
    archive: Archive,
    delete: Trash2,
    warning: AlertTriangle,
    check_circle: CheckCircle2,
    alternate_email: AtSign,
    search: Search,
    search_off: SearchX,
    close: X,
    history: History,
    mail_add: MailPlus,
    panel_close: PanelLeftClose,
    panel_open: PanelLeftOpen
  };

  export let name: string;
  export let size = 20;
  export let strokeWidth = 1.75;

  const Fallback: AnyComponent = Cloud;
  $: Glyph = registry[name] ?? Fallback;
</script>

<Glyph size={size} strokeWidth={strokeWidth} aria-hidden="true" />
