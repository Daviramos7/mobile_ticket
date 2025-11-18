```markdown
# Documentação da API - Sistema de Atendimento

O backend está rodando na porta **3000**.
Base URL: `http://SEU_IP_AQUI:3000` (veja abaixo como pegar seu IP).

---

## 🖥️ 1. Totem (Tela do Cliente)
**Objetivo:** Gerar uma nova senha.

- **Rota:** `POST /api/senha`
- **Body (JSON):**
  ```json
  { "tipo_senha": "SP" }  // Opções: "SP", "SG", "SE"
  ```

- **Retorno:**
  ```json
  {
    "senha": "251118-SP1",
    "numero": 1
  }
  ```

---

## 👨‍💼 2. Atendente (Mesa)

**Objetivo:** Chamar o próximo da fila (respeita prioridade SP > SE > SG).

### Chamar próxima senha
- **Rota:** `POST /api/chamar`
- **Body (JSON):**
  ```json
  { "guiche": 1 }
  ```

### Finalizar atendimento
- **Rota:** `POST /api/finalizar`
- **Body (JSON):**
  ```json
  { "id_atendimento": 5 }  // O ID vem no retorno do /chamar
  ```

---

## 📺 3. Painel (TV)

**Objetivo:** Mostrar as últimas chamadas. O frontend deve consultar essa rota a cada 5 segundos.

- **Rota:** `GET /api/painel`
- **Retorno:** Lista com as 5 últimas senhas.

---

## 📊 4. Gestor (Relatórios)

**Objetivo:** Mostrar estatísticas.

- **Rota:** `GET /api/relatorios/stats`
- **Retorno:** Quantidade de senhas emitidas/atendidas e Tempo Médio.

---

## 🌐 Importante: Como eles acessam sua máquina?

Como o servidor está no **seu** computador, se eles tentarem acessar `localhost:3000`, não vai funcionar (porque `localhost` é o computador *deles*).

Para que eles consigam usar sua API, vocês precisam estar na mesma rede Wi-Fi (ou usar um software como Ngrok). Assumindo a mesma rede:

1. Abra o terminal (PowerShell) e digite: `ipconfig`
2. Procure por **Endereço IPv4** (geralmente algo como `192.168.1.15` ou `10.0.0.5`).
3. Esse é o número que eles colocarão no código deles. Exemplo: `http://192.168.1.15:3000/api/senha`.

---