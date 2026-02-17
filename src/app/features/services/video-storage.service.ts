import { Injectable } from '@angular/core';
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from 'firebase/storage';

export interface StorageVideo {
    name: string;
    path: string;
    url: string;
    size?: number;
    duration?: number;
}

@Injectable({ providedIn: 'root' })
export class VideoStorageService {

    private storage = getStorage();

    // Lister toutes les vidéos dans un dossier
    async listVideos(folderPath: string = 'VIDEOS/'): Promise<StorageVideo[]> {
        const folderRef = ref(this.storage, folderPath);
        const result = await listAll(folderRef);

        const videos = await Promise.all(
            result.items.map(async (item) => {
                const url = await getDownloadURL(item);
                const metadata = await getMetadata(item);

                return {
                    name: item.name,
                    path: item.fullPath,
                    url,
                    size: metadata.size,
                } as StorageVideo;
            })
        );

        return videos;
    }

    // Récupérer l'URL d'une vidéo par son chemin
    async getVideoUrl(path: string): Promise<string> {
        const videoRef = ref(this.storage, path);
        return await getDownloadURL(videoRef);
    }
}