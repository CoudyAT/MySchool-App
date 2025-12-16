import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { ApiService } from 'src/app/core/services/api.service';

@Injectable({
    providedIn: 'root',
})
export class UploadService {
    private readonly api = inject(ApiService);

    constructor(private storage: Storage) { }

    async uploadCourseImage(file: File): Promise<string> {
        const filePath = `courses/${Date.now()}_${file.name}`;
        const storageRef = ref(this.storage, filePath);

        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    }
}
