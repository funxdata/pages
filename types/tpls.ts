export interface Tpl {
    // deno-lint-ignore no-explicit-any
    renderString(template: string, data: Record<string, any>): Promise<string>;

    // deno-lint-ignore no-explicit-any
    renderStringAsync?(template: string, data: Record<string, any>): Promise<string>;

    // deno-lint-ignore no-explicit-any
    compile?(template: string, options?: Partial<any>): any;

    // deno-lint-ignore no-explicit-any
    configure?(customConfig: Partial<any>): void;
}