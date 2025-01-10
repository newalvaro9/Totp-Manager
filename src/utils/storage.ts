import { appDataDir } from '@tauri-apps/api/path';
import { readTextFile, writeFile, exists, create } from '@tauri-apps/plugin-fs';
import { aes_gcm_decrypt, aes_gcm_encrypt } from './aes';
import { SecretI } from '../types/types';

class StorageService {
    private static instance: StorageService;
    private storageDir: string | null = null;
    private storageFile: string | null = null;
    private password: string | null = null;

    private constructor() {
        console.log('Storage Service initialized');
    }

    public static getInstance(): StorageService {
        if (!StorageService.instance) {
            StorageService.instance = new StorageService();
        }
        return StorageService.instance;
    }

    public setPassword(password: string | null): void {
        this.password = password;
    }

    public async validatePassword(password: string): Promise<boolean> {
        try {
            if (!this.storageDir || !this.storageFile) {
                this.storageDir = await appDataDir();
                this.storageFile = `${this.storageDir}/storage.txt`;
            }

            const fileExists = await exists(this.storageFile);
            if (!fileExists) {
                // If no file exists, this is the first time setup
                return true;
            }

            const content = await readTextFile(this.storageFile);
            await aes_gcm_decrypt(content, password);
            return true;
        } catch (error) {
            console.error('Password validation failed:', error);
            return false;
        }
    }

    public async resetStorage(password: string): Promise<void> {
        if (!this.storageDir || !this.storageFile) {
            this.storageDir = await appDataDir();
            this.storageFile = `${this.storageDir}/storage.txt`;
        }

        const dirExists = await exists(this.storageDir);
        if (!dirExists) {
            await create(this.storageDir);
        }

        const encrypted = await aes_gcm_encrypt("[]", password);
        await writeFile(
            this.storageFile,
            new TextEncoder().encode(encrypted)
        );
        this.password = password;
    }

    private async ensureStorageExists(): Promise<void> {
        if (!this.password) {
            throw new Error('Password not set');
        }

        if (!this.storageDir || !this.storageFile) {
            this.storageDir = await appDataDir();
            this.storageFile = `${this.storageDir}/storage.txt`;
            console.log(this.storageFile);
            const dirExists = await exists(this.storageDir);
            if (!dirExists) {
                await create(this.storageDir);
            }

            const fileExists = await exists(this.storageFile);
            if (!fileExists) {
                const encrypted = await aes_gcm_encrypt("[]", this.password);
                await writeFile(
                    this.storageFile,
                    new TextEncoder().encode(encrypted)
                );
            }
        }
    }

    public async get(): Promise<SecretI[]> {
        try {
            await this.ensureStorageExists();
            if (!this.storageFile) {
                throw new Error('Storage not initialized');
            }

            const content = await readTextFile(this.storageFile);
            const decrypted = await aes_gcm_decrypt(content, this.password!);
            const data = JSON.parse(decrypted);
            return data || [];
        } catch (error) {
            console.error(`Failed to get storage:`, error);
            throw error;
        }
    }

    public async set(data: string): Promise<void> {
        try {
            await this.ensureStorageExists();
            if (!this.storageFile) {
                throw new Error('Storage not initialized');
            }

            const encrypted = await aes_gcm_encrypt(data, this.password!);
            await writeFile(
                this.storageFile,
                new TextEncoder().encode(encrypted)
            );
        } catch (error) {
            console.error(`Failed to set data:`, error);
            throw error;
        }
    }
}

const storage = StorageService.getInstance();
export default storage;
