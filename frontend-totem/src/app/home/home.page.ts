import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  constructor(
    private api: ApiService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async pedirSenha(tipo: 'SP' | 'SG' | 'SE', nomeTipo: string) {
    const loading = await this.loadingController.create({
      message: 'Imprimindo senha...',
      duration: 5000 
    });
    await loading.present();

    try {
      const resposta = await this.api.solicitarSenha(tipo);
      
      await loading.dismiss();

      const alert = await this.alertController.create({
        header: 'Sua Senha',
        subHeader: nomeTipo,
        message: resposta.senha, // Apenas a senha pura
        cssClass: 'senha-alert', // Vamos usar uma classe CSS para deixar grande
        buttons: ['OK'],
      });

      await alert.present();

    } catch (error) {
      await loading.dismiss();
      console.error(error);
      const alert = await this.alertController.create({
        header: 'Erro',
        message: 'Não foi possível comunicar com o servidor. Verifique se o Backend está rodando.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}