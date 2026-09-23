/**
 * L6 — ICONS MODULE
 * Host: N02 | Affinity: visual/system component projection
 *
 * Raw SVG path registry extracted as a reusable system-component contract.
 * Legacy React icons.tsx remains untouched.
 */
export type IconCategory = "system" | "module" | "action" | "status";

export interface IconDefinition {
  name: string;
  svg: string;
  category: IconCategory;
}

export class IconsModule {
  readonly id = "icons" as const;
  private readonly icons = new Map<string, IconDefinition>();

  constructor() {
    this.registerDefaults();
  }

  register(name: string, svg: string, category: IconCategory = "system"): void {
    const normalized = name.trim();
    if (!normalized) throw new Error("ICON_NAME_REQUIRED");
    if (!svg.trim()) throw new Error("ICON_SVG_REQUIRED");
    this.icons.set(normalized, { name: normalized, svg, category });
  }

  get(name: string): IconDefinition | undefined {
    return this.icons.get(name);
  }

  getByCategory(category: IconCategory): IconDefinition[] {
    return [...this.icons.values()].filter(icon => icon.category === category);
  }

  list(): string[] {
    return [...this.icons.keys()].sort();
  }

  private registerDefaults(): void {
    this.register("brain", "M12 2C8 2 6 4 6 8c0 2 1 4 2 5v3h8v-3c1-1 2-3 2-5 0-4-2-6-6-6z", "module");
    this.register("eye", "M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5c-1.7-4.4-6-7.5-11-7.5z", "module");
    this.register("heart", "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z", "module");
    this.register("shield", "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z", "module");
    this.register("evolution", "M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7z", "module");
    this.register("governance", "M12 2L3 7v6l9 5 9-5V7l-9-5z", "module");
    this.register("monitors", "M3 3h18v12H3z M1 17h22v2H1z", "module");
    this.register("play", "M8 5v14l11-7z", "action");
    this.register("stop", "M6 6h12v12H6z", "action");
    this.register("send", "M2 21l21-9L2 3v7l15 2-15 2v7z", "action");
    this.register("clear", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z", "action");
    this.register("status-ok", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z", "status");
    this.register("status-warn", "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z", "status");
    this.register("status-error", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z", "status");
  }
}

export const iconsModule = new IconsModule();
