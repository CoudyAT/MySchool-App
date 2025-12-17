import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { ApiService } from 'src/app/core/services/api.service';

@Injectable({
    providedIn: 'root',
})
export class UploadService {
    private readonly api = inject(ApiService);

    constructor(private storage: Storage) { } // AngularFire Storage

    async uploadImage(file: File, folder: string): Promise<string> {
        const filePath = `${folder}/${Date.now()}_${file.name}`;
        const fileRef = ref(this.storage, filePath);

        await uploadBytes(fileRef, file);
        return getDownloadURL(fileRef);
    }
}
