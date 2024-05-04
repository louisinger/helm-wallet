export class SilentiumAPI {
    constructor(private baseURL: string) { }


    async getBlockScalars(height: number): Promise<{ scalars: string[] }> {
        return { scalars: [] }
    }

    async getBlockFilter(height: number): Promise<string> {
        return ''
    }

    async getChainTipHeight(): Promise<number> {
        return 0
    }
}