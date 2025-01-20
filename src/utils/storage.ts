import { readTextFile, writeFile, exists, create } from '@tauri-apps/plugin-fs';
import { aes_gcm_decrypt, aes_gcm_encrypt } from './aes';
import { SecretI } from '../types/types';
import { invoke } from '@tauri-apps/api/core';
import { appLocalDataDir } from '@tauri-apps/api/path';

const file = "storage.enc";

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

    public async getStoragePath(): Promise<string> {
        await this.ensureStorageExists();
        return this.storageFile || '';
    }

    private async ensureStorageExists(): Promise<void> {
        if (!this.storageDir || !this.storageFile) {

            if (import.meta.env.DEV) {
                this.storageDir = await appLocalDataDir();
            } else {
                this.storageDir = await invoke<string>('get_app_path');
            }

            this.storageFile = `${this.storageDir}\\${file}`;

            const fileExists = await exists(this.storageFile);
            if (!fileExists) {
                await create(this.storageFile);
            }
        }
    }

    public setPassword(password: string | null): void {
        this.password = password;
    }

    public async validatePassword(password: string): Promise<boolean> {
        try {
            if (!this.storageDir || !this.storageFile) {

                if (import.meta.env.DEV) {
                    this.storageDir = await appLocalDataDir();
                } else {
                    this.storageDir = await invoke<string>('get_app_path');
                }

                this.storageFile = `${this.storageDir}\\${file}`;
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
        await this.ensureStorageExists();
        if (!this.storageFile) {
            throw new Error('Storage not initialized');
        }

        const encrypted = await aes_gcm_encrypt("[]", password);
        await writeFile(
            this.storageFile,
            new TextEncoder().encode(encrypted)
        );
        this.password = password;
    }

    public async get(): Promise<SecretI[]> {
        try {
            await this.ensureStorageExists();
            if (!this.storageFile) {
                throw new Error('Storage not initialized');
            }
            if (!this.password) {
                throw new Error('Password not set');
            }

            const content = await readTextFile(this.storageFile);
            const decrypted = await aes_gcm_decrypt(content, this.password);
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Error getting secrets:', error);
            return [];
        }
    }

    public async save(secrets: SecretI[]): Promise<void> {
        try {
            await this.ensureStorageExists();
            if (!this.storageFile) {
                throw new Error('Storage not initialized');
            }
            if (!this.password) {
                throw new Error('Password not set');
            }

            // Ensure all secrets have a folder property
            const secretsWithFolders = secrets.map(secret => ({
                ...secret,
                folder: secret.folder || ''
            }));

            const encrypted = await aes_gcm_encrypt(JSON.stringify(secretsWithFolders), this.password);
            await writeFile(
                this.storageFile,
                new TextEncoder().encode(encrypted)
            );
        } catch (error) {
            console.error('Error saving secrets:', error);
            throw error;
        }
    }

    public async getByFolder(folder: string): Promise<SecretI[]> {
        const secrets = await this.get();
        return secrets.filter(secret => (secret.folder || '') === folder);
    }

    public async getFolders(): Promise<string[]> {
        const secrets = await this.get();
        const folders = new Set(secrets.map(secret => secret.folder || '').filter(folder => folder !== ''));
        return Array.from(folders);
    }
}

const storage = StorageService.getInstance();
export default storage;
