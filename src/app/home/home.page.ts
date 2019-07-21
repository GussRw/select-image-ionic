import {Component} from '@angular/core';
import {ActionSheetController, LoadingController, NavController} from '@ionic/angular';
import {Camera, CameraOptions} from '@ionic-native/camera/ngx';
import {Crop} from '@ionic-native/crop/ngx';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {Base64} from '@ionic-native/base64/ngx';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})

export class HomePage {

    image: SafeResourceUrl = '';

    constructor(public navCtrl: NavController,
                private actionSheetController: ActionSheetController,
                private camera: Camera,
                private loadingController: LoadingController,
                private base64: Base64,
                public crop: Crop,
                private domSanitizer: DomSanitizer,
    ) {

    }

    selectImage(source) {
        const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.FILE_URI,
            sourceType: source,
            saveToPhotoAlbum: false,
            correctOrientation: true
        };

        this.camera.getPicture(options).then((imagePath) => {
            this.crop.crop(imagePath, {quality: 75, targetHeight: -1, targetWidth: -1}).then((newImage) => {
                const loading = this.loadingController.create({
                    message: 'Loading...'
                }).then(res => {
                    res.present();
                    this.base64.encodeFile(newImage).then((base64File: string) => {
                        this.image = this.domSanitizer.bypassSecurityTrustResourceUrl(base64File);
                        this.loadingController.dismiss();
                    }, (err) => {
                    });
                });
            }, error => console.error('Error cropping image', error));
        }, (err) => {
            console.error('Error: ', err);
        });
    }

    async selectSource() {


        const actionSheet = await this.actionSheetController.create({
            header: 'Select Source',
            buttons: [{
                text: 'Device',
                icon: 'images',
                handler: () => {
                    this.selectImage(this.camera.PictureSourceType.PHOTOLIBRARY);
                }
            }, {
                text: 'Camera',
                icon: 'camera',
                handler: () => {
                    this.selectImage(this.camera.PictureSourceType.CAMERA);
                }
            }, {
                text: 'Cancel',
                icon: 'close',
                role: 'cancel',
                handler: () => {
                    console.log('Cancel clicked');
                }
            }]
        });
        await actionSheet.present();

        //this.selectImage(this.camera.PictureSourceType.CAMERA);

    }
}
