import { appDataDir } from '@tauri-apps/api/path';
import { readTextFile, writeFile, exists, create } from '@tauri-apps/plugin-fs';

class StorageService {
    private static instance: StorageService;
    private storageDir: string | null = null;
    private storageFile: string | null = null;

    private constructor() {
        console.log('Storage Service initialized');
    }

    public static getInstance(): StorageService {
        if (!StorageService.instance) {
            StorageService.instance = new StorageService();
        }
        return StorageService.instance;
    }

    private async ensureStorageExists(): Promise<void> {
        if (!this.storageDir || !this.storageFile) {
            this.storageDir = await appDataDir();
            this.storageFile = `${this.storageDir}/storage.json`;
            console.log(this.storageFile);
            const dirExists = await exists(this.storageDir);
            if (!dirExists) {
                await create(this.storageDir);
            }
        }
    }

    public async get(): Promise<string | null> {
        try {
            await this.ensureStorageExists();
            if (!this.storageFile) {
                throw new Error('Storage not initialized');
            }

            const content = await readTextFile(this.storageFile);
            const data = JSON.parse(content);
            return data || null;
        } catch (error) {
            console.error(`Failed to get storage:`, error);
            return null;
        }
    }

    public async set(data: string): Promise<void> {
        try {
            await this.ensureStorageExists();
            if (!this.storageFile) {
                throw new Error('Storage not initialized');
            }

            await writeFile(
                this.storageFile,
                new TextEncoder().encode(JSON.stringify(data, null, 2))
            );
        } catch (error) {
            console.error(`Failed to set data:`, error);
            throw error;
        }
    }
}

const storage = StorageService.getInstance();
export default storage;
