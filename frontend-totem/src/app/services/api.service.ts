import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // ATENÇÃO: Se for testar no celular, troque localhost pelo seu IP (ex: http://192.168.0.15:3000/api)
  private API_URL = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) { }

  async solicitarSenha(tipo: 'SP' | 'SG' | 'SE') {
    return firstValueFrom(this.http.post<any>(`${this.API_URL}/senha`, { tipo_senha: tipo }));
  }
}